"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPena } from "@/lib/calculations";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import causasData from "@/app/data/causas.json";

const agravantesOptions = [
  { id: "reincidencia", label: "Reincidência (Art. 61, I)" },
  { id: "motivo_futil_torpe", label: "Motivo fútil ou torpe (Art. 61, II, a)" },
  {
    id: "facilitar_crime",
    label: "Para facilitar/assegurar outro crime (Art. 61, II, b)",
  },
  {
    id: "traicao_emboscada",
    label: "Traição, emboscada, dissimulação (Art. 61, II, c)",
  },
  {
    id: "meio_cruel",
    label: "Emprego de veneno, fogo, tortura (Art. 61, II, d)",
  },
  {
    id: "contra_familia",
    label: "Contra ascendente, descendente, irmão ou cônjuge (Art. 61, II, e)",
  },
  { id: "abuso_autoridade", label: "Com abuso de autoridade (Art. 61, II, f)" },
  {
    id: "contra_crianca_idoso",
    label:
      "Contra criança, maior de 60 anos, enfermo ou grávida (Art. 61, II, h)",
  },
  {
    id: "organiza_cooperacao",
    label: "Organiza a cooperação no crime (Art. 62, I)",
  },
];

const atenuantesOptions = [
  {
    id: "menor_21_maior_70",
    label:
      "Agente menor de 21 (no fato) ou maior de 70 (na sentença) (Art. 65, I)",
  },
  { id: "desconhecimento_lei", label: "Desconhecimento da lei (Art. 65, II)" },
  {
    id: "relevante_valor",
    label: "Relevante valor social ou moral (Art. 65, III, a)",
  },
  { id: "confissao", label: "Confissão espontânea (Art. 65, III, d)" },
  {
    id: "influencia_emocao",
    label:
      "Sob influência de violenta emoção, provocada por ato injusto da vítima (Art. 65, III, c)",
  },
  {
    id: "outra_relevante",
    label:
      "Circunstância relevante, anterior ou posterior ao crime (Inominada) (Art. 66)",
  },
];

