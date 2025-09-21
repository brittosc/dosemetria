// src/components/dosimetry/ExecutionTimeline.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { formatPena } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, Unlock, Sun } from "lucide-react";

export function ExecutionTimeline() {
  const { state } = useDosimetryCalculator();
  const { finalResults } = state;

  if (
    !finalResults.progressionSteps ||
    finalResults.progressionSteps.length === 0
  ) {
    return null;
  }

  const dataInicial = new Date(state.dataInicioCumprimento);

  return (
    <div className="space-y-4">
      <ol className="relative border-l border-border ml-2">
        <li className="mb-6 ml-6">
          <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-card bg-transparent">
            <Calendar className="w-4 h-4 text-gray-800 dark:text-neutral-300" />
          </span>
          <div className="ml-2">
            <h3 className="flex items-center mb-1 text-md font-semibold text-foreground mt-5">
              Início do Cumprimento
            </h3>
            <p className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
              {dataInicial.toLocaleDateString("pt-BR")} - Regime{" "}
              <span className="font-bold">{finalResults.regimeInicial}</span>
            </p>
          </div>
        </li>

        {finalResults.progressionSteps.map((prog, index) => (
          <li key={index} className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-card bg-transparent">
              <Unlock className="w-4 h-4 text-blue-800 dark:text-blue-300" />
            </span>
            <div className="ml-2">
              <h3 className="flex items-center mb-1 text-md font-semibold text-foreground">
                Progressão para o Regime {prog.regime}
              </h3>
              <p className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                <Badge variant="secondary">
                  {((finalResults.progression?.fracao || 0) * 100).toFixed(0)}%
                  da pena
                </Badge>
                {" - Após cumprir "}
                <span className="font-bold text-foreground">
                  {formatPena(prog.tempoCumprir)}
                </span>
              </p>
            </div>
          </li>
        ))}

        {finalResults.livramentoCondicional && (
          <li className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-card bg-transparent">
              <Sun className="w-4 h-4 text-green-800 dark:text-green-300" />
            </span>
            <div className="ml-2">
              <h3 className="flex items-center mb-1 text-md font-semibold text-foreground">
                Livramento Condicional
              </h3>
              <p className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                <Badge variant="default" className="bg-green-600">
                  {(finalResults.livramentoCondicional.fracao * 100).toFixed(0)}
                  % da pena
                </Badge>
                {" - Após cumprir "}
                <span className="font-bold text-foreground">
                  {formatPena(finalResults.livramentoCondicional.tempo)}
                </span>
              </p>
            </div>
          </li>
        )}

        {finalResults.dataFinalPena && (
          <li className="ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-card bg-transparent">
              <Lock className="w-4 h-4 text-red-800 dark:text-red-300" />
            </span>
            <div className="ml-2">
              <h3 className="flex items-center mb-1 text-md font-semibold text-foreground">
                Término da Pena
              </h3>
              <p className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                {new Date(finalResults.dataFinalPena).toLocaleDateString(
                  "pt-BR",
                )}
              </p>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
