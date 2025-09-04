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
import { CausaAplicada, Circunstancia } from "@/lib/calculations";
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
  const isMobile = useIsMobile();

  const form = useForm<CrimeState>({
    defaultValues: crimeState,
  });

  const { watch, reset } = form;

  const selectedCrimeId = watch("crimeId");
  const selectedQualificadoraId = watch("selectedQualificadoraId");

  const selectedCrime = crimesData.find((c: Crime) => c.id === selectedCrimeId);
  const activePena =
    selectedCrime?.qualificadoras?.find(
      (q: Qualificadora) => q.id === selectedQualificadoraId
    ) || selectedCrime;

  useEffect(() => {
    const subscription = watch((value) => {
      const payload = { ...crimeState, ...value };

      // Corrigido: Assegura que os arrays são do tipo correto.
      payload.circunstanciasJudiciais = (
        payload.circunstanciasJudiciais || []
      ).filter(Boolean) as Circunstancia[];
      payload.agravantes = (payload.agravantes || []).filter(
        Boolean
      ) as Circunstancia[];
      payload.atenuantes = (payload.atenuantes || []).filter(
        Boolean
      ) as Circunstancia[];
      payload.causasAumento = (payload.causasAumento || []).filter(
        Boolean
      ) as CausaAplicada[];
      payload.causasDiminuicao = (payload.causasDiminuicao || []).filter(
        Boolean
      ) as CausaAplicada[];

      // Corrigido: Assegura ao TypeScript que o payload corresponde ao tipo esperado.
      dispatch({
        type: "UPDATE_CRIME",
        payload: payload as Partial<CrimeState> & { id: string },
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch, crimeState]);

  const handleCrimeChange = (crimeId: string) => {
    const crime = crimesData.find((c: Crime) => c.id === crimeId);
    const updatedCrimeState = {
      ...crimeState,
      crimeId: crimeId,
      penaBase: crime?.penaMinimaMeses ?? 0,
      selectedQualificadoraId: undefined,
      agravantes: [],
      atenuantes: [],
      causasAumento: [],
      causasDiminuicao: [],
    };
    dispatch({ type: "UPDATE_CRIME", payload: updatedCrimeState });
    reset(updatedCrimeState);
  };

  const handleQualificadoraChange = (qualificadoraId: string) => {
    const finalId =
      qualificadoraId === "sem-qualificadora" ? undefined : qualificadoraId;
    const qualificadora = selectedCrime?.qualificadoras?.find(
      (q: Qualificadora) => q.id === finalId
    );
    const penaBase =
      qualificadora?.penaMinimaMeses ?? selectedCrime?.penaMinimaMeses ?? 0;

    const updatedCrimeState = {
      ...crimeState,
      selectedQualificadoraId: finalId,
      penaBase: penaBase,
    };

    dispatch({ type: "UPDATE_CRIME", payload: updatedCrimeState });
    reset(updatedCrimeState);
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
        <form onSubmit={(e) => e.preventDefault()}>
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
                <Button
                  onClick={() => setCurrentPhase(2)}
                  disabled={!selectedCrime}
                >
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
                <Button onClick={() => setCurrentPhase(3)}>
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
  