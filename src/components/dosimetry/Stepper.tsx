import { cn } from "@/lib/utils";
import React from "react";

interface StepperProps {
  currentPhase: number;
  setPhase: (phase: number) => void;
}

const phases = ["1ª Fase", "2ª Fase", "3ª Fase"];

export function Stepper({ currentPhase, setPhase }: StepperProps) {
  return (
    <div className="flex justify-center items-center w-full mb-4">
      <div className="flex items-center">
        {phases.map((phase, index) => {
          const phaseNumber = index + 1;
          const isCompleted = currentPhase > phaseNumber;
          const isCurrent = currentPhase === phaseNumber;

          return (
            <React.Fragment key={phase}>
              <button
                onClick={() => setPhase(phaseNumber)}
                className="flex flex-col items-center focus:outline-none"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/50 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {phaseNumber}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {phase}
                </span>
              </button>
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
