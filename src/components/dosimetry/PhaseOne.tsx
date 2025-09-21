// src/components/dosimetry/PhaseOne.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Circunstancia, formatValorDiaMulta } from "@/lib/calculations";
import { Label } from "../ui/label";
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import { CrimeSelector } from "./CrimeSelector";
import { formatPena } from "@/lib/calculations";
import { toast } from "sonner";
import { DatePicker } from "../ui/date-picker";
import { Slider } from "@/components/ui/slider";

interface PhaseOneContentProps {
  form: UseFormReturn<CrimeState>;
  selectedCrime?: Crime;
  activePena?: Crime | Qualificadora;
  crimesData: Crime[];
  handleCrimeChange: (crimeId: string) => void;
  handleQualificadoraChange: (qualificadoraId: string) => void;
  salarioMinimo: number;
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
  salarioMinimo,
}: PhaseOneContentProps) => {
  const [anos, setAnos] = useState<number | string>("");
  const [meses, setMeses] = useState<number | string>("");
  const [dias, setDias] = useState<number | string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const penaBaseEmMeses = form.watch("penaBase");

  // Efeito para sincronizar os inputs (anos, meses, dias) com o valor do formulário
  useEffect(() => {
    if (penaBaseEmMeses != null) {
      const totalMesesFloat = Number(penaBaseEmMeses);
      const anosCalc = Math.floor(totalMesesFloat / 12);
      const mesesRestantes = totalMesesFloat % 12;
      const mesesCalc = Math.floor(mesesRestantes);
      const diasCalc = Math.round((mesesRestantes - mesesCalc) * 30);

      setAnos(anosCalc || "");
      setMeses(mesesCalc || "");
      setDias(diasCalc || "");
    } else {
      setAnos("");
      setMeses("");
      setDias("");
    }
  }, [penaBaseEmMeses]);

  // Efeito para validação automática em tempo real (com debounce)
  useEffect(() => {
    // Limpa o timeout anterior sempre que o valor muda
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Inicia um novo timeout para validar após o usuário parar de digitar
    debounceTimeout.current = setTimeout(() => {
      if (activePena && penaBaseEmMeses != null) {
        const min = activePena.penaMinimaMeses ?? 0;
        const max = activePena.penaMaximaMeses ?? Infinity;

        if (penaBaseEmMeses < min) {
          form.setValue("penaBase", min);
          toast.info("Pena-base ajustada para o mínimo legal", {
            description: `O valor inserido era inferior a ${formatPena(min)}.`,
          });
        } else if (penaBaseEmMeses > max) {
          form.setValue("penaBase", max);
          toast.info("Pena-base ajustada para o máximo legal", {
            description: `O valor inserido era superior a ${formatPena(max)}.`,
          });
        }
      }
    }, 750); // Atraso de 750ms

    // Limpeza ao desmontar o componente
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [penaBaseEmMeses, activePena, form]);

  const handlePenaChange = (
    novosAnos: string,
    novosMeses: string,
    novosDias: string,
  ) => {
    const anosNum = Number(novosAnos) || 0;
    const mesesNum = Number(novosMeses) || 0;
    const diasNum = Number(novosDias) || 0;
    const totalMeses = anosNum * 12 + mesesNum + diasNum / 30;
    form.setValue("penaBase", totalMeses, { shouldValidate: true });
  };

  const handleAnosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setAnos(valor);
    handlePenaChange(valor, String(meses), String(dias));
  };

  const handleMesesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setMeses(valor);
    handlePenaChange(String(anos), valor, String(dias));
  };

  const handleDiasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDias(valor);
    handlePenaChange(String(anos), String(meses), valor);
  };

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
      <FormItem className="flex flex-col">
        <FormLabel>Data do Crime</FormLabel>
        <Controller
          name="dataCrime"
          control={form.control}
          render={({ field }) => (
            <DatePicker date={field.value} setDate={field.onChange} />
          )}
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
            <FormLabel>Pena-Base</FormLabel>
            <div className="grid grid-cols-3 items-center gap-2">
              <Input
                type="number"
                placeholder="Anos"
                value={anos}
                onChange={handleAnosChange}
              />
              <Input
                type="number"
                placeholder="Meses"
                value={meses}
                onChange={handleMesesChange}
              />
              <Input
                type="number"
                placeholder="Dias"
                value={dias}
                onChange={handleDiasChange}
              />
            </div>
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

          {selectedCrime.temMulta && (
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-sm font-medium">Pena de Multa</h3>
              <FormItem>
                <FormLabel>Dias-Multa</FormLabel>
                <Controller
                  name="penaMulta.diasMulta"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={10}
                      max={360}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  )}
                />
                <FormDescription>Entre 10 e 360 dias.</FormDescription>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Valor do Dia-Multa</FormLabel>
                <Controller
                  name="penaMulta.valorDiaMulta"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Slider
                        min={1 / 30}
                        max={5}
                        step={1 / 30}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <FormDescription className="text-center">
                        {formatValorDiaMulta(field.value, salarioMinimo)}
                      </FormDescription>
                    </div>
                  )}
                />
                <FormDescription>
                  Entre 1/30 e 5 vezes o salário mínimo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </div>
          )}

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
                      pena em 1/6 por padrão sobre a pena-base.
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
                    const value = field.value || [];
                    const isChecked = value.some(
                      (c: Circunstancia) => c.id === option,
                    );
                    const circunstancia = value.find(
                      (c: Circunstancia) => c.id === option,
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
                                      ...value,
                                      { id: option, fracao: "1/6" },
                                    ])
                                  : field.onChange(
                                      value.filter(
                                        (c: Circunstancia) => c.id !== option,
                                      ),
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
                                  value.map((c: Circunstancia) =>
                                    c.id === option
                                      ? { ...c, fracao: newFracao }
                                      : c,
                                  ),
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
            <FormDescription>
              A fração de 1/6 é um padrão jurisprudencial, mas você pode
              ajustá-la conforme a fundamentação do caso.
            </FormDescription>
          </FormItem>
        </>
      )}
    </>
  );
};
