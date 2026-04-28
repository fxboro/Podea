import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Appointment, Client, RiskFlag, Treatment } from '@podea/shared-types/interfaces';
import { AlertTriangle, CheckSquare, Square, Save, ArrowLeft, Camera, ShoppingBag } from 'lucide-react';
import { Button } from '@podea/ui';

export const TreatmentWorkspace = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, claims } = useAuth();
  const studioId = claims?.studioId;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [treatment, setTreatment] = useState<Treatment | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [beforePhotoUrls, setBeforePhotoUrls] = useState<string[]>([]);
  const [afterPhotoUrls, setAfterPhotoUrls] = useState<string[]>([]);

  // Form State
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    verifiedIdentity: false,
    reviewedConsent: false,
    discussedRisks: false,
    tookBeforePhotos: false
  });

  useEffect(() => {
    if (studioId && appointmentId) {
      loadWorkspace();
    }
  }, [studioId, appointmentId]);

  const loadWorkspace = async () => {
    setIsLoading(true);
    try {
      // 1. Load Appointment
      const apptRef = doc(db, `studios/${studioId}/appointments`, appointmentId!);
      const apptSnap = await getDoc(apptRef);
      if (!apptSnap.exists()) {
        alert("Appointment not found");
        return;
      }
      const apptData = { id: apptSnap.id, ...apptSnap.data() } as Appointment;
      setAppointment(apptData);

      // 2. Load Client
      const clientRef = doc(db, `studios/${studioId}/clients`, apptData.clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) setClient({ id: clientSnap.id, ...clientSnap.data() } as Client);

      // 3. Load Risk Flags
      const flagsRef = collection(db, `studios/${studioId}/risk_flags`);
      const q = query(flagsRef, where('clientId', '==', apptData.clientId));
      const flagsSnap = await getDocs(q);
      setFlags(flagsSnap.docs.map(d => ({ id: d.id, ...d.data() } as RiskFlag)));

      // 4. Load or Initialize Treatment Chart
      const treatmentsRef = collection(db, `studios/${studioId}/treatments`);
      const tq = query(treatmentsRef, where('appointmentId', '==', apptData.id));
      const tSnap = await getDocs(tq);
      
      if (!tSnap.empty) {
        const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Treatment;
        setTreatment(tData);
        setNotes(tData.notes || '');
        if (tData.chartingData?.checklist) {
          setChecklist(tData.chartingData.checklist);
        }
        if (tData.beforePhotoUrls) setBeforePhotoUrls(tData.beforePhotoUrls);
        if (tData.afterPhotoUrls) setAfterPhotoUrls(tData.afterPhotoUrls);
      } else {
        // We don't create it in DB yet, wait for save
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSave = async (complete: boolean = false) => {
    if (!studioId || !appointment || !user) return;
    setIsSaving(true);
    try {
      const treatmentData: Partial<Treatment> = {
        clientId: appointment.clientId,
        appointmentId: appointment.id,
        staffId: user.uid,
        notes,
        beforePhotoUrls,
        afterPhotoUrls,
        chartingData: { checklist }
      };

      if (treatment?.id) {
        await updateDoc(doc(db, `studios/${studioId}/treatments`, treatment.id), {
          ...treatmentData,
          updatedAt: serverTimestamp()
        });
      } else {
        const docRef = doc(collection(db, `studios/${studioId}/treatments`));
        await setDoc(docRef, {
          ...treatmentData,
          createdAt: serverTimestamp()
        });
        setTreatment({ id: docRef.id, ...treatmentData } as Treatment);
      }

      if (complete) {
        await updateDoc(doc(db, `studios/${studioId}/appointments`, appointment.id), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
        navigate('/dashboard'); // Go back to schedule
      } else {
        alert("Saved successfully.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save treatment.");
    }
    setIsSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!studioId || !appointmentId) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, `studios/${studioId}/treatments/${appointmentId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (type === 'before') {
        setBeforePhotoUrls(prev => [...prev, url]);
      } else {
        setAfterPhotoUrls(prev => [...prev, url]);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Photo upload failed. Please check your connection.');
    }
    setIsUploading(false);
  };

  if (isLoading) return <div className="p-8">Loading Chart...</div>;
  if (!client) return <div className="p-8">Client not found</div>;

  const criticalFlags = flags.filter(f => f.severity === 'critical');

  return (
    <div className="bg-[#F4EFEA] min-h-screen font-sans pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-[#1F2A37]">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="font-serif text-2xl text-[#1F2A37]">{client.firstName} {client.lastName}</h1>
            <span className="text-sm text-gray-500">Appt: {appointment?.startTime?.toDate?.()?.toLocaleTimeString() || 'Today'}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSave(true)} disabled={isSaving}>
            Complete Session
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Left Column: Context & Flags */}
        <div className="space-y-6">
          {/* Medical Alerts */}
          {criticalFlags.length > 0 && (
            <div className="bg-[#FDF5F5] border-l-4 border-[#BE5A5A] p-5 rounded-r-xl shadow-sm">
              <div className="flex items-center text-[#BE5A5A] font-bold mb-2">
                <AlertTriangle className="mr-2 w-5 h-5" /> MEDICAL ALERTS
              </div>
              <ul className="list-disc ml-6 text-[#BE5A5A] text-sm space-y-1">
                {criticalFlags.map(f => <li key={f.id}>{f.description}</li>)}
              </ul>
            </div>
          )}

          {/* Upsell Suggestions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center text-[#C7A75D] font-medium mb-4">
              <ShoppingBag className="w-5 h-5 mr-2" /> Upsell Suggestions
            </div>
            <div className="bg-[#FCFAF8] p-4 rounded-xl border border-[#C7A75D]/20">
              <h4 className="font-medium text-[#1F2A37] mb-1">Hydration Mask Add-on</h4>
              <p className="text-sm text-gray-500 mb-3">+15 mins • $45.00</p>
              <button className="text-sm font-medium text-[#C7A75D] hover:underline">Add to Session</button>
            </div>
          </div>
        </div>

        {/* Middle/Right Column: Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pre-Treatment Checklist */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-[#1F2A37] mb-4">Pre-Treatment Checklist</h3>
            <div className="space-y-3">
              {Object.entries(checklist).map(([key, val]) => (
                <button 
                  key={key}
                  onClick={() => setChecklist(prev => ({ ...prev, [key]: !val }))}
                  className="flex items-center w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {val ? <CheckSquare className="w-6 h-6 text-[#4A6C5C] mr-3" /> : <Square className="w-6 h-6 text-gray-300 mr-3" />}
                  <span className={val ? 'text-gray-900 line-through opacity-70' : 'text-gray-700'}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Treatment Notes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <h3 className="text-lg font-medium text-[#1F2A37] mb-4">Clinical Notes</h3>
            <textarea 
              className="flex-1 w-full p-4 rounded-xl border border-gray-200 bg-[#FCFAF8] focus:border-[#C7A75D] outline-none resize-none"
              placeholder="Record treatment parameters, skin reactions, and post-care instructions given..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Photo Documentation */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-[#1F2A37] mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-gray-400" /> Photo Documentation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photos */}
              <div className="flex flex-col gap-2">
                <label className={`h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                  <input type="file" className="hidden" accept="image/*" capture="environment" disabled={isUploading} onChange={(e) => handlePhotoUpload(e, 'before')} />
                  + Add Before Photo
                </label>
                {beforePhotoUrls.map((url, idx) => (
                  <img key={idx} src={url} alt="Before" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                ))}
              </div>

              {/* After Photos */}
              <div className="flex flex-col gap-2">
                <label className={`h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                  <input type="file" className="hidden" accept="image/*" capture="environment" disabled={isUploading} onChange={(e) => handlePhotoUpload(e, 'after')} />
                  + Add After Photo
                </label>
                {afterPhotoUrls.map((url, idx) => (
                  <img key={idx} src={url} alt="After" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
