"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Frown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatPena } from "@/lib/calculations"; // Importação correta

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
  estupro: Dices,
  estupro_de_vulneravel: Dices,
  furto_simples: GitCommit,
  furto_qualificado: GitCommit,
  sequestro: Handshake,
  trafico_drogas: Bomb,
  associacao_criminosa: Gavel,
  lavagem_dinheiro: Scale,
};

export function CrimeTimelineHorizontal() {
  const { state } = useDosimetryCalculator();

  const sortedCrimes = [...state.crimes]
    .filter((crime) => crime.crimeId && crime.dataCrime)
    .sort((a, b) => {
      const dateA = new Date(a.dataCrime!).getTime();
      const dateB = new Date(b.dataCrime!).getTime();
      return dateA - dateB;
    });

  if (sortedCrimes.length === 0) {
    return null;
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
              const IconComponent = crimeIcons[crime.crimeId!] || Frown;

              return (
                <div
                  key={crime.id}
                  className={cn(
                    "flex flex-col items-center flex-shrink-0 relative z-10 text-center",
                    index < sortedCrimes.length - 1 ? "w-40" : "w-auto"
                  )}
                >
                  {index > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-[50%] bg-border z-0 -ml-[25%]" />
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                        )}
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg mb-2">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground max-w-[100px] truncate">
                          {crimeDefinition?.nome || `Crime ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {crime.dataCrime
                            ? format(new Date(crime.dataCrime), "dd/MM/yyyy")
                            : "Data não informada"}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground shadow-md rounded-lg p-2 max-w-xs z-[99]">
                      <p className="font-semibold text-sm">
                        {crimeDefinition?.nome || `Crime ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {crime.dataCrime
                          ? format(new Date(crime.dataCrime), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "Data não informada"}
                      </p>
                      {crime.penaDefinitiva !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Pena: {formatPena(crime.penaDefinitiva)}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  {index < sortedCrimes.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-[50%] bg-border z-0 -mr-[25%]" />
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
