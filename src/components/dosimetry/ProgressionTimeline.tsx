// src/components/dosimetry/ProgressionTimeline.tsx

import { formatPena } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Progression {
  regime: string;
  tempoCumprir: number;
}

interface ProgressionTimelineProps {
  progressoes: Progression[];
  fracao: number;
}

export function ProgressionTimeline({
  progressoes,
  fracao,
}: ProgressionTimelineProps) {
  if (!progressoes || progressoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Não há progressão de regime aplicável para a pena e regime atuais.
      </p>
    );
  }

  const percentual = (fracao * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Linha do Tempo da Progressão:</h4>
      <ol className="relative border-l border-border ml-2">
        {progressoes.map((prog, index) => (
          <li key={index} className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-card dark:ring-gray-900 dark:bg-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-800 dark:text-blue-300" />
            </span>
            <div className="ml-2">
              <h3 className="flex items-center mb-1 text-md font-semibold text-foreground">
                Progressão para o Regime {prog.regime}
              </h3>
              <p className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                <Badge variant="secondary">{percentual}% da pena</Badge>
                {" - Após cumprir "}
                <span className="font-bold text-foreground">
                  {formatPena(prog.tempoCumprir)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
