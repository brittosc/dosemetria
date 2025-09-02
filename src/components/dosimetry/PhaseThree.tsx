"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";

import { Causa, formatPena } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { toast } from "sonner";

type CausaAplicada = {
  id: string;
  valorAplicado: number | string;
};

export interface PhaseThreeFormValues {
  causasAumento: CausaAplicada[];
  causasDiminuicao: CausaAplicada[];
}

type PhaseThreeProps = {
  initialValues: PhaseThreeFormValues;
  penaProvisoria: number;
  causasData: Causa[];
  onGoBack: () => void;
  setActiveTab: (value: string) => void;
};

export function PhaseThree({
  initialValues,
  penaProvisoria,
  causasData,
  onGoBack,
  setActiveTab,
}: PhaseThreeProps) {
  const { actions } = useDosimetryCalculator();
  const [openAumento, setOpenAumento] = useState(false);
  const [openDiminuicao, setOpenDiminuicao] = useState(false);
  const isMobile = useIsMobile();

  const [causasAumento, setCausasAumento] = useState<CausaAplicada[]>(
    initialValues.causasAumento || []
  );
  const [causasDiminuicao, setCausasDiminuicao] = useState<CausaAplicada[]>(
    initialValues.causasDiminuicao || []
  );

  useEffect(() => {
    actions.updatePhaseThree({ causasAumento, causasDiminuicao });
  }, [causasAumento, causasDiminuicao, actions]);

  const handleSelectCausa = (
    causaId: string,
    tipo: "aumento" | "diminuicao"
  ) => {
    const causa = causasData.find((c) => c.id === causaId);
    if (!causa) return;

    let valorAplicado: string | number = 0.5; // Default value
    if (causa.valor.tipo === "range" && causa.valor.fracao) {
      valorAplicado = causa.valor.fracao.split(" a ")[0];
    } else if (causa.valor.tipo === "fracao" && causa.valor.fracao) {
      valorAplicado = causa.valor.fracao;
    } else if (causa.valor.valor) {
      valorAplicado = causa.valor.valor;
    }

    const novaCausa: CausaAplicada = { id: causa.id, valorAplicado };

    if (tipo === "aumento") {
      setCausasAumento((prev) => [...prev, novaCausa]);
      setOpenAumento(false);
    } else {
      setCausasDiminuicao((prev) => [...prev, novaCausa]);
      setOpenDiminuicao(false);
    }
  };

  const handleRemoveCausa = (
    causaId: string,
    tipo: "aumento" | "diminuicao"
  ) => {
    if (tipo === "aumento") {
      setCausasAumento((prev) => prev.filter((c) => c.id !== causaId));
    } else {
      setCausasDiminuicao((prev) => prev.filter((c) => c.id !== causaId));
    }
  };

  const handleFractionChange = (
    id: string,
    tipo: "aumento" | "diminuicao",
    value: string
  ) => {
    if (tipo === "aumento") {
      setCausasAumento((prev) =>
        prev.map((c) => (c.id === id ? { ...c, valorAplicado: value } : c))
      );
    } else {
      setCausasDiminuicao((prev) =>
        prev.map((c) => (c.id === id ? { ...c, valorAplicado: value } : c))
      );
    }
  };

  const availableAumentos = causasData.filter(
    (c) => c.tipo === "aumento" && !causasAumento.some((sel) => sel.id === c.id)
  );
  const availableDiminuicoes = causasData.filter(
    (c) =>
      c.tipo === "diminuicao" &&
      !causasDiminuicao.some((sel) => sel.id === c.id)
  );

  const renderCommandList = (tipo: "aumento" | "diminuicao") => (
    <Command>
      <CommandInput placeholder="Buscar causa..." />
      <CommandList>
        <CommandEmpty>Nenhuma causa encontrada.</CommandEmpty>
        <CommandGroup>
          {(tipo === "aumento" ? availableAumentos : availableDiminuicoes).map(
            (causa) => (
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
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          {renderCommandList(tipo)}
        </PopoverContent>
      </Popover>
    );
  };

  const renderFractionButtons = (
    causaInfo: Causa,
    causaAplicada: CausaAplicada,
    tipo: "aumento" | "diminuicao"
  ) => {
    if (causaInfo.valor.tipo === "range" && causaInfo.valor.fracao) {
      const fractions = causaInfo.valor.fracao.split(" a ");
      return (
        <div className="flex gap-2">
          {fractions.map((fraction) => (
            <Button
              key={fraction}
              type="button"
              variant={
                causaAplicada.valorAplicado === fraction ? "default" : "outline"
              }
              onClick={() =>
                handleFractionChange(causaAplicada.id, tipo, fraction)
              }
            >
              {fraction}
            </Button>
          ))}
        </div>
      );
    }
    if (causaInfo.valor.tipo === "fracao" && causaInfo.valor.fracao) {
      return (
        <Button type="button" variant="default" disabled>
          {causaInfo.valor.fracao}
        </Button>
      );
    }
    return null;
  };

  const handleFinalizeAndSwitch = () => {
    actions.calculateAndProceed();
    toast.success("Cálculo Finalizado!", {
      description: "A pena definitiva foi calculada com sucesso.",
    });
    setActiveTab("resumo");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>3ª Fase: Cálculo da Pena Definitiva</CardTitle>
        <CardDescription>
          Aplique as causas de aumento e diminuição sobre a pena provisória de:
          <span className="font-bold"> {formatPena(penaProvisoria)}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Causas de Aumento de Pena
          </Label>
          <CausaSelector tipo="aumento" />
          <div className="space-y-4">
            {causasAumento.map((ca) => {
              const causaInfo = causasData.find((c) => c.id === ca.id);
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
                  <Label>Fração de Aumento: {causaInfo.valor.fracao}</Label>
                  {renderFractionButtons(causaInfo, ca, "aumento")}
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
            {causasDiminuicao.map((ca) => {
              const causaInfo = causasData.find((c) => c.id === ca.id);
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
                  <Label>Fração de Redução: {causaInfo.valor.fracao}</Label>
                  {renderFractionButtons(causaInfo, ca, "diminuicao")}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-2 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onGoBack}
          className="w-full md:w-auto"
        >
          Voltar para 2ª Fase
        </Button>
        {isMobile ? (
          <Button
            onClick={handleFinalizeAndSwitch}
            className="w-full md:w-auto"
          >
            Finalizar Cálculo
          </Button>
        ) : (
          <Button type="button" className="w-full md:w-auto" disabled>
            Exportar (em breve)
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
