// src/components/dosimetry/ExecutionSummary.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Card, CardContent } from "@/components/ui/card";
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
        <CardContent className="space-y-4">
          <ProgressionTimeline
            progressoes={finalResults.progressionSteps || []}
            fracao={finalResults.progression?.fracao || 0}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
