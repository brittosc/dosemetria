// src/components/dosimetry/FinalSummary.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { formatPena, formatCurrency } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FinalSummary() {
  const { state } = useDosimetryCalculator();
  const { finalResults } = state;

  const showMulta =
    finalResults.multaTotal !== undefined && finalResults.multaTotal > 0;

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
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                Pena Líquida (para fins de regime):
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      A pena líquida é a pena total com o desconto da detração e
                      remição. É usada para definir o regime inicial e outros
                      benefícios.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-md text-muted-foreground">
              (Pena total - Detração - Remição) ={" "}
              <span className="font-bold">
                {formatPena(finalResults.penaParaRegime)}
              </span>
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">Regime Inicial de Cumprimento:</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <ul className="list-disc pl-4 text-left">
                      <li>
                        <b>Fechado:</b> Pena &gt; 8 anos.
                      </li>
                      <li>
                        <b>Semiaberto:</b> Pena &gt; 4 e &lt;= 8 anos (não
                        reincidente).
                      </li>
                      <li>
                        <b>Aberto:</b> Pena &lt;= 4 anos (não reincidente).
                      </li>
                      <li className="mt-2">
                        <i>O reincidente inicia no regime mais gravoso.</i>
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="font-bold">{finalResults.regimeInicial || "--"}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                Substituição por Pena Restritiva de Direitos:
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-left">
                      <b>Permitida se:</b>
                      <br />- Pena &lt;= 4 anos
                      <br />- Crime sem violência/grave ameaça
                      <br />- Réu não reincidente em crime doloso
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p>
              {finalResults.podeSubstituir === undefined
                ? "--"
                : finalResults.podeSubstituir
                  ? "Sim"
                  : "Não"}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                Suspensão Condicional da Pena (Sursis):
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-left">
                      <b>Permitida se:</b>
                      <br />- Pena &lt;= 2 anos
                      <br />- Não for cabível a substituição da pena
                      <br />- Réu não reincidente em crime doloso
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
              <div className="flex items-center gap-2">
                <p className="font-semibold">Previsão de Término da Pena:</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Data calculada a partir do início do cumprimento, somada
                        à pena líquida.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p>{dataFinalPenaFormatada}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
