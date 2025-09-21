// src/components/dosimetry/CrimeCalculator.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crimeStateSchema } from "@/lib/schemas";
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
import { CausaAplicada, Circunstancia, formatPena } from "@/lib/calculations";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Stepper } from "./Stepper";

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
  const { salarioMinimo } = state;

  const form = useForm<CrimeState>({
    resolver: zodResolver(crimeStateSchema),
    defaultValues: crimeState,
    mode: "onChange",
  });

  const { watch, reset, getValues, trigger } = form;

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

  const handlePhaseChange = (newPhase: number) => {
    if (newPhase > 1 && !selectedCrimeId) {
      toast.error("Nenhum crime selecionado", {
        description: "Por favor, selecione um crime na 1ª Fase para continuar.",
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPhase(newPhase);
  };

  const handleNextPhase = async () => {
    // Validação rigorosa da Fase 1 antes de avançar
    if (currentPhase === 1) {
      const fieldsToValidate: (keyof CrimeState)[] = [
        "crimeId",
        "dataCrime",
        "penaBase",
      ];
      // 1. Valida o schema (tipos, campos obrigatórios)
      const isSchemaValid = await trigger(fieldsToValidate);

      if (!isSchemaValid) {
        toast.error("Formulário inválido", {
          description: "Por favor, preencha os campos obrigatórios.",
        });
        return; // BLOQUEIA o avanço
      }

      // 2. Valida a regra de negócio (pena mínima e máxima)
      const { penaBase } = getValues();
      const min = activePena?.penaMinimaMeses ?? 0;
      const max = activePena?.penaMaximaMeses ?? Infinity;

      if (penaBase < min || penaBase > max) {
        toast.error("Pena-base fora dos limites legais", {
          description: `A pena deve ser entre ${formatPena(min)} e ${formatPena(
            max
          )}. O valor foi ajustado.`,
        });
        // Tenta corrigir o valor como última medida, mas ainda impede o avanço
        // para forçar o usuário a ver a correção.
        form.setValue("penaBase", penaBase < min ? min : max);
        return; // BLOQUEIA o avanço
      }
    }

    // Se tudo estiver correto, avança para a próxima fase
    if (currentPhase < 3) {
      handlePhaseChange(currentPhase + 1);
    }
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
          <CardContent className="pt-6">
            <Stepper
              currentPhase={currentPhase}
              setPhase={handlePhaseChange}
              crimeSelected={!!selectedCrimeId}
            />
            <AnimatePresence mode="wait">
              {currentPhase === 1 && (
                <motion.div
                  key="phase1"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={phaseVariants}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <PhaseOneContent
                    form={form}
                    selectedCrime={selectedCrime}
                    activePena={activePena}
                    crimesData={crimesData}
                    handleCrimeChange={handleCrimeChange}
                    handleQualificadoraChange={handleQualificadoraChange}
                    salarioMinimo={salarioMinimo}
                  />
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
                  className="space-y-8"
                >
                  <PhaseTwoContent form={form} />
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
                  className="space-y-8"
                >
                  <PhaseThreeContent
                    form={form}
                    causasData={causasData}
                    isMobile={isMobile}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <div className="flex gap-2">
              {currentPhase > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePhaseChange(currentPhase - 1)}
                >
                  Voltar
                </Button>
              )}
              {removeButton}
            </div>
            {currentPhase < 3 && (
              <Button onClick={handleNextPhase} disabled={!selectedCrime}>
                Avançar
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
