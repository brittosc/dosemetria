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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  const { watch, reset, getValues } = form;

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
      dataCrime: new Date(),
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

  const handleNextPhase = (nextPhase: number) => {
    const { penaBase } = getValues();
    const min = activePena?.penaMinimaMeses;
    const max = activePena?.penaMaximaMeses;

    if (min != null && max != null && (penaBase < min || penaBase > max)) {
      toast.error("Pena-base inválida", {
        description: `O valor da pena-base deve estar entre ${min} e ${max} meses.`,
      });
      return;
    }
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

  const phaseVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <Card className="w-full overflow-hidden">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {currentPhase === 1 && (
              <motion.div
                key="phase1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={phaseVariants}
                transition={{ duration: 0.3 }}
              >
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
                    onClick={() => handleNextPhase(2)}
                    disabled={!selectedCrime}
                  >
                    Avançar para 2ª Fase
                  </Button>
                </CardFooter>
              </motion.div>
            )}

            {currentPhase === 2 && (
              <motion.div
                key="phase2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={phaseVariants}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}

            {currentPhase === 3 && (
              <motion.div
                key="phase3"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={phaseVariants}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </Card>
  );
}
