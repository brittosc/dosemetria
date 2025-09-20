"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { formatPena, formatCurrency } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FinalSummary() {
  const { state } = useDosimetryCalculator();
  const { finalResults } = state;

  const showMulta =
    finalResults.multaTotal !== undefined && finalResults.multaTotal > 0;

  // CORREÇÃO: Garante que a data seja um objeto Date antes de formatar
  const dataFinalPenaFormatada = finalResults.dataFinalPena
    ? new Date(finalResults.dataFinalPena).toLocaleDateString("pt-BR")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full mt-4">
        <CardContent className="space-y-4">
          {state.crimes.length > 0}
          <div>
            <p className="font-semibold">Pena Total (sem abatimentos):</p>
            <p className="text-xl font-bold text-green-700">
              {finalResults.penaTotal != null
                ? formatPena(finalResults.penaTotal)
                : "--"}
            </p>
          </div>
          {showMulta && (
            <div>
              <p className="font-semibold">Multa Total:</p>
              <p className="text-lg font-bold">
                {finalResults.multaTotal != null
                  ? formatCurrency(finalResults.multaTotal)
                  : "--"}
              </p>
            </div>
          )}
          <div>
            <p className="font-semibold">Pena Líquida (para fins de regime):</p>
            <p className="text-md text-muted-foreground">
              (Pena total - Detração - Remição) ={" "}
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
          {dataFinalPenaFormatada && (
            <div>
              <p className="font-semibold">Previsão de Término da Pena:</p>
              <p>{dataFinalPenaFormatada}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