export function CalculationSummary() {
  const { state, selectedCrime } = useDosimetryCalculator();
  const { results, phaseOneData, phaseTwoData, phaseThreeData } = state;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const getPhaseOneText = () => {
    const qualificadora = selectedCrime?.qualificadoras?.find(
      (q) => q.id === phaseOneData.selectedQualificadoraId
    );
    let text = `Resumo da 1ª Fase:\n`;
    text += `Crime: ${selectedCrime?.nome || "Nenhum"}\n`;
    if (qualificadora) {
      text += `Qualificadora: ${qualificadora.nome}\n`;
    }
    text += `Pena Base: ${formatPena(phaseOneData.penaBase)}\n`;
    text += `Circunstâncias Judiciais Desfavoráveis: ${
      phaseOneData.circunstanciasJudiciais.length > 0
        ? phaseOneData.circunstanciasJudiciais.join(", ")
        : "Nenhuma"
    }\n`;
    text += `Pena-Base Fixada: ${
      results.penaPrimeiraFase != null
        ? formatPena(results.penaPrimeiraFase)
        : "--"
    }`;
    return text;
  };

  const getPhaseTwoText = () => {
    let text = `Resumo da 2ª Fase:\n`;
    text += `Pena da 1ª Fase: ${
      results.penaPrimeiraFase != null
        ? formatPena(results.penaPrimeiraFase)
        : "--"
    }\n`;
    text += `Agravantes: ${
      phaseTwoData.agravantes.length > 0
        ? phaseTwoData.agravantes
            .map((id) => agravantesOptions.find((opt) => opt.id === id)?.label)
            .join(", ")
        : "Nenhuma"
    }\n`;
    text += `Atenuantes: ${
      phaseTwoData.atenuantes.length > 0
        ? phaseTwoData.atenuantes
            .map((id) => atenuantesOptions.find((opt) => opt.id === id)?.label)
            .join(", ")
        : "Nenhuma"
    }\n`;
    text += `Pena Provisória: ${
      results.penaProvisoria != null ? formatPena(results.penaProvisoria) : "--"
    }`;
    return text;
  };

  const getPhaseThreeText = () => {
    let text = `Resumo da 3ª Fase:\n`;
    text += `Pena Provisória: ${
      results.penaProvisoria != null ? formatPena(results.penaProvisoria) : "--"
    }\n`;
    text += `Causas de Aumento: ${
      phaseThreeData.causasAumento.length > 0
        ? phaseThreeData.causasAumento
            .map(
              (causa) => causasData.find((c) => c.id === causa.id)?.descricao
            )
            .join(", ")
        : "Nenhuma"
    }\n`;
    text += `Causas de Diminuição: ${
      phaseThreeData.causasDiminuicao.length > 0
        ? phaseThreeData.causasDiminuicao
            .map(
              (causa) => causasData.find((c) => c.id === causa.id)?.descricao
            )
            .join(", ")
        : "Nenhuma"
    }\n`;
    text += `Pena Definitiva: ${
      results.penaDefinitiva != null ? formatPena(results.penaDefinitiva) : "--"
    }`;
    return text;
  };

  const selectedQualificadora = selectedCrime?.qualificadoras?.find(
    (q) => q.id === state.phaseOneData.selectedQualificadoraId
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo do Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold">Crime Selecionado:</p>
          <p>{selectedCrime?.nome || "Nenhum"}</p>
        </div>
        {selectedQualificadora && (
          <div>
            <p className="font-semibold">Qualificadora:</p>
            <p>{selectedQualificadora.nome}</p>
          </div>
        )}
        {selectedCrime && (
          <div>
            <p className="font-semibold">Pena em Abstrato:</p>
            <p>{`Mínima: ${formatPena(
              selectedCrime.penaMinimaMeses
            )} / Máxima: ${formatPena(selectedCrime.penaMaximaMeses)}`}</p>
          </div>
        )}
        <hr />

        {/* Fase 1 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">1ª Fase - Pena-Base Fixada:</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(getPhaseOneText())}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-lg font-bold">
            {results.penaPrimeiraFase != null
              ? formatPena(results.penaPrimeiraFase)
              : "--"}
          </p>
          {phaseOneData.circunstanciasJudiciais.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Circunstâncias Judiciais:</p>
              <ul>
                {phaseOneData.circunstanciasJudiciais.map((c) => (
                  <li key={c}>- {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Fase 2 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">2ª Fase - Pena Provisória:</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(getPhaseTwoText())}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-lg font-bold">
            {results.penaProvisoria != null
              ? formatPena(results.penaProvisoria)
              : "--"}
          </p>
          {phaseTwoData.agravantes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Agravantes:</p>
              <ul>
                {phaseTwoData.agravantes.map((id) => (
                  <li key={id}>
                    - {agravantesOptions.find((opt) => opt.id === id)?.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {phaseTwoData.atenuantes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Atenuantes:</p>
              <ul>
                {phaseTwoData.atenuantes.map((id) => (
                  <li key={id}>
                    - {atenuantesOptions.find((opt) => opt.id === id)?.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Fase 3 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-green-600">
              3ª Fase - Pena Definitiva:
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(getPhaseThreeText())}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xl font-bold text-green-700">
            {results.penaDefinitiva != null
              ? formatPena(results.penaDefinitiva)
              : "--"}
          </p>
          {phaseThreeData.causasAumento.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Causas de Aumento:</p>
              <ul>
                {phaseThreeData.causasAumento.map((causa) => (
                  <li key={causa.id}>
                    - {causasData.find((c) => c.id === causa.id)?.descricao}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {phaseThreeData.causasDiminuicao.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Causas de Diminuição:</p>
              <ul>
                {phaseThreeData.causasDiminuicao.map((causa) => (
                  <li key={causa.id}>
                    - {causasData.find((c) => c.id === causa.id)?.descricao}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
