"use client";

import { useState } from "react";

// Step components
import { DocumentUpload } from "./document-upload"; // reuse existing
import { UniversitySelector } from "./university-selector";
import { ProgrammeSelector } from "./programme-selector";
import { ReviewSubmit } from "./review-submit";

export function SimpleApplyFlow({ userId }: { userId: string }) {
  const [step, setStep] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedProgrammes, setSelectedProgrammes] = useState<string[]>([]);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3,4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-navy-700' : 'bg-navy-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <DocumentUpload 
          userId={userId} 
          onComplete={() => { setDocumentsUploaded(true); nextStep(); }} 
        />
      )}
      {step === 2 && (
        <UniversitySelector 
          onSelect={setSelectedUniversity} 
          onNext={nextStep} 
          onBack={prevStep}
        />
      )}
      {step === 3 && (
        <ProgrammeSelector 
          universityId={selectedUniversity!} 
          maxSelections={3}
          onSelect={setSelectedProgrammes} 
          onNext={nextStep} 
          onBack={prevStep}
        />
      )}
      {step === 4 && (
        <ReviewSubmit 
          universityId={selectedUniversity!}
          programmeIds={selectedProgrammes}
          onBack={prevStep}
          onComplete={() => { /* redirect to applications */ }}
        />
      )}
    </div>
  );
}