// src/components/dosimetry/Stepper.tsx

import { cn } from "@/lib/utils";
import React from "react";

interface StepperProps {
  currentPhase: number;
  setPhase: (phase: number) => void;
  crimeSelected: boolean;
}

const phases = ["1ª Fase", "2ª Fase", "3ª Fase"];

export function Stepper({
  currentPhase,
  setPhase,
  crimeSelected,
}: StepperProps) {
  return (
    <div className="flex justify-center items-center w-full mb-4">
      <div className="flex items-center">
        {phases.map((phase, index) => {
          const phaseNumber = index + 1;
          const isCompleted = currentPhase > phaseNumber;
          const isCurrent = currentPhase === phaseNumber;
          const isDisabled = !crimeSelected && phaseNumber > 1;

          return (
            <React.Fragment key={phase}>
              <button
                onClick={() => !isDisabled && setPhase(phaseNumber)}
                disabled={isDisabled}
                className="flex flex-col items-center focus:outline-none disabled:cursor-not-allowed"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary/50 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    isDisabled && "bg-muted/50 text-muted-foreground/50",
                  )}
                >
                  {phaseNumber}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground",
                    isDisabled && "text-muted-foreground/50",
                  )}
                >
                  {phase}
                </span>
              </button>
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2 transition-colors duration-300",
                    isCompleted && crimeSelected ? "bg-primary" : "bg-muted",
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
