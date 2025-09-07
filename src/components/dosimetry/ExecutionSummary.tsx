"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { formatPena } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

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
          {finalResults.progression && (
            <div>
              <p className="font-semibold">Progressão de Regime:</p>
              <p className="text-md text-muted-foreground">
                Fração de{" "}
                <Badge variant="secondary">
                  {(finalResults.progression.fracao * 100).toFixed(0)}%
                </Badge>{" "}
                - A progressão para regime menos rigoroso se dará após o
                cumprimento de{" "}
                <span className="font-bold text-foreground">
                  {formatPena(finalResults.progression.tempo)}
                </span>
                .
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
