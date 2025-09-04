"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Crime, Qualificadora } from "@/types/crime";
import { Circunstancia } from "@/lib/calculations";
import { Label } from "../ui/label";
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import { CrimeSelector } from "./CrimeSelector";
import { formatPena } from "@/lib/calculations";

interface PhaseOneContentProps {
  form: UseFormReturn<CrimeState>;
  selectedCrime?: Crime;
  activePena?: Crime | Qualificadora;
  crimesData: Crime[];
  handleCrimeChange: (crimeId: string) => void;
  handleQualificadoraChange: (qualificadoraId: string) => void;
}

const circunstanciasJudiciaisOptions = [
  "Culpabilidade",
  "Antecedentes",
  "Conduta Social",
  "Personalidade do Agente",
  "Motivos",
  "Circunstâncias do Crime",
  "Consequências do Crime",
  "Comportamento da Vítima",
];

export const PhaseOneContent = ({
  form,
  selectedCrime,
  activePena,
  crimesData,
  handleCrimeChange,
  handleQualificadoraChange,
}: PhaseOneContentProps) => {
  return (
    <>
      <FormItem className="flex flex-col">
        <FormLabel>Crime</FormLabel>
        <CrimeSelector
          crimesData={crimesData}
          selectedCrime={selectedCrime}
          onCrimeChange={handleCrimeChange}
        />
        <FormMessage />
      </FormItem>

      {selectedCrime && (
        <>
          {selectedCrime.qualificadoras &&
            selectedCrime.qualificadoras.length > 0 && (
              <FormItem>
                <FormLabel>Qualificadora</FormLabel>
                <Select
                  onValueChange={handleQualificadoraChange}
                  value={
                    form.watch("selectedQualificadoraId") || "sem-qualificadora"
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma qualificadora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sem-qualificadora">
                      Nenhuma (Crime Simples)
                    </SelectItem>
                    {selectedCrime.qualificadoras?.map((q: Qualificadora) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}

          <FormItem>
            <FormLabel>Pena-Base (em meses)</FormLabel>
            <Controller
              name="penaBase"
              control={form.control}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              )}
            />
            {activePena &&
              activePena.penaMinimaMeses !== null &&
              activePena.penaMaximaMeses !== null && (
                <FormDescription>
                  Pena entre {formatPena(activePena.penaMinimaMeses)} (mínima) e{" "}
                  {formatPena(activePena.penaMaximaMeses)} (máxima).
                </FormDescription>
              )}
            <FormMessage />
          </FormItem>

          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Circunstâncias Judiciais (Art. 59)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Selecione as que forem desfavoráveis. Cada uma aumenta a
                      pena em 1/6 por padrão.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {circunstanciasJudiciaisOptions.map((option) => (
                <Controller
                  key={option}
                  name="circunstanciasJudiciais"
                  control={form.control}
                  render={({ field }) => {
                    const isChecked = field.value?.some(
                      (c: Circunstancia) => c.id === option
                    );
                    const circunstancia = field.value?.find(
                      (c: Circunstancia) => c.id === option
                    );
                    return (
                      <div className="space-y-2 rounded-md border p-3">
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      { id: option, fracao: "1/6" },
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (c: Circunstancia) => c.id !== option
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            {option}
                          </FormLabel>
                        </FormItem>
                        {isChecked && (
                          <div className="flex items-center gap-2 pt-2">
                            <Label
                              htmlFor={`fracao-${option}`}
                              className="text-sm"
                            >
                              Fração:
                            </Label>
                            <Input
                              id={`fracao-${option}`}
                              value={circunstancia?.fracao}
                              onChange={(e) => {
                                const newFracao = e.target.value;
                                field.onChange(
                                  (field.value || []).map((c: Circunstancia) =>
                                    c.id === option
                                      ? { ...c, fracao: newFracao }
                                      : c
                                  )
                                );
                              }}
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              ))}
            </div>
          </FormItem>
        </>
      )}
    </>
  );
};
