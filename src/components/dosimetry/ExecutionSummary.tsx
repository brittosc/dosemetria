// src/components/dosimetry/ExecutionSummary.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ProgressionTimeline } from "./ProgressionTimeline";

export function ExecutionSummary() {
  const { state } = useDosimetryCalculator();
  const { finalResults } = state;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Execução Penal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressionTimeline
            progressoes={finalResults.progressionSteps || []}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
