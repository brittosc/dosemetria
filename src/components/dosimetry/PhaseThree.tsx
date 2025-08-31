"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";

import { formatPena } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

type Causa = {
  id: string;
  artigo: string;
  descricao: string;
  tipo: string;
  valor: {
    tipo: string;
    min?: number;
    max?: number;
    valor?: number;
    fracao?: string;
  };
};

type CausaAplicada = {
  id: string;
  valorAplicado: number;
};

export interface PhaseThreeFormValues {
  causasAumento: CausaAplicada[];
  causasDiminuicao: CausaAplicada[];
}

type PhaseThreeProps = {
  initialValues: PhaseThreeFormValues;
  penaProvisoria: number;
  causasData: Causa[];
  onFormSubmit: (data: PhaseThreeFormValues) => void;
  onGoBack: () => void;
};

export function PhaseThree({
  initialValues,
  penaProvisoria,
  causasData,
  onFormSubmit,
  onGoBack,
}: PhaseThreeProps) {
  const [openAumento, setOpenAumento] = useState(false);
  const [openDiminuicao, setOpenDiminuicao] = useState(false);
  const isMobile = useIsMobile();

  const [causasAumento, setCausasAumento] = useState<CausaAplicada[]>(
    initialValues.causasAumento || []
  );
  const [causasDiminuicao, setCausasDiminuicao] = useState<CausaAplicada[]>(
    initialValues.causasDiminuicao || []
  );

  const form = useForm();

  const handleSelectCausa = (
    causaId: string,
    tipo: "aumento" | "diminuicao"
  ) => {
    const causa = causasData.find((c) => c.id === causaId);
    if (!causa) return;
    const novaCausa: CausaAplicada = { id: causa.id, valorAplicado: 0.5 };
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

  const handleSliderChange = (
    id: string,
    tipo: "aumento" | "diminuicao",
    value: number[]
  ) => {
    if (!value || value.length === 0) return;
    const valorAplicado = value[0];
    if (tipo === "aumento") {
      setCausasAumento((prev) =>
        prev.map((c) => (c.id === id ? { ...c, valorAplicado } : c))
      );
    } else {
      setCausasDiminuicao((prev) =>
        prev.map((c) => (c.id === id ? { ...c, valorAplicado } : c))
      );
    }
  };

  const onSubmit = () => {
    onFormSubmit({ causasAumento, causasDiminuicao });
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>3ª Fase: Cálculo da Pena Definitiva</CardTitle>
        <CardDescription>
          Aplique as causas de aumento e diminuição sobre a pena provisória de:
          <span className="font-bold"> {formatPena(penaProvisoria)}</span>.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <div
                      key={ca.id}
                      className="p-3 border rounded-md space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <Badge variant="destructive">
                          {causaInfo.descricao}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCausa(ca.id, "aumento")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Label>Fração de Aumento: {causaInfo.valor.fracao}</Label>
                      {causaInfo.valor.tipo === "range" && (
                        <Slider
                          defaultValue={[0.5]}
                          max={1}
                          step={0.01}
                          onValueChange={(v: number[]) =>
                            handleSliderChange(ca.id, "aumento", v)
                          }
                        />
                      )}
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
                    <div
                      key={ca.id}
                      className="p-3 border rounded-md space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">{causaInfo.descricao}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCausa(ca.id, "diminuicao")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Label>Fração de Redução: {causaInfo.valor.fracao}</Label>
                      {causaInfo.valor.tipo === "range" && (
                        <Slider
                          defaultValue={[0.5]}
                          max={1}
                          step={0.01}
                          onValueChange={(v: number[]) =>
                            handleSliderChange(ca.id, "diminuicao", v)
                          }
                        />
                      )}
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
            <Button type="submit" className="w-full md:w-auto">
              Calcular Pena Definitiva
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
