import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-podea',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Podea Firestore Security Rules', () => {
  it('prevents unauthorized access to studios', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection('studios').doc('studio_1').get());
  });

  it('allows studio staff to read their own studio', async () => {
    const authedDb = testEnv.authenticatedContext('user_1', {
      studioId: 'studio_1',
      role: 'frontdesk'
    }).firestore();
    
    // Set up mock data (bypassing rules via admin)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('studios').doc('studio_1').set({ name: 'Test Studio' });
    });

    await assertSucceeds(authedDb.collection('studios').doc('studio_1').get());
  });

  it('prevents staff from modifying config if not admin', async () => {
    const practitionerDb = testEnv.authenticatedContext('user_2', {
      studioId: 'studio_1',
      role: 'practitioner'
    }).firestore();
    
    await assertFails(practitionerDb.collection('studios').doc('studio_1').collection('_config').doc('billing').set({ status: 'active' }));
  });

  it('allows studio admin to modify config', async () => {
    const adminDb = testEnv.authenticatedContext('admin_1', {
      studioId: 'studio_1',
      role: 'studio_admin'
    }).firestore();

    await assertSucceeds(adminDb.collection('studios').doc('studio_1').collection('_config').doc('billing').set({ status: 'active' }));
  });
  
  it('prevents frontdesk from reading clinical treatments', async () => {
    const frontdeskDb = testEnv.authenticatedContext('frontdesk_1', {
      studioId: 'studio_1',
      role: 'frontdesk'
    }).firestore();
    
    await assertFails(frontdeskDb.collection('studios').doc('studio_1').collection('treatments').doc('treat_1').get());
  });

  it('allows practitioner to read and write clinical treatments', async () => {
    const practitionerDb = testEnv.authenticatedContext('prac_1', {
      studioId: 'studio_1',
      role: 'practitioner'
    }).firestore();
    
    await assertSucceeds(practitionerDb.collection('studios').doc('studio_1').collection('treatments').doc('treat_1').set({ notes: 'Patient okay' }));
  });
});
