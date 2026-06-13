import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as crypto from 'crypto';
import { AuditLogger } from './lib/AuditLogger';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';



const PADDLE_WEBHOOK_SECRET = defineSecret('PADDLE_WEBHOOK_SECRET');

admin.initializeApp();

/**
 * Callable Function explicitly used to assign roles and studio links.
 * Restricted to platform_admin or a studio_admin modifying their own staff.
 */
export const setCustomUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Es dürfen nur autorisierte Benutzer Rollen vergeben.'
    );
  }

  const callerUid = context.auth.uid;
  const callerClaims = context.auth.token;
  const targetUid = data.targetUid;
  const newRole = data.role; 
  const targetStudioId = data.studioId;

  if (callerClaims.role !== 'platform_admin') {
    if (callerClaims.role !== 'studio_admin' || callerClaims.studioId !== targetStudioId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Sie haben keine Berechtigung, Personal für dieses Studio zu bearbeiten.'
      );
    }
  }

  if (newRole === 'platform_admin' && callerClaims.role !== 'platform_admin') {
     throw new functions.https.HttpsError('permission-denied', 'Unzulässige Rollenerweiterung.');
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, {
      studioId: targetStudioId,
      role: newRole
    });

    await AuditLogger.logEvent(targetStudioId, 'ROLE_ASSIGNED', {
      targetUid: targetUid,
      assignedBy: callerUid,
      newRole: newRole
    });

    return { success: true, message: `Rolle ${newRole} erfolgreich vergeben.` };
  } catch (error) {
    console.error('Error assigning claims', error);
    throw new functions.https.HttpsError('internal', 'Ein interner Fehler ist aufgetreten.');
  }
});


/**
 * Webhook Listener for Paddle / PayPal Subscription Activations.
 * This provisions the Studio and sets the initial Studio Admin claims.
 */
