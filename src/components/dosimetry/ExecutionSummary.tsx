// src/components/dosimetry/ExecutionSummary.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ExecutionTimeline } from "./ExecutionTimeline";

export function ExecutionSummary() {
  const { state } = useDosimetryCalculator();
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
          <ExecutionTimeline />
        </CardContent>
      </Card>
    </motion.div>
  );
}
