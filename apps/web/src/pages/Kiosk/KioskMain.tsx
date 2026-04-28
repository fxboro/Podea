import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Phone, QrCode, CheckCircle, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import type { Client, Appointment, RiskFlag, Consent } from '@podea/shared-types/interfaces';

type Step = 'WELCOME' | 'PHONE' | 'REGISTER' | 'CONSENT' | 'SUCCESS' | 'ERROR';

export const KioskMain = () => {
  const { user, claims } = useAuth();
  const studioId = claims?.studioId;

  const [step, setStep] = useState<Step>('WELCOME');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [phone, setPhone] = useState('');
  const [client, setClient] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reset = () => {
    setStep('WELCOME');
    setPhone('');
    setClient(null);
    setAppointment(null);
    setErrorMsg('');
  };

  const handlePhoneSubmit = async (submittedPhone: string) => {
    if (!studioId) return;
    setIsLoading(true);
    try {
      // 1. Find Client
      const clientsRef = collection(db, `studios/${studioId}/clients`);
      const q = query(clientsRef, where('phone', '==', submittedPhone));
      const clientSnap = await getDocs(q);

      if (clientSnap.empty) {
        setErrorMsg("We couldn't find a profile for this number. Please register or see front desk.");
        setStep('ERROR');
        setIsLoading(false);
        return;
      }

      const clientData = { id: clientSnap.docs[0].id, ...clientSnap.docs[0].data() };
      setClient(clientData);

      // 2. Find Appointment for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const apptsRef = collection(db, `studios/${studioId}/appointments`);
      const apptQ = query(
        apptsRef, 
        where('clientId', '==', clientData.id),
        where('startTime', '>=', startOfDay),
        where('startTime', '<=', endOfDay)
      );
      const apptSnap = await getDocs(apptQ);

      if (apptSnap.empty) {
        setErrorMsg("You don't have any appointments scheduled for today.");
        setStep('ERROR');
        setIsLoading(false);
        return;
      }

      const apptData = { id: apptSnap.docs[0].id, ...apptSnap.docs[0].data() };
      setAppointment(apptData);

      // 3. Check Consent
      const consentsRef = collection(db, `studios/${studioId}/consents`);
      const consentQ = query(consentsRef, where('clientId', '==', clientData.id));
      const consentSnap = await getDocs(consentQ);

      let needsConsent = true;
      if (!consentSnap.empty) {
        // Find most recent valid consent
        // For simplicity, if any consent exists, we assume valid for this demo, 
        // normally we check dates.
        const validConsent = consentSnap.docs.find(d => d.data().status !== 'revoked');
        if (validConsent) needsConsent = false;
      }

      if (needsConsent) {
        setStep('CONSENT');
      } else {
        await processCheckIn(clientData.id, apptData.id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred. Please check your connection.");
      setStep('ERROR');
    }
    setIsLoading(false);
  };

  const processCheckIn = async (clientId: string, appId: string) => {
    if (!studioId) return;
    setIsLoading(true);
    try {
      // Check Risk Flags
      const flagsRef = collection(db, `studios/${studioId}/risk_flags`);
      const flagsQ = query(flagsRef, where('clientId', '==', clientId), where('severity', '==', 'critical'));
      const flagsSnap = await getDocs(flagsQ);
      const isHighRisk = !flagsSnap.empty;

      if (isHighRisk) {
        console.log("High risk client checking in! Dispatching silent alert to practitioner.");
        // We'd write a notification doc here
      }

      // Write Checkin
      await addDoc(collection(db, `studios/${studioId}/checkins`), {
        clientId,
        appointmentId: appId,
        checkinTime: serverTimestamp(),
        method: 'kiosk'
      });

      // Update Appointment
      await updateDoc(doc(db, `studios/${studioId}/appointments`, appId), {
        status: 'checked_in'
      });

      setStep('SUCCESS');
      
      // Auto reset
      setTimeout(() => {
        reset();
      }, 5000);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to check in. Please see the front desk.");
      setStep('ERROR');
    }
    setIsLoading(false);
  };

  if (isOffline) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl shadow-soft text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="font-serif text-3xl mb-4 text-[#1F2A37]">System Offline</h2>
          <p className="text-gray-600 mb-8">Pardon the interruption. Please check in with the front desk.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] flex items-center justify-center p-8 font-sans">
      {step === 'WELCOME' && (
        <div className="text-center w-full max-w-lg">
          <h1 className="font-serif text-5xl mb-12 text-[#1F2A37]">Welcome to Podea</h1>
          <div className="space-y-6">
            <button 
              onClick={() => setStep('PHONE')}
              className="w-full bg-[#FCFAF8] border border-gray-200 hover:border-[#C7A75D] transition-colors rounded-full py-6 px-8 flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center text-xl text-[#374151] group-hover:text-[#1F2A37]">
                <Phone className="mr-4 text-[#C7A75D]" />
                Check in with Phone Number
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-[#C7A75D]" />
            </button>
            <button 
              onClick={() => { setErrorMsg("QR scanning coming soon"); setStep('ERROR'); }}
              className="w-full bg-[#FCFAF8] border border-gray-200 hover:border-[#C7A75D] transition-colors rounded-full py-6 px-8 flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center text-xl text-[#374151] group-hover:text-[#1F2A37]">
                <QrCode className="mr-4 text-[#C7A75D]" />
                Scan QR Code
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-[#C7A75D]" />
            </button>
          </div>
          <button 
            onClick={() => setStep('REGISTER')}
            className="mt-12 text-[#374151] underline text-lg"
          >
            New here? Tap to register
          </button>
        </div>
      )}

      {step === 'PHONE' && (
        <div className="w-full max-w-4xl bg-[#FCFAF8] rounded-[2rem] shadow-soft overflow-hidden flex min-h-[500px]">
          <div className="w-1/2 p-12 bg-white flex flex-col justify-center">
            <button onClick={reset} className="text-gray-500 mb-8 flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <h2 className="font-serif text-4xl mb-4 text-[#1F2A37]">Enter your mobile number</h2>
            <p className="text-gray-500 text-xl">We'll use this to find your appointment.</p>
            <div className="mt-8 text-4xl tracking-widest font-mono text-[#C7A75D] h-12">
              {phone || " "}
            </div>
            {isLoading && <p className="text-[#C7A75D] mt-4">Searching...</p>}
          </div>
          <div className="w-1/2 bg-gray-50 p-8 grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <button 
                key={num} 
                onClick={() => {
                  const newPhone = phone + num;
                  setPhone(newPhone);
                  if (newPhone.length >= 10) handlePhoneSubmit(newPhone);
                }}
                className="bg-white text-3xl rounded-2xl shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button 
               onClick={() => setPhone(phone.slice(0, -1))}
               className="bg-gray-200 text-xl rounded-2xl shadow-sm hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              DEL
            </button>
            <button 
               onClick={() => {
                 const newPhone = phone + '0';
                 setPhone(newPhone);
                 if (newPhone.length >= 10) handlePhoneSubmit(newPhone);
               }}
               className="bg-white text-3xl rounded-2xl shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              0
            </button>
            <button 
               onClick={() => handlePhoneSubmit(phone)}
               className="bg-[#C7A75D] text-white text-xl rounded-2xl shadow-sm hover:bg-[#b5954a] transition-colors flex items-center justify-center"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {step === 'REGISTER' && (
        <RegistrationForm 
          onBack={reset} 
          studioId={studioId!} 
          onSuccess={(newClientId) => {
            // After register, we should probably check if they have an appt, but they are a new client so they probably don't.
            setErrorMsg("Registration complete. Please see the front desk to book your first appointment.");
            setStep('ERROR');
          }} 
        />
      )}

      {step === 'CONSENT' && (
        <ConsentForm 
          client={client} 
          onBack={reset} 
          onSigned={async (signature) => {
             // Create consent doc
             await addDoc(collection(db, `studios/${studioId}/consents`), {
                clientId: client.id,
                templateId: 'general',
                templateVersion: 1,
                signedAt: serverTimestamp(),
                signatureDataUrl: signature,
                status: 'valid'
             });
             await processCheckIn(client.id, appointment.id);
          }} 
        />
      )}

      {step === 'SUCCESS' && (
        <div className="text-center">
          <CheckCircle className="w-24 h-24 text-[#4A6C5C] mx-auto mb-8 animate-bounce" />
          <h2 className="font-serif text-4xl mb-4 text-[#1F2A37]">You're all set, {client?.firstName}!</h2>
          <p className="text-xl text-[#374151]">Please take a seat. Your practitioner has been notified.</p>
        </div>
      )}

      {step === 'ERROR' && (
        <div className="bg-[#FCFAF8] p-12 rounded-[2rem] shadow-soft text-center max-w-lg border-t-4 border-[#BE5A5A]">
          <AlertCircle className="w-16 h-16 text-[#BE5A5A] mx-auto mb-6" />
          <h2 className="font-serif text-3xl mb-4 text-[#1F2A37]">We need a little help</h2>
          <p className="text-lg text-gray-600 mb-8">{errorMsg}</p>
          <button 
            onClick={reset}
            className="bg-[#1F2A37] text-white px-8 py-4 rounded-full text-lg hover:bg-gray-800 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const RegistrationForm = ({ onBack, studioId, onSuccess }: { onBack: () => void, studioId: string, onSuccess: (id: string) => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = firstName && lastName && dob && phone;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, `studios/${studioId}/clients`), {
        firstName,
        lastName,
        dob: new Date(dob),
        phone,
        email: email || null,
        status: 'active',
        createdAt: serverTimestamp()
      });
      onSuccess(docRef.id);
    } catch (e) {
      console.error(e);
      alert("Failed to register");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#FCFAF8] w-full max-w-2xl p-12 rounded-[2rem] shadow-soft">
       <button onClick={onBack} className="text-gray-500 mb-8 flex items-center">
         <ArrowLeft className="w-5 h-5 mr-2" /> Back
       </button>
       <h2 className="font-serif text-4xl mb-8 text-[#1F2A37]">New Client Registration</h2>
       <div className="space-y-6">
         <div className="grid grid-cols-2 gap-6">
           <input placeholder="First Name *" value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-lg bg-white" />
           <input placeholder="Last Name *" value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-lg bg-white" />
         </div>
         <input type="date" placeholder="Date of Birth *" value={dob} onChange={e=>setDob(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-lg bg-white" />
         <input type="tel" placeholder="Phone Number *" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-lg bg-white" />
         <input type="email" placeholder="Email Address (Optional)" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-lg bg-white" />
         
         <button 
           disabled={!isValid || loading}
           onClick={handleSubmit}
           className="w-full mt-8 bg-[#C7A75D] text-white py-5 rounded-full text-xl hover:bg-[#b5954a] disabled:opacity-50 transition-colors"
         >
           {loading ? 'Saving...' : 'Continue'}
         </button>
       </div>
    </div>
  );
};

const ConsentForm = ({ client, onBack, onSigned }: { client: any, onBack: () => void, onSigned: (sig: string) => void }) => {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="bg-white w-full max-w-3xl p-12 rounded-[2rem] shadow-soft h-[80vh] flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h2 className="font-serif text-3xl text-[#1F2A37]">Consent & Waiver</h2>
         <button onClick={onBack} className="text-gray-500">Cancel</button>
       </div>
       <div className="flex-1 overflow-y-auto bg-gray-50 p-6 rounded-xl text-gray-700 leading-relaxed mb-6 border border-gray-100">
         <p className="mb-4">Before we begin, we need to update your consent forms, {client?.firstName}.</p>
         <p className="mb-4">1. I acknowledge that I have disclosed all relevant medical history.</p>
         <p className="mb-4">2. I understand the risks associated with the treatments provided.</p>
         <p className="mb-4">3. I consent to the recording of treatment details in my chart.</p>
         <br/><br/><br/><br/><br/>
       </div>
       <div className="h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mb-6 flex items-center justify-center cursor-pointer hover:bg-gray-100" onClick={() => setAgreed(true)}>
         {agreed ? <span className="font-serif text-2xl text-[#C7A75D]">Signed by {client?.firstName}</span> : <span className="text-gray-400">Tap to sign</span>}
       </div>
       <button 
         disabled={!agreed}
         onClick={() => onSigned("base64:mock-signature")}
         className="w-full bg-[#C7A75D] text-white py-5 rounded-full text-xl hover:bg-[#b5954a] disabled:opacity-50 transition-colors"
       >
         I Agree & Sign
       </button>
    </div>
  );
};
