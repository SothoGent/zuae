"use client";
import { useState } from "react";
import { StepTrack } from "./step-track";
import { StepDocuments } from "./step-documents";
import { StepInstitution } from "./step-institution";
import { StepUniversities } from "./step-universities";
import { StepProgrammes } from "./step-programmes";
import { StepReview } from "./step-review";
import { StepProgress } from "./step-progress";
import type { ApplicationTrack } from "@/db/schema";

export function ApplyWizard({ nationality }: { nationality: string }) {
  const [step, setStep] = useState(1);
  const [track, setTrack] = useState<ApplicationTrack | null>(null);
  const [institution, setInstitution] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [programmes, setProgrammes] = useState<string[]>([]);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <div className="max-w-4xl mx-auto">
      <StepProgress current={step} total={6} />
      {step === 1 && <StepTrack onSelect={(t) => { setTrack(t); next(); }} />}
      {step === 2 && track && <StepDocuments track={track} onNext={next} onBack={back} />}
      {step === 3 && <StepInstitution onNext={(inst) => { setInstitution(inst); next(); }} onBack={back} />}
      {step === 4 && <StepUniversities selected={universities} onChange={setUniversities} onNext={next} onBack={back} />}
      {step === 5 && (
        <StepProgrammes
          track={track!}
          universityIds={universities}
          selected={programmes}
          onChange={setProgrammes}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 6 && (
        <StepReview
          track={track!}
          universityIds={universities}
          programmeIds={programmes}
          nationality={nationality}
          onBack={back}
        />
      )}
    </div>
  );
}