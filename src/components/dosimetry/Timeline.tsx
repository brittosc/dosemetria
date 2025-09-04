"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Crime } from "@/types/crime";
import crimesData from "@/app/data/crimes.json";
import {
  GitCommit,
  Gavel,
  Scale,
  Bomb,
  Handshake,
  Dices,
  Skull,
  Crosshair,
  ShieldAlert,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const crimeIcons: { [key: string]: React.ElementType } = {
  homicidio_simples: Skull,
  feminicidio: Skull,
  lesao_corporal_simples: ShieldAlert,
  lesao_corporal_grave: ShieldAlert,
  lesao_corporal_gravissima: ShieldAlert,
  lesao_corporal_seguida_de_morte: Skull,
  lesao_corporal_violencia_domestica: ShieldAlert,
  roubo_simples: Crosshair,
  extorsao_simples: Handshake,
  extorsao_mediante_sequestro: Handshake,
  estupro: Dices, // Usando Dices como um placeholder genérico ou para indicar incerteza/violência
  estupro_de_vulneravel: Dices, // Usando Dices como um placeholder genérico ou para indicar incerteza/violência
  furto_simples: GitCommit, // Placeholder, pode ser alterado
  furto_qualificado: GitCommit,
  sequestro: Handshake,
  trafico_drogas: Bomb,
  associacao_criminosa: Gavel,
  lavagem_dinheiro: Scale,
  // Adicione mais crimes e seus ícones correspondentes aqui
};

export function CrimeTimelineHorizontal() {
  const { state } = useDosimetryCalculator();

  const sortedCrimes = [...state.crimes]
    .filter((crime) => crime.crimeId && crime.dataCrime) // Garante que só crimes com ID e data sejam exibidos
    .sort((a, b) => {
      const dateA = new Date(a.dataCrime!).getTime();
      const dateB = new Date(b.dataCrime!).getTime();
      return dateA - dateB;
    });

  if (sortedCrimes.length === 0) {
    return null; // Não mostra a timeline se não houver crimes com data
  }

  return (
    <Card className="w-full mb-8 overflow-x-auto">
      <CardHeader>
        <CardTitle>Linha do Tempo dos Crimes</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative flex items-center justify-start py-4">
            {sortedCrimes.map((crime, index) => {
              const crimeDefinition = (crimesData as Crime[]).find(
                (c: Crime) => c.id === crime.crimeId
              );
              const IconComponent = crimeIcons[crime.crimeId!] || GitCommit; // Fallback icon

              return (
                <div
                  key={crime.id}
                  className={cn(
                    "flex flex-col items-center flex-shrink-0 relative z-10",
                    index < sortedCrimes.length - 1 ? "w-40" : "w-auto" // Largura para espaçamento entre os cards
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground border-4 border-background shadow-lg",
                          index > 0 && "ml-[-6px]" // Ajusta o espaçamento para sobreposição visual
                        )}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground shadow-md rounded-lg p-2 max-w-xs z-[99]">
                      <p className="font-semibold text-sm">
                        {crimeDefinition?.nome || `Crime ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {crime.dataCrime
                          ? format(new Date(crime.dataCrime), "dd/MM/yyyy")
                          : "Data não informada"}
                      </p>
                      {crime.penaDefinitiva !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Pena:{" "}
                          {format(
                            new Date(0, 0, 0, 0, crime.penaDefinitiva),
                            "y 'anos' M 'meses' d 'dias'"
                          ).replace(/0 anos |0 meses |0 dias /g, "")}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  {/* Conector */}
                  {index < sortedCrimes.length - 1 && (
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border z-0" />
                  )}
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
