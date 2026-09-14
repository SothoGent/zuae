"use client";

type StepProgressProps = {
  currentStep: number;
  steps: string[];
};

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <nav aria-label="Application progress" className="mb-8">
      <ol className="grid grid-cols-6 gap-2">
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = number < currentStep;
          const active = number === currentStep;
          return (
            <li key={label} className="min-w-0">
              <div className={`h-1.5 rounded-full ${number <= currentStep ? "bg-zim-green" : "bg-navy-100"}`} />
              <div className="mt-2 flex items-start gap-2">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${complete || active ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-soft"}`}>
                  {complete ? "✓" : number}
                </span>
                <span className={`hidden text-[11px] font-bold leading-tight sm:block ${active ? "text-navy-900" : "text-ink-soft"}`}>
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-bold tracking-[0.18em] text-zim-green uppercase">Step {currentStep} of {steps.length}</p>
    </nav>
  );
}
