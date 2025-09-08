// src/app/report/page.tsx

"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPena } from "@/lib/calculations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PenaGraph } from "@/components/dosimetry/PenaGraph";
import {
  agravantesOptions,
  atenuantesOptions,
} from "@/app/data/circunstancias";
import causasData from "@/app/data/causas.json"; // CORREÇÃO: Importação default do JSON
import { Crime } from "@/types/crime";
import crimesData from "@/app/data/crimes.json";
import { CausaAplicada } from "@/lib/calculations";

export default function ReportPage() {
  const { state } = useDosimetryCalculator();
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const allCircunstancias = [...agravantesOptions, ...atenuantesOptions];

  return (
    <main className="container mx-auto p-4 md:p-8 bg-white text-black">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
          main {
            padding: 0;
            margin: 0;
          }
          .print-card {
            border: 1px solid #e5e7eb;
            box-shadow: none;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="no-print flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatório do Cálculo</h1>
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mr-2"
          >
            Voltar
          </Button>
          <Button onClick={handlePrint}>Imprimir / Salvar PDF</Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="print-card">
          <CardHeader>
            <CardTitle>Memorial de Cálculo de Pena</CardTitle>
            <CardDescription>
              Relatório gerado em{" "}
              {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
        </Card>

        {state.crimes.map((crime, index) => {
          const crimeInfo = (crimesData as Crime[]).find(
            (c: Crime) => c.id === crime.crimeId // CORREÇÃO: Adicionada tipagem explícita
          );
          return (
            <Card key={crime.id} className="print-card">
              <CardHeader>
                <CardTitle>
                  Crime {index + 1}: {crimeInfo?.nome} (Art. {crimeInfo?.artigo}
                  )
                </CardTitle>
                <CardDescription>
                  Data do Fato:{" "}
                  {crime.dataCrime
                    ? format(new Date(crime.dataCrime), "PPP", {
                        locale: ptBR,
                      })
                    : "Não informada"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 1ª Fase */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    1ª Fase - Pena-Base
                  </h3>
                  <p>
                    Pena em abstrato: {formatPena(crimeInfo?.penaMinimaMeses)} a{" "}
                    {formatPena(crimeInfo?.penaMaximaMeses)}
                  </p>
                  <p>
                    Pena-base fixada em:{" "}
                    <strong>{formatPena(crime.penaBase)}</strong>
                  </p>
                  {crime.circunstanciasJudiciais.length > 0 && (
                    <div className="mt-2 pl-4">
                      <p className="font-medium">
                        Circunstâncias Judiciais Desfavoráveis:
                      </p>
                      <ul className="list-disc list-inside text-sm">
                        {crime.circunstanciasJudiciais.map((circ) => (
                          <li key={circ.id}>
                            {circ.id} (+{circ.fracao})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="font-bold mt-2">
                    Total 1ª Fase: {formatPena(crime.penaPrimeiraFase)}
                  </p>
                </div>

                <Separator />

                {/* 2ª Fase */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    2ª Fase - Pena Provisória
                  </h3>
                  {crime.agravantes.length > 0 && (
                    <div className="mt-2 pl-4">
                      <p className="font-medium">Agravantes:</p>
                      <ul className="list-disc list-inside text-sm">
                        {crime.agravantes.map((agr) => {
                          const info = allCircunstancias.find(
                            (c) => c.id === agr.id
                          );
                          return (
                            <li key={agr.id}>
                              {info?.label} (+{agr.fracao})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {crime.atenuantes.length > 0 && (
                    <div className="mt-2 pl-4">
                      <p className="font-medium">Atenuantes:</p>
                      <ul className="list-disc list-inside text-sm">
                        {crime.atenuantes.map((atn) => {
                          const info = allCircunstancias.find(
                            (c) => c.id === atn.id
                          );
                          return (
                            <li key={atn.id}>
                              {info?.label} (-{atn.fracao})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <p className="font-bold mt-2">
                    Total 2ª Fase (Pena Provisória):{" "}
                    {formatPena(crime.penaProvisoria)}
                  </p>
                </div>

                <Separator />

                {/* 3ª Fase */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    3ª Fase - Pena Definitiva
                  </h3>
                  {crime.causasAumento.length > 0 && (
                    <div className="mt-2 pl-4">
                      <p className="font-medium">Causas de Aumento:</p>
                      <ul className="list-disc list-inside text-sm">
                        {crime.causasAumento.map((causa: CausaAplicada) => {
                          // CORREÇÃO: Adicionada tipagem explícita
                          const info = causasData.find(
                            (c) => c.id === causa.id
                          );
                          return (
                            <li key={causa.id}>
                              {info?.descricao} (+
                              {typeof causa.valorAplicado === "string"
                                ? causa.valorAplicado
                                : (
                                    (causa.valorAplicado as number) * 100
                                  ).toFixed(2) + "%"}
                              )
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {crime.causasDiminuicao.length > 0 && (
                    <div className="mt-2 pl-4">
                      <p className="font-medium">Causas de Diminuição:</p>
                      <ul className="list-disc list-inside text-sm">
                        {crime.causasDiminuicao.map((causa: CausaAplicada) => {
                          // CORREÇÃO: Adicionada tipagem explícita
                          const info = causasData.find(
                            (c) => c.id === causa.id
                          );
                          return (
                            <li key={causa.id}>
                              {info?.descricao} (-
                              {typeof causa.valorAplicado === "string"
                                ? causa.valorAplicado
                                : (
                                    (causa.valorAplicado as number) * 100
                                  ).toFixed(2) + "%"}
                              )
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <p className="font-bold mt-2 text-xl text-red-700">
                    Pena Definitiva: {formatPena(crime.penaDefinitiva)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="print-card">
          <CardHeader>
            <CardTitle>Gráfico das Penas</CardTitle>
          </CardHeader>
          <CardContent>
            <PenaGraph />
          </CardContent>
        </Card>

        <Card className="print-card">
          <CardHeader>
            <CardTitle>Resumo Final da Execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Pena Total (sem detração/remição):</strong>{" "}
              {formatPena(state.finalResults.penaTotal)}
            </p>
            <p>
              <strong>Total de Detração:</strong>{" "}
              {state.finalResults.totalDetracaoDias} dias
            </p>
            <p>
              <strong>Total de Remição:</strong>{" "}
              {state.finalResults.totalRemicaoDias} dias
            </p>
            <p className="font-bold">
              Pena a cumprir (com abatimentos):{" "}
              {formatPena(state.finalResults.penaParaRegime)}
            </p>
            <Separator className="my-4" />
            <p>
              <strong>Regime Inicial:</strong>{" "}
              {state.finalResults.regimeInicial}
            </p>
            <p>
              <strong>
                Progressão de Regime (
                {((state.finalResults.progression?.fracao || 0) * 100).toFixed(
                  0
                )}
                %):
              </strong>{" "}
              Cumprir {formatPena(state.finalResults.progression?.tempo)}
            </p>
            <p>
              <strong>
                Livramento Condicional (
                {state.finalResults.livramentoCondicional?.fracao
                  ? `${(
                      state.finalResults.livramentoCondicional.fracao * 100
                    ).toFixed(0)}%`
                  : "N/A"}
                ):
              </strong>{" "}
              {state.finalResults.livramentoCondicional
                ? `Cumprir ${formatPena(
                    state.finalResults.livramentoCondicional?.tempo
                  )}`
                : "Não aplicável"}
            </p>
            <Separator className="my-4" />
            <p>
              <strong>Pode Substituir a Pena:</strong>{" "}
              {state.finalResults.podeSubstituir ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Pode Sursis:</strong>{" "}
              {state.finalResults.podeSursis ? "Sim" : "Não"}
            </p>
            {state.finalResults.dataFinalPena && (
              <p>
                <strong>Previsão de Término da Pena:</strong>{" "}
                {format(state.finalResults.dataFinalPena, "PPP", {
                  locale: ptBR,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
