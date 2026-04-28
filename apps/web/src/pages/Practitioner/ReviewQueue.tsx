import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, functions } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { IntakeFormSubmission, IntakeFormTemplate, RiskFlag } from '@podea/shared-types/interfaces';
import { AlertTriangle, CheckCircle, FileText, ChevronRight, X } from 'lucide-react';

export const ReviewQueue = () => {
  const { claims } = useAuth();
  const studioId = claims?.studioId;

  const [submissions, setSubmissions] = useState<(IntakeFormSubmission & { id: string, templateTitle?: string, clientName?: string })[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studioId) fetchQueue();
  }, [studioId]);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const subsRef = collection(db, `studios/${studioId}/intake_submissions`);
      const q = query(subsRef, where('practitionerReviewed', '==', false));
      const snap = await getDocs(q);

      const loadedSubs = [];
      for (const d of snap.docs) {
        const subData = d.data() as IntakeFormSubmission;
        
        // Fetch Template Name
        let templateTitle = 'Unknown Form';
        if (subData.templateId) {
          const tplRef = doc(db, `studios/${studioId}/intake_templates`, subData.templateId);
          const tplSnap = await getDoc(tplRef);
          if (tplSnap.exists()) templateTitle = tplSnap.data().title;
        }

        // Fetch Client Name
        let clientName = 'Unknown Client';
        if (subData.clientId) {
          const clientRef = doc(db, `studios/${studioId}/clients`, subData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) clientName = `${clientSnap.data().firstName} ${clientSnap.data().lastName}`;
        }

        loadedSubs.push({ id: d.id, ...subData, templateTitle, clientName });
      }
      setSubmissions(loadedSubs);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSelect = async (sub: any) => {
    setSelectedSubmission(sub);
    // Fetch associated risk flags for this client
    try {
      const flagsRef = collection(db, `studios/${studioId}/risk_flags`);
      const q = query(flagsRef, where('clientId', '==', sub.clientId));
      const snap = await getDocs(q);
      setFlags(snap.docs.map(d => ({ id: d.id, ...d.data() } as RiskFlag)));
    } catch (e) {
      console.error("Failed to fetch risk flags", e);
    }
  };

  return (
    <div className="p-8 font-sans bg-[#F4EFEA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl text-[#1F2A37] mb-8">Needs Review</h1>
        
        <div className="flex gap-8">
          {/* Queue List */}
          <div className="w-1/3 flex flex-col gap-4">
            {isLoading && <p>Loading queue...</p>}
            {!isLoading && submissions.length === 0 && (
              <div className="bg-[#FCFAF8] p-8 rounded-2xl text-center border border-gray-200">
                <CheckCircle className="w-12 h-12 text-[#4A6C5C] mx-auto mb-4" />
                <h3 className="text-xl font-medium text-[#1F2A37]">All caught up!</h3>
                <p className="text-gray-500">No pending intake forms to review.</p>
              </div>
            )}
            {submissions.map(sub => (
              <button 
                key={sub.id}
                onClick={() => handleSelect(sub)}
                className={`flex items-center justify-between p-6 rounded-2xl transition-all shadow-sm ${selectedSubmission?.id === sub.id ? 'bg-[#1F2A37] text-white' : 'bg-white text-[#1F2A37] hover:border-[#C7A75D] border border-transparent'}`}
              >
                <div className="text-left">
                  <h4 className="font-serif text-xl mb-1">{sub.clientName}</h4>
                  <p className={`text-sm ${selectedSubmission?.id === sub.id ? 'text-gray-300' : 'text-gray-500'}`}>
                    {sub.templateTitle}
                  </p>
                </div>
                <ChevronRight className={selectedSubmission?.id === sub.id ? 'text-white' : 'text-gray-400'} />
              </button>
            ))}
          </div>

          {/* Review Panel */}
          <div className="w-2/3">
            {selectedSubmission ? (
              <ReviewPanel 
                submission={selectedSubmission} 
                flags={flags} 
                studioId={studioId!}
                onReviewed={() => {
                  setSelectedSubmission(null);
                  fetchQueue();
                }} 
              />
            ) : (
              <div className="bg-[#FCFAF8] border border-gray-200 rounded-[2rem] h-[600px] flex items-center justify-center text-gray-400 flex-col">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Select a submission to review the medical chart.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewPanel = ({ submission, flags, studioId, onReviewed }: { submission: any, flags: RiskFlag[], studioId: string, onReviewed: () => void }) => {
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const needsAck = criticalFlags.length > 0;

  const handleSignOff = async () => {
    if (needsAck && !acknowledged) return;
    setIsSubmitting(true);
    try {
      const reviewFn = httpsCallable(functions, 'reviewIntakeForm');
      await reviewFn({
        studioId,
        submissionId: submission.id,
        notes
      });
      onReviewed();
    } catch (e) {
      console.error(e);
      alert("Failed to review");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-soft flex flex-col h-[800px] overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-[#FCFAF8] flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-[#1F2A37] mb-2">{submission.clientName}</h2>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{submission.templateTitle}</span>
        </div>
      </div>

      {/* Critical Flags Alert */}
      {criticalFlags.length > 0 && (
        <div className="bg-[#FDF5F5] border-l-4 border-[#BE5A5A] p-6 m-8 rounded-r-xl">
          <div className="flex items-center text-[#BE5A5A] font-bold text-lg mb-2">
            <AlertTriangle className="mr-2" /> Critical Medical Flags
          </div>
          <ul className="list-disc ml-6 text-[#BE5A5A]">
            {criticalFlags.map(f => (
              <li key={f.id}>{f.description}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Data Review */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h3 className="text-xl font-medium text-[#374151] mb-6 mt-8">Raw Intake Answers</h3>
        <div className="grid grid-cols-2 gap-8">
          {Object.entries(submission.data).map(([key, val]) => (
            <div key={key} className="bg-[#FCFAF8] p-4 rounded-xl border border-gray-100">
              <span className="block text-sm text-gray-500 mb-1">{key}</span>
              <span className="block text-lg text-[#1F2A37] font-medium">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Practitioner Sign-off Area */}
      <div className="p-8 border-t border-gray-100 bg-[#FCFAF8]">
        <textarea 
          placeholder="Add clinical notes or contraindications observed..."
          className="w-full p-4 rounded-xl border border-gray-200 mb-6 bg-white outline-none focus:border-[#C7A75D]"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        
        {needsAck && (
          <label className="flex items-center mb-6 text-gray-700 cursor-pointer bg-white p-4 rounded-xl border border-gray-200">
            <input 
              type="checkbox" 
              className="w-5 h-5 mr-4 accent-[#BE5A5A]" 
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
            />
            <span className="font-medium text-[#BE5A5A]">I acknowledge the critical medical flags for this client and take clinical responsibility to proceed.</span>
          </label>
        )}

        <div className="flex justify-end gap-4">
          <button 
            disabled={isSubmitting || (needsAck && !acknowledged)}
            onClick={handleSignOff}
            className="bg-[#4A6C5C] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#3d5a4c] disabled:opacity-50 transition-colors flex items-center"
          >
            {isSubmitting ? 'Signing off...' : 'Acknowledge & Sign Off'}
            <CheckCircle className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
