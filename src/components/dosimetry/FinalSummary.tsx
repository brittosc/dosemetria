"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { formatPena, formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FinalSummary() {
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
          <CardTitle>Resultado Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">Pena Total (sem detração):</p>
            <p className="text-xl font-bold text-green-700">
              {finalResults.penaTotal != null
                ? formatPena(finalResults.penaTotal)
                : "--"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Multa Total:</p>
            <p className="text-lg font-bold">
              {finalResults.multaTotal != null
                ? formatCurrency(finalResults.multaTotal)
                : "--"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Pena para fins de Regime:</p>
            <p className="text-md text-muted-foreground">
              (Pena total - Detração) ={" "}
              <span className="font-bold">
                {formatPena(finalResults.penaParaRegime)}
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">Regime Inicial de Cumprimento:</p>
            <p className="font-bold">{finalResults.regimeInicial || "--"}</p>
          </div>
          <div>
            <p className="font-semibold">
              Substituição por Pena Restritiva de Direitos:
            </p>
            <p>
              {finalResults.podeSubstituir === undefined
                ? "--"
                : finalResults.podeSubstituir
                ? "Sim"
                : "Não"}
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Suspensão Condicional da Pena (Sursis):
            </p>
            <p>
              {finalResults.podeSursis === undefined
                ? "--"
                : finalResults.podeSursis
                ? "Sim"
                : "Não"}
            </p>
          </div>
          {finalResults.dataFinalPena && (
            <div>
              <p className="font-semibold">
                Data Final da Pena (com detração):
              </p>
              <p>{finalResults.dataFinalPena.toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
