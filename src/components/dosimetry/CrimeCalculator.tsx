"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { X } from "lucide-react";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import { Crime, Qualificadora } from "@/types/crime";
import { PhaseOneContent } from "./PhaseOne";
import { PhaseTwoContent } from "./PhaseTwo";
import { PhaseThreeContent } from "./PhaseThree";
import { Circunstancia, CausaAplicada } from "@/lib/calculations";
import { useIsMobile } from "@/hooks/use-mobile";

interface CrimeCalculatorProps {
  crimeState: CrimeState;
  onRemove: () => void;
}

export function CrimeCalculator({
  crimeState,
  onRemove,
}: CrimeCalculatorProps) {
  const { state, dispatch, crimesData, causasData } = useDosimetryCalculator();
  const [currentPhase, setCurrentPhase] = useState(1);
  const form = useForm<CrimeState>({ defaultValues: crimeState });
  const isMobile = useIsMobile();
  const selectedCrimeId = form.watch("crimeId");
  const selectedQualificadoraId = form.watch("selectedQualificadoraId");

  const selectedCrime = crimesData.find((c: Crime) => c.id === selectedCrimeId);
  const activePena =
    selectedCrime?.qualificadoras?.find(
      (q: Qualificadora) => q.id === selectedQualificadoraId
    ) || selectedCrime;

  useEffect(() => {
    const subscription = form.watch((value) => {
      const {
        circunstanciasJudiciais = [],
        agravantes = [],
        atenuantes = [],
        causasAumento = [],
        causasDiminuicao = [],
        ...rest
      } = value;

      const payload = {
        ...crimeState,
        ...rest,
        circunstanciasJudiciais: circunstanciasJudiciais.filter(
          (c): c is Circunstancia => !!c
        ),
        agravantes: agravantes.filter((c): c is Circunstancia => !!c),
        atenuantes: atenuantes.filter((c): c is Circunstancia => !!c),
        causasAumento: causasAumento.filter((c): c is CausaAplicada => !!c),
        causasDiminuicao: causasDiminuicao.filter(
          (c): c is CausaAplicada => !!c
        ),
      };

      dispatch({ type: "UPDATE_CRIME", payload });
    });
    return () => subscription.unsubscribe();
  }, [form, crimeState, dispatch]);

  const handleCrimeChange = (crimeId: string) => {
    const crime = crimesData.find((c: Crime) => c.id === crimeId);
    const updatedCrimeState: Partial<CrimeState> = {
      crimeId: crimeId,
      penaBase: crime?.penaMinimaMeses ?? 0,
      selectedQualificadoraId: undefined,
    };
    dispatch({
      type: "UPDATE_CRIME",
      payload: { ...crimeState, ...updatedCrimeState },
    });
    form.reset({ ...crimeState, ...updatedCrimeState });
  };

  const handleQualificadoraChange = (qualificadoraId: string) => {
    const finalId =
      qualificadoraId === "sem-qualificadora" ? undefined : qualificadoraId;
    const qualificadora = selectedCrime?.qualificadoras?.find(
      (q: Qualificadora) => q.id === finalId
    );
    const penaBase =
      qualificadora?.penaMinimaMeses ?? selectedCrime?.penaMinimaMeses ?? 0;

    const updatedCrimeState: Partial<CrimeState> = {
      selectedQualificadoraId: finalId,
      penaBase: penaBase,
    };

    dispatch({
      type: "UPDATE_CRIME",
      payload: { ...crimeState, ...updatedCrimeState },
    });
    form.reset({ ...crimeState, ...updatedCrimeState });
  };

  const handleUpdateAndAdvance = (nextPhase: number) => {
    const values = form.getValues();
    dispatch({ type: "UPDATE_CRIME", payload: { ...crimeState, ...values } });
    setCurrentPhase(nextPhase);
  };

  const removeButton = state.crimes.length > 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={onRemove}
      className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
    >
      <X className="h-4 w-4" />
      Remover
    </Button>
  );

  return (
    <Card className="w-full">
      <Form {...form}>
        <form>
          {currentPhase === 1 && (
            <>
              <CardContent className="space-y-6 pt-6">
                <PhaseOneContent
                  form={form}
                  selectedCrime={selectedCrime}
                  activePena={activePena}
                  crimesData={crimesData}
                  handleCrimeChange={handleCrimeChange}
                  handleQualificadoraChange={handleQualificadoraChange}
                />
              </CardContent>
              <CardFooter className="flex justify-between mt-4">
                <div>{removeButton}</div>
                <Button onClick={() => handleUpdateAndAdvance(2)}>
                  Avançar para 2ª Fase
                </Button>
              </CardFooter>
            </>
          )}

          {currentPhase === 2 && (
            <>
              <CardContent className="space-y-8 pt-6">
                <PhaseTwoContent form={form} />
              </CardContent>
              <CardFooter className="flex justify-between mt-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentPhase(1)}
                  >
                    Voltar
                  </Button>
                  {removeButton}
                </div>
                <Button onClick={() => handleUpdateAndAdvance(3)}>
                  Avançar para 3ª Fase
                </Button>
              </CardFooter>
            </>
          )}

          {currentPhase === 3 && (
            <>
              <CardContent className="space-y-8 pt-6">
                <PhaseThreeContent
                  form={form}
                  causasData={causasData}
                  isMobile={isMobile}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentPhase(2)}
                  >
                    Voltar
                  </Button>
                  {removeButton}
                </div>
              </CardFooter>
            </>
          )}
        </form>
      </Form>
    </Card>
  );
}
