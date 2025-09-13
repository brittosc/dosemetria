// src/components/dosimetry/CalculationSummary.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FinalSummary } from "./FinalSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatPena } from "@/lib/calculations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { CalculationDetails } from "./CalculationDetails";
import { Button } from "../ui/button";
import { Plus, Trash2, Info } from "lucide-react";
import { DatePicker } from "../ui/date-picker";
import { ExecutionSummary } from "./ExecutionSummary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function CalculationSummary() {
  const { state, dispatch, crimesData, causasData } = useDosimetryCalculator();

  const showSalarioMinimoInput = state.crimes.some((crime) => {
    const crimeData = crimesData.find((c) => c.id === crime.crimeId);
    return crimeData?.temMulta;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo e Execução</CardTitle>
        <CardDescription>
          Visualize o resultado final e os detalhes da execução da pena.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={state.crimes.map((c) => c.id)}
        >
          {state.crimes.map((crime, index) => {
            const selectedCrime = crimesData.find(
              (c) => c.id === crime.crimeId
            );
            return (
              <AccordionItem value={crime.id} key={crime.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4 items-center">
                    <span className="text-left font-semibold">
                      {selectedCrime?.nome || `Crime ${index + 1}`}
                    </span>
                    <Badge variant="secondary">
                      {formatPena(crime.penaDefinitiva)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 px-2 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>Pena-Base (1ª Fase):</span>
                    <span>{formatPena(crime.penaPrimeiraFase)}</span>
                  </div>
                  <CalculationDetails
                    circunstancias={crime.circunstanciasJudiciais}
                    causas={[]}
                    causasData={causasData}
                    type="increase"
                  />

                  <div className="flex justify-between font-medium pt-2 border-t mt-2">
                    <span>Pena Provisória (2ª Fase):</span>
                    <span>{formatPena(crime.penaProvisoria)}</span>
                  </div>
                  <CalculationDetails
                    circunstancias={crime.agravantes}
                    causas={[]}
                    causasData={causasData}
                    type="increase"
                  />
                  <CalculationDetails
                    circunstancias={crime.atenuantes}
                    causas={[]}
                    causasData={causasData}
                    type="decrease"
                  />

                  <div className="flex justify-between font-medium pt-2 border-t mt-2">
                    <span>Pena Definitiva (3ª Fase):</span>
                    <span>{formatPena(crime.penaDefinitiva)}</span>
                  </div>
                  <CalculationDetails
                    circunstancias={[]}
                    causas={crime.causasAumento}
                    causasData={causasData}
                    type="increase"
                  />
                  <CalculationDetails
                    circunstancias={[]}
                    causas={crime.causasDiminuicao}
                    causasData={causasData}
                    type="decrease"
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {state.crimes.length > 1 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Label>Concurso de Crimes</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Material (soma), Formal (exaspera a mais grave) ou
                      Continuado (exaspera a mais grave).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={state.concurso}
              onValueChange={(value: "material" | "formal" | "continuado") =>
                dispatch({ type: "UPDATE_CONCURSO", payload: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material (Art. 69, CP)</SelectItem>
                <SelectItem value="formal">Formal (Art. 70, CP)</SelectItem>
                <SelectItem value="continuado">
                  Crime Continuado (Art. 71, CP)
                </SelectItem>
              </SelectContent>
            </Select>

            {state.concurso === "formal" && (
              <Select
                value={state.tipoConcursoFormal}
                onValueChange={(value: "proprio" | "improprio") =>
                  dispatch({
                    type: "UPDATE_TIPO_CONCURSO_FORMAL",
                    payload: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprio">Próprio (Exasperação)</SelectItem>
                  <SelectItem value="improprio">Impróprio (Cúmulo)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {state.concurso === "continuado" && (
              <Select
                value={state.tipoCrimeContinuado}
                onValueChange={(value: "simples" | "especifico") =>
                  dispatch({
                    type: "UPDATE_TIPO_CRIME_CONTINUADO",
                    payload: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples (Exasperação)</SelectItem>
                  <SelectItem value="especifico">
                    Específico (Até o triplo)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {showSalarioMinimoInput && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Salário Mínimo (para cálculo da multa)</Label>
            <Input
              type="number"
              value={state.salarioMinimo}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_SALARIO_MINIMO",
                  payload: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <Label>Detração (Períodos de prisão provisória)</Label>
          {state.detracaoPeriodos.map((periodo) => (
            <div
              key={periodo.id}
              className="grid grid-cols-2 gap-2 items-center"
            >
              <DatePicker
                date={periodo.inicio}
                setDate={(date) =>
                  dispatch({
                    type: "UPDATE_DETRACAO_PERIODO",
                    payload: { ...periodo, inicio: date },
                  })
                }
              />
              <div className="flex items-center gap-2">
                <DatePicker
                  date={periodo.fim}
                  setDate={(date) =>
                    dispatch({
                      type: "UPDATE_DETRACAO_PERIODO",
                      payload: { ...periodo, fim: date },
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_DETRACAO_PERIODO",
                      payload: periodo.id,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => dispatch({ type: "ADD_DETRACAO_PERIODO" })}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Período
          </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-1">
            <Label>Remição da Pena</Label>
            <p className="text-sm text-muted-foreground">
              A cada 3 dias de trabalho ou 12 horas de estudo, 1 dia de pena é
              remido.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
            <Input
              id="diasTrabalhados"
              type="number"
              placeholder="Total de dias"
              value={state.remicao.diasTrabalhados}
              min={0}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_REMICAO",
                  payload: {
                    ...state.remicao,
                    diasTrabalhados: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horasEstudo">Horas de Estudo</Label>
            <Input
              id="horasEstudo"
              type="number"
              placeholder="Total de horas"
              value={state.remicao.horasEstudo}
              min={0}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_REMICAO",
                  payload: {
                    ...state.remicao,
                    horasEstudo: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        </div>
        <FinalSummary />
        <ExecutionSummary />
      </CardContent>
    </Card>
  );
}
