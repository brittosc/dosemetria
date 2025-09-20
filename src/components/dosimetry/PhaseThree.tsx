"use client";

import { useState } from "react";
import { useWatch, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Causa, CausaAplicada, getInitialCausaValor } from "@/lib/calculations";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhaseThreeContentProps {
  form: UseFormReturn<CrimeState>;
  causasData: Causa[];
  isMobile: boolean;
}

// Função para encontrar o maior divisor comum (para simplificar frações)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Função para converter um decimal para a fração mais próxima e comum
function decimalToFraction(decimal: number, precision = 10000): string {
  if (decimal === 1) return "1/1";
  if (decimal === 0) return "0/1";

  // Checa frações comuns com uma pequena margem de erro
  const commonFractions: { [key: string]: number } = {
    "1/6": 1 / 6,
    "1/5": 1 / 5,
    "1/4": 1 / 4,
    "1/3": 1 / 3,
    "2/5": 2 / 5,
    "1/2": 1 / 2,
    "3/5": 3 / 5,
    "2/3": 2 / 3,
    "3/4": 3 / 4,
    "4/5": 4 / 5,
    "5/6": 5 / 6,
  };

  for (const key in commonFractions) {
    if (Math.abs(decimal - commonFractions[key]) < 0.01) {
      return key;
    }
  }

  // Se não for uma fração comum, simplifica a partir da precisão
  const numerator = Math.round(decimal * precision);
  const commonDivisor = gcd(numerator, precision);
  return `${numerator / commonDivisor}/${precision / commonDivisor}`;
}

