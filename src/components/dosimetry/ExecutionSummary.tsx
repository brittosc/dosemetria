// src/components/dosimetry/ExecutionSummary.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ExecutionTimeline } from "./ExecutionTimeline";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/date-picker";

export function ExecutionSummary() {
  const { state, dispatch } = useDosimetryCalculator();
  const { finalResults } = state;

  // Apenas renderiza se houver dados de progressão para exibir
  if (
    !finalResults.progressionSteps ||
    finalResults.progressionSteps.length === 0
  ) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full mt-4">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data de Início do Cumprimento da Pena</Label>
            <p className="text-sm text-muted-foreground">
              Esta é a data base para o cálculo da progressão e término da pena.
              Geralmente, é a data da prisão.
            </p>
            <DatePicker
              date={state.dataInicioCumprimento}
              setDate={(date) =>
                dispatch({
                  type: "UPDATE_DATA_INICIO_CUMPRIMENTO",
                  payload: date || new Date(),
                })
              }
            />
          </div>
          <ExecutionTimeline />
        </CardContent>
      </Card>
    </motion.div>
  );
}
