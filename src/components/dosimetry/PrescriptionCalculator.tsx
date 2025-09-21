"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "../ui/date-picker";
import { calculatePrescription, formatPena } from "@/lib/calculations";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ChevronsRight,
  Scale,
  Clock,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoTooltip } from "../ui/info-tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// Definindo o tipo dos dados do formulário
type PrescriptionFormValues = {
  penaAnos: number;
  penaMeses: number;
  penaDias: number;
  tipo: "punitiva" | "executoria";
  reincidente: boolean;
  menorDe21: boolean;
  maiorDe70: boolean;
  dataFato?: Date;
  dataRecebimentoDenuncia?: Date;
  dataPublicacaoSentenca?: Date;
};

const defaultValues: PrescriptionFormValues = {
  penaAnos: 0,
  penaMeses: 0,
  penaDias: 0,
  tipo: "punitiva",
  reincidente: false,
  menorDe21: false,
  maiorDe70: false,
  dataFato: undefined,
  dataRecebimentoDenuncia: undefined,
  dataPublicacaoSentenca: undefined,
};

export function PrescriptionCalculator() {
  const [prescriptionResult, setPrescriptionResult] = useState<{
    prazo: number;
    dataPrescricao?: Date;
    marcos: { data: Date; descricao: string }[];
  } | null>(null);

  const form = useForm<PrescriptionFormValues>({ defaultValues });

  const watchedValues = form.watch();
  const {
    penaAnos,
    penaMeses,
    penaDias,
    tipo,
    reincidente,
    menorDe21,
    maiorDe70,
    dataFato,
    dataRecebimentoDenuncia,
    dataPublicacaoSentenca,
  } = watchedValues;

  useEffect(() => {
    if (dataFato) {
      const penaTotalEmMeses =
        (penaAnos || 0) * 12 + (penaMeses || 0) + (penaDias || 0) / 30;
      const result = calculatePrescription({
        pena: penaTotalEmMeses,
        tipo,
        reincidente,
        menorDe21,
        maiorDe70,
        dataFato,
        dataRecebimentoDenuncia,
        dataPublicacaoSentenca,
        datasOutrasCausasInterruptivas: [],
        periodosSuspensao: [],
      });
      setPrescriptionResult(result);
    } else {
      // Se a data do fato for limpa, limpa todo o resultado
      setPrescriptionResult(null);
    }
  }, [
    penaAnos,
    penaMeses,
    penaDias,
    tipo,
    reincidente,
    menorDe21,
    maiorDe70,
    dataFato,
    dataRecebimentoDenuncia,
    dataPublicacaoSentenca,
    form,
  ]);

  const handleReset = () => {
    form.reset(defaultValues);
  };

  const tipoPenaLabel =
    tipo === "punitiva"
      ? "Pena Máxima em Abstrato"
      : "Pena Concretamente Aplicada";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle></CardTitle>
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Reiniciar Calculadora</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              {/* SEÇÃO 1: PENA */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Scale className="w-5 h-5 mr-3 text-primary" />
                  Pena
                </h3>
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="flex items-center">
                        Tipo de Prescrição
                        <InfoTooltip text="Punitiva: antes do trânsito em julgado. Executória: após o trânsito em julgado." />
                      </Label>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="punitiva" id="punitiva" />
                          </FormControl>
                          <Label
                            htmlFor="punitiva"
                            className="font-normal cursor-pointer"
                          >
                            Punitiva
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem
                              value="executoria"
                              id="executoria"
                            />
                          </FormControl>
                          <Label
                            htmlFor="executoria"
                            className="font-normal cursor-pointer"
                          >
                            Executória
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <div>
                  <Label>{tipoPenaLabel}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="penaAnos"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground">
                            Anos
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="penaMeses"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground">
                            Meses
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="penaDias"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground">
                            Dias
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SEÇÃO 2: DATAS */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  Marcos Temporais
                </h3>
                <FormField
                  control={form.control}
                  name="dataFato"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="flex items-center mb-2">
                        Data do Fato{" "}
                        <InfoTooltip text="Marco inicial da contagem." />
                      </Label>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataRecebimentoDenuncia"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="flex items-center mb-2">
                        Recebimento da Denúncia{" "}
                        <InfoTooltip text="Zera a contagem da prescrição." />
                      </Label>
                      {/* Agora não é mais desabilitado, apenas filtra datas anteriores ao fato */}
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        fromDate={dataFato}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataPublicacaoSentenca"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="flex items-center mb-2">
                        Publicação da Sentença{" "}
                        <InfoTooltip text="Novo marco que zera a contagem." />
                      </Label>
                      {/* Agora não é mais desabilitado, apenas filtra datas anteriores ao fato */}
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        fromDate={dataFato}
                      />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* SEÇÃO 3: FATORES */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <UserCheck className="w-5 h-5 mr-3 text-primary" />
                  Fatores Modificadores
                </h3>
                <FormField
                  control={form.control}
                  name="reincidente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="reincidente"
                        disabled={tipo !== "executoria"}
                      />
                      <Label
                        htmlFor="reincidente"
                        className={cn(
                          "font-normal cursor-pointer flex items-center",
                          tipo !== "executoria" && "text-muted-foreground",
                        )}
                      >
                        Réu reincidente
                        <InfoTooltip text="A reincidência só aumenta o prazo (em 1/3) na prescrição da pretensão EXECUTÓRIA. Ficará desabilitado se a Punitiva estiver selecionada." />
                      </Label>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="menorDe21"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="menorDe21"
                      />
                      <Label
                        htmlFor="menorDe21"
                        className="font-normal cursor-pointer flex items-center"
                      >
                        Menor de 21 anos na data do fato
                        <InfoTooltip text="Reduz o prazo prescricional pela metade." />
                      </Label>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maiorDe70"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="maiorDe70"
                      />
                      <Label
                        htmlFor="maiorDe70"
                        className="font-normal cursor-pointer flex items-center"
                      >
                        Maior de 70 anos na data da sentença
                        <InfoTooltip text="Também reduz o prazo pela metade." />
                      </Label>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* SEÇÃO DE RESULTADOS */}
      <AnimatePresence>
        {prescriptionResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-primary">
                  <ChevronsRight className="mr-2 h-5 w-5" />
                  Resultado do Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-around text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Prazo prescricional:
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatPena(prescriptionResult.prazo)}
                    </p>
                  </div>
                  {prescriptionResult.dataPrescricao && (
                    <div className="mt-4 sm:mt-0">
                      <p className="text-sm text-muted-foreground">
                        Data da prescrição:
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {prescriptionResult.dataPrescricao.toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {prescriptionResult.marcos.length > 0 && (
                  <div className="pt-4">
                    <Separator />
                    <h4 className="font-semibold my-4 text-left">
                      Linha do Tempo
                    </h4>
                    <ol className="relative border-l border-border ml-2 text-left">
                      {prescriptionResult.marcos.map((marco, index) => (
                        <li key={index} className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-primary-foreground rounded-full -left-3 ring-8 ring-background">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                          </span>
                          <h5 className="font-semibold">{marco.descricao}</h5>
                          <p className="text-sm text-muted-foreground">
                            {marco.data.toLocaleDateString("pt-BR")}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