export const PhaseThreeContent = ({
  form,
  causasData,
  isMobile,
}: PhaseThreeContentProps) => {
  const [openAumento, setOpenAumento] = useState(false);
  const [openDiminuicao, setOpenDiminuicao] = useState(false);

  const causasAumento =
    useWatch({ control: form.control, name: "causasAumento" }) || [];
  const causasDiminuicao =
    useWatch({ control: form.control, name: "causasDiminuicao" }) || [];

  const handleSelectCausa = (
    causaId: string,
    tipo: "aumento" | "diminuicao"
  ) => {
    const causa = causasData.find((c: Causa) => c.id === causaId);
    if (!causa) return;

    const valorAplicado = getInitialCausaValor(causa);
    const novaCausa: CausaAplicada = { id: causa.id, valorAplicado };

    if (tipo === "aumento") {
      form.setValue("causasAumento", [...causasAumento, novaCausa]);
      setOpenAumento(false);
    } else {
      form.setValue("causasDiminuicao", [...causasDiminuicao, novaCausa]);
      setOpenDiminuicao(false);
    }
  };

  const handleRemoveCausa = (
    causaId: string,
    tipo: "aumento" | "diminuicao"
  ) => {
    if (tipo === "aumento") {
      form.setValue(
        "causasAumento",
        causasAumento.filter((c: CausaAplicada) => c.id !== causaId)
      );
    } else {
      form.setValue(
        "causasDiminuicao",
        causasDiminuicao.filter((c: CausaAplicada) => c.id !== causaId)
      );
    }
  };

  const handleFractionChange = (
    id: string,
    tipo: "aumento" | "diminuicao",
    value: number[]
  ) => {
    const newValue = value[0];
    if (tipo === "aumento") {
      form.setValue(
        "causasAumento",
        causasAumento.map((c: CausaAplicada) =>
          c.id === id ? { ...c, valorAplicado: newValue } : c
        )
      );
    } else {
      form.setValue(
        "causasDiminuicao",
        causasDiminuicao.map((c: CausaAplicada) =>
          c.id === id ? { ...c, valorAplicado: newValue } : c
        )
      );
    }
  };

  const availableAumentos = causasData.filter(
    (c: Causa) =>
      c.tipo === "aumento" &&
      !causasAumento.some((sel: CausaAplicada) => sel.id === c.id)
  );
  const availableDiminuicoes = causasData.filter(
    (c: Causa) =>
      c.tipo === "diminuicao" &&
      !causasDiminuicao.some((sel: CausaAplicada) => sel.id === c.id)
  );

  const renderCommandList = (tipo: "aumento" | "diminuicao") => (
    <Command>
      <CommandInput placeholder="Buscar causa..." />
      <CommandList>
        <CommandEmpty>Nenhuma causa encontrada.</CommandEmpty>
        <CommandGroup>
          {(tipo === "aumento" ? availableAumentos : availableDiminuicoes).map(
            (causa: Causa) => (
              <CommandItem
                key={causa.id}
                onSelect={() => handleSelectCausa(causa.id, tipo)}
              >
                {causa.descricao} ({causa.artigo})
              </CommandItem>
            )
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const CausaSelector = ({ tipo }: { tipo: "aumento" | "diminuicao" }) => {
    const open = tipo === "aumento" ? openAumento : openDiminuicao;
    const setOpen = tipo === "aumento" ? setOpenAumento : setOpenDiminuicao;
    const triggerText = `Adicionar causa de ${tipo}...`;

    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {triggerText}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Selecione a Causa de {tipo}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">{renderCommandList(tipo)}</div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {triggerText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 md:w-[500px]">
          {renderCommandList(tipo)}
        </PopoverContent>
      </Popover>
    );
  };

  const renderCausaValorInput = (
    causaInfo: Causa,
    causaAplicada: CausaAplicada,
    tipo: "aumento" | "diminuicao"
  ) => {
    if (
      causaInfo.valor.tipo === "range" &&
      causaInfo.valor.min !== undefined &&
      causaInfo.valor.max !== undefined
    ) {
      const valorAtual = Number(causaAplicada.valorAplicado);
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Slider
              min={causaInfo.valor.min}
              max={causaInfo.valor.max}
              step={0.001} // Aumentando a precisão do passo
              value={[valorAtual]}
              onValueChange={(value) =>
                handleFractionChange(causaAplicada.id, tipo, value)
              }
              className="w-full"
            />
            <span className="text-sm font-semibold w-28 text-right tabular-nums">
              {decimalToFraction(valorAtual)} ({(valorAtual * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>{causaInfo.valor.fracao?.split(" a ")[0]}</span>
            <span>{causaInfo.valor.fracao?.split(" a ")[1]}</span>
          </div>
        </div>
      );
    }

    const valorFixo =
      causaInfo.valor.fracao ||
      (causaInfo.valor.valor ? `${causaInfo.valor.valor * 100}%` : null);
    if (valorFixo) {
      return (
        <Button
          type="button"
          variant="outline"
          disabled
          className="cursor-default"
        >
          {valorFixo}
        </Button>
      );
    }

    return null;
  };

  return (
    <>
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Causas de Aumento de Pena
        </Label>
        <CausaSelector tipo="aumento" />
        <div className="space-y-4">
          {causasAumento.map((ca: CausaAplicada) => {
            const causaInfo = causasData.find((c: Causa) => c.id === ca.id);
            if (!causaInfo) return null;
            return (
              <div key={ca.id} className="p-3 border rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant="destructive"
                    className="whitespace-normal h-auto text-wrap"
                  >
                    {causaInfo.descricao}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCausa(ca.id, "aumento")}
                    className="-mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderCausaValorInput(causaInfo, ca, "aumento")}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Causas de Diminuição de Pena
        </Label>
        <CausaSelector tipo="diminuicao" />
        <div className="space-y-4">
          {causasDiminuicao.map((ca: CausaAplicada) => {
            const causaInfo = causasData.find((c: Causa) => c.id === ca.id);
            if (!causaInfo) return null;
            return (
              <div key={ca.id} className="p-3 border rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant="secondary"
                    className="whitespace-normal h-auto text-wrap"
                  >
                    {causaInfo.descricao}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCausa(ca.id, "diminuicao")}
                    className="-mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderCausaValorInput(causaInfo, ca, "diminuicao")}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
