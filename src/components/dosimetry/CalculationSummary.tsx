"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function CalculationSummary() {
  const { state, dispatch, crimesData } = useDosimetryCalculator();

  return (
    <Card className="w-full sticky top-8">
      <CardHeader>
        <CardTitle>Resumo e Finalização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.crimes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Adicione um crime para ver o resumo do cálculo.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
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
                  <AccordionContent className="space-y-2 px-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pena-Base (1ª Fase):</span>
                      <span className="font-medium">
                        {formatPena(crime.penaPrimeiraFase)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pena Provisória (2ª Fase):</span>
                      <span className="font-medium">
                        {formatPena(crime.penaProvisoria)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pena Definitiva (3ª Fase):</span>
                      <span className="font-medium">
                        {formatPena(crime.penaDefinitiva)}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {state.crimes.length > 1 && (
          <>
            <div className="space-y-2 pt-4 border-t">
              <Label>Concurso de Crimes</Label>
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
                  <SelectItem value="material">
                    Material (soma as penas)
                  </SelectItem>
                  <SelectItem value="formal">
                    Formal (aumenta a pena mais grave)
                  </SelectItem>
                  <SelectItem value="continuado">
                    Crime Continuado (aumenta a pena mais grave)
                  </SelectItem>
                </SelectContent>
              </Select>
              {state.concurso !== "material" && (
                <p className="text-xs text-muted-foreground mt-2">
                  A fração de aumento é calculada automaticamente com base no
                  número de crimes.
                </p>
              )}
            </div>
          </>
        )}

        {state.crimes.length > 0 && (
          <>
            <div className="space-y-2 pt-4 border-t">
              <Label>Detração (Tempo de prisão provisória)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Anos"
                  value={state.detracao.anos}
                  min={0}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        anos: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Meses"
                  value={state.detracao.meses}
                  min={0}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        meses: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Dias"
                  value={state.detracao.dias}
                  min={0}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        dias: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
            <FinalSummary />
          </>
        )}
      </CardContent>
    </Card>
  );
}