export const onSubscriptionCreated = functions.runWith({ secrets: [PADDLE_WEBHOOK_SECRET] }).https.onRequest(async (req, res) => {
  // NOTE: In production, explicitly verify the Webhook Signature from Paddle/PayPal here
  const webhookSecret = PADDLE_WEBHOOK_SECRET.value();
  if (req.headers['x-paddle-signature'] !== webhookSecret && process.env.FUNCTIONS_EMULATOR !== "true") {
      console.warn("Invalid webhook signature attempt.");
      res.status(401).send("Unauthorized webhook signature.");
      return;
  }
  
  const payload = req.body;
  const firebaseUid = payload.passthrough_uid || payload.custom_id; // Identity linked during checkout
  const subscriptionId = payload.subscription_id;
  const newStudioId = `studio_${Date.now()}`;

  if (!firebaseUid || !subscriptionId) {
     res.status(400).send('Missing identity or subscription payload.');
     return;
  }

  try {
    // 0. Fetch the draft data to get the real studio name
    const draftDoc = await admin.firestore().collection('onboarding_drafts').doc(firebaseUid).get();
    const draftData = draftDoc.data() || {};
    const studioName = draftData.studioName || 'Unbenanntes Studio';

    // 1. Provision the initial Database Footprint
    await admin.firestore().collection('studios').doc(newStudioId).set({
      name: studioName,
      ownerUid: firebaseUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await admin.firestore().collection('studios').doc(newStudioId).collection('_config').doc('billing').set({
      subscriptionId: subscriptionId,
      status: 'active',
      gateway: 'paddle',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Inject `studio_admin` Claims to the freshly registered User
    await admin.auth().setCustomUserClaims(firebaseUid, {
      studioId: newStudioId,
      role: 'studio_admin',
      tier: 'premium'
    });

    console.log(`Successfully provisioned Studio: ${newStudioId} for User: ${firebaseUid}`);
    res.status(200).send('Webhook processed, studio provisioned.');
  } catch (error) {
    console.error('Provisioning failed:', error);
    res.status(500).send('Internal Provisioning Error');
  }
});

/**
 * Creates a pending invitation for a studio.
 */
export const createInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not logged in.');
  
  const { email, role, studioId } = data;
  const callerClaims = context.auth.token;

  if (callerClaims.role !== 'platform_admin' && (callerClaims.role !== 'studio_admin' || callerClaims.studioId !== studioId)) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized to invite staff.');
  }

  const inviteId = Buffer.from(`${email}_${studioId}_${Date.now()}`).toString('base64').replace(/=/g, '');
  
  await admin.firestore().collection('invites').doc(inviteId).set({
    email,
    role,
    studioId,
    invitedBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });

  // NOTE: In production, send an email via SendGrid/Postmark here
  return { inviteLink: `https://podea.app/join/${inviteId}` };
});

/**
 * Accepts an invitation and sets custom claims.
 */
export const acceptInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not logged in.');
  
  const { inviteId } = data;
  const user = context.auth;

  const inviteDoc = await admin.firestore().collection('invites').doc(inviteId).get();
  if (!inviteDoc.exists) throw new functions.https.HttpsError('not-found', 'Invitation invalid or expired.');
  
  const inviteData = inviteDoc.data()!;
  
  // Security check: Email must match (if provided in invite)
  // if (inviteData.email !== user.token.email) {
  //   throw new functions.https.HttpsError('permission-denied', 'Email mismatch.');
  // }

  await admin.auth().setCustomUserClaims(user.uid, {
    studioId: inviteData.studioId,
    role: inviteData.role
  });

  await admin.firestore().collection(`studios/${inviteData.studioId}/staff`).doc(user.uid).set({
    uid: user.uid,
    email: user.token.email || '',
    role: inviteData.role,
    joinedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await AuditLogger.logEvent(inviteData.studioId, 'INVITE_ACCEPTED', {
    uid: user.uid,
    role: inviteData.role
  });

  await admin.firestore().collection('invites').doc(inviteId).delete();

  return { success: true, studioId: inviteData.studioId };
});

/**
 * Automatically sync Custom Claims when a staff document is updated.
 */
export const syncUserClaims = functions.firestore
  .document('studios/{studioId}/staff/{userId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Only update if role changed
    if (newValue.role === previousValue.role) {
      return null;
    }

    const { studioId, userId } = context.params;

    try {
      await admin.auth().setCustomUserClaims(userId, {
        studioId: studioId,
        role: newValue.role
      });

      await AuditLogger.logEvent(studioId, 'ROLE_UPDATED_VIA_SYNC', {
        uid: userId,
        oldRole: previousValue.role,
        newRole: newValue.role
      });

      console.log(`Synced claims for user ${userId} to role ${newValue.role}`);
    } catch (error) {
      console.error(`Failed to sync claims for user ${userId}:`, error);
    }
    return null;
  });

export * from './compliance';
export * from './inventory';
export * from './integrations';

export const initiateStudioOnboarding = functions.https.onCall(async (data, context) => {
  const {
    firstName,
    lastName,
    studioName,
    email,
    streetName,
    streetNumber,
    cityName,
    cityCode,
    state,
    country
  } = data;

  if (!firstName || !lastName || !studioName || !email || !streetName || !streetNumber || !cityName || !state || !country) {
    throw new functions.https.HttpsError('invalid-argument', 'Pflichtfelder fehlen.');
  }

  // Enforce studioName (username) uniqueness
  const existingStudios = await admin.firestore().collection('studios').where('name', '==', studioName).limit(1).get();
  if (!existingStudios.empty) {
    throw new functions.https.HttpsError('already-exists', 'Dieser Studio-Name ist bereits registriert.');
  }

  const existingDrafts = await admin.firestore().collection('pending_onboardings').where('studioName', '==', studioName).limit(1).get();
  if (!existingDrafts.empty) {
    throw new functions.https.HttpsError('already-exists', 'Dieser Studio-Name befindet sich bereits in der Registrierung.');
  }

  // Generate 7-day token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  await admin.firestore().collection('pending_onboardings').doc(token).set({
    firstName,
    lastName,
    studioName,
    email,
    address: {
      streetName,
      streetNumber,
      cityName,
      cityCode: cityCode || '',
      state,
      country
    },
    expiresAt,
    createdAt: FieldValue.serverTimestamp()
  });

  // Mock sending email - in production this would integrate with postmark/sendgrid
  console.log(`[EMAIL SEND] Confirmation link for ${email}: https://podea.app/verify-email?token=${token}`);

  return { success: true, message: 'Bestätigungs-E-Mail wurde gesendet.', token };
});

