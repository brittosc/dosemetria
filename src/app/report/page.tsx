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
import causasData from "@/app/data/causas.json";
import { Crime } from "@/types/crime";
import crimesData from "@/app/data/crimes.json";
import { CausaAplicada } from "@/lib/calculations";
import { ExecutionTimeline } from "@/components/dosimetry/ExecutionTimeline";

export default function ReportPage() {
  const { state } = useDosimetryCalculator();
  const router = useRouter();

  if (state.crimes.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Nenhum crime para exibir</h1>
        <p className="text-muted-foreground mb-6">
          Adicione pelo menos um crime na calculadora para gerar um relatório.
        </p>
        <Button onClick={() => router.push("/")}>
          Voltar para a Calculadora
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const allCircunstancias = [...agravantesOptions, ...atenuantesOptions];

  return (
    <main className="container mx-auto p-4 md:p-8 bg-white text-black">
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print,
          header {
            display: none;
          }
          main {
            padding: 1cm;
            margin: 0;
            width: 100%;
          }
          .print-card {
            border: none;
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
            (c: Crime) => c.id === crime.crimeId,
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
                            (c) => c.id === agr.id,
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
                            (c) => c.id === atn.id,
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
                          const info = causasData.find(
                            (c) => c.id === causa.id,
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
                          const info = causasData.find(
                            (c) => c.id === causa.id,
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

        <Card className="print-card no-print">
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
              <strong>Data de Início do Cumprimento:</strong>{" "}
              {format(new Date(state.dataInicioCumprimento), "PPP", {
                locale: ptBR,
              })}
            </p>
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
            <Separator className="my-4" />
            <ExecutionTimeline />
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
                {format(new Date(state.finalResults.dataFinalPena), "PPP", {
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