export const completeStudioOnboarding = functions.https.onCall(async (data, context) => {
  const { token, password } = data;
  if (!token || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Token und Passwort sind erforderlich.');
  }

  // Password alphanumeric validation (must contain at least one letter and one number)
  const isAlphanumeric = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password) && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  if (!isAlphanumeric || password.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'Das Passwort muss mindestens 8 Zeichen lang sein und sowohl Buchstaben als auch Zahlen enthalten.');
  }

  const tokenDoc = await admin.firestore().collection('pending_onboardings').doc(token).get();
  if (!tokenDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Ungültiger oder abgelaufener Bestätigungslink.');
  }

  const onboardingData = tokenDoc.data()!;
  const expiresAt = (onboardingData.expiresAt as Timestamp).toDate();
  if (expiresAt < new Date()) {
    await admin.firestore().collection('pending_onboardings').doc(token).delete();
    throw new functions.https.HttpsError('deadline-exceeded', 'Der Bestätigungslink ist abgelaufen (Gültigkeit max. 7 Tage).');
  }

  try {
    // Create firebase user
    const userRecord = await admin.auth().createUser({
      email: onboardingData.email,
      password,
      displayName: `${onboardingData.firstName} ${onboardingData.lastName}`
    });

    const newStudioId = `studio_${Date.now()}`;

    // Provision Studio
    await admin.firestore().collection('studios').doc(newStudioId).set({
      id: newStudioId,
      name: onboardingData.studioName,
      ownerUid: userRecord.uid,
      ownerName: `${onboardingData.firstName} ${onboardingData.lastName}`,
      address: onboardingData.address,
      timezone: 'Europe/Berlin',
      currency: 'EUR',
      status: 'active',
      createdAt: FieldValue.serverTimestamp()
    });

    // Create staff document
    await admin.firestore().collection(`studios/${newStudioId}/staff`).doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: onboardingData.email,
      role: 'studio_admin',
      joinedAt: FieldValue.serverTimestamp()
    });

    // Set Custom Claims directly to premium (checkout suspended for now)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      studioId: newStudioId,
      role: 'studio_admin',
      tier: 'premium'
    });

    // Clean up onboarding token
    await admin.firestore().collection('pending_onboardings').doc(token).delete();

    // Mock sending welcome email
    console.log(`[EMAIL SEND] Welcome email sent to ${onboardingData.email}`);

    // Create custom login token so the client can sign in immediately
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return { success: true, customToken };
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Onboarding konnte nicht abgeschlossen werden.');
  }
});

export const resolveStudioName = functions.https.onCall(async (data, context) => {
  const { studioName } = data;
  if (!studioName) {
    throw new functions.https.HttpsError('invalid-argument', 'Studio-Name fehlt.');
  }

  const studios = await admin.firestore().collection('studios').where('name', '==', studioName).limit(1).get();
  if (studios.empty) {
    throw new functions.https.HttpsError('not-found', 'Studio mit diesem Namen nicht gefunden.');
  }

  const studioDoc = studios.docs[0];
  const ownerUid = studioDoc.data().ownerUid;
  const user = await admin.auth().getUser(ownerUid);

  return { email: user.email };
});

export const verifyOnboardingToken = functions.https.onCall(async (data, context) => {
  const { token } = data;
  if (!token) return { valid: false };
  const docVal = await admin.firestore().collection('pending_onboardings').doc(token).get();
  if (!docVal.exists) return { valid: false };
  const expiresAt = (docVal.data()!.expiresAt as Timestamp).toDate();
  if (expiresAt < new Date()) {
    await admin.firestore().collection('pending_onboardings').doc(token).delete();
    return { valid: false };
  }
  return { valid: true };
});


