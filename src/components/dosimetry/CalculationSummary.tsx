"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Causa,
  calculateMulta,
  calculatePhaseThree,
  formatPena,
} from "@/lib/calculations";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import causasData from "@/app/data/causas.json";
import { Label } from "../ui/label";
import { useMemo } from "react";
import { Slider } from "../ui/slider";

const agravantesOptions = [
  { id: "reincidencia", label: "Reincidência (Art. 61, I)" },
  { id: "motivo_futil_torpe", label: "Motivo fútil ou torpe (Art. 61, II, a)" },
  {
    id: "facilitar_crime",
    label:
      "Facilitar ou assegurar execução, ocultação, impunidade ou vantagem de outro crime (Art. 61, II, b)",
  },
  {
    id: "traicao_emboscada",
    label:
      "Traição, emboscada, dissimulação ou recurso que dificultou/impediu defesa da vítima (Art. 61, II, c)",
  },
  {
    id: "meio_cruel",
    label:
      "Emprego de veneno, fogo, explosivo, tortura ou outro meio insidioso/cruel, ou que podia causar perigo comum (Art. 61, II, d)",
  },
  {
    id: "contra_familia",
    label: "Contra ascendente, descendente, irmão ou cônjuge (Art. 61, II, e)",
  },
  {
    id: "abuso_domestico_mulher",
    label:
      "Com abuso de autoridade, prevalecendo-se de relações domésticas, de coabitação ou hospitalidade, ou com violência contra a mulher (Art. 61, II, f)",
  },
  {
    id: "abuso_poder_profissao",
    label:
      "Com abuso de poder ou violação de dever inerente a cargo, ofício, ministério ou profissão (Art. 61, II, g)",
  },
  {
    id: "contra_vulneravel",
    label:
      "Contra criança, maior de 60 anos, enfermo ou mulher grávida (Art. 61, II, h)",
  },
  {
    id: "sob_protecao_autoridade",
    label:
      "Quando o ofendido estava sob imediata proteção da autoridade (Art. 61, II, i)",
  },
  {
    id: "calamidade_publica",
    label:
      "Em ocasião de incêndio, naufrágio, inundação, calamidade pública ou desgraça particular da vítima (Art. 61, II, j)",
  },
  {
    id: "embriaguez_preordenada",
    label: "Em estado de embriaguez preordenada (Art. 61, II, l)",
  },
  {
    id: "instituicao_ensino",
    label: "Nas dependências de instituição de ensino (Art. 61, II, m)",
  },
];

const atenuantesOptions = [
  {
    id: "menor_21_maior_70",
    label:
      "Menor de 21 anos (no fato) ou maior de 70 anos (na sentença), salvo crimes de violência sexual contra a mulher (Art. 65, I)",
  },
  { id: "desconhecimento_lei", label: "Desconhecimento da lei (Art. 65, II)" },
  {
    id: "relevante_valor",
    label: "Motivo de relevante valor social ou moral (Art. 65, III, a)",
  },
  {
    id: "reparacao_dano",
    label:
      "Espontânea vontade e eficiência em evitar/minorar consequências ou reparação do dano antes do julgamento (Art. 65, III, b)",
  },
  {
    id: "coacao_ou_ordem_emocao",
    label:
      "Sob coação resistível, em cumprimento de ordem de autoridade superior, ou sob violenta emoção provocada por ato injusto da vítima (Art. 65, III, c)",
  },
  {
    id: "confissao",
    label:
      "Confissão espontânea da autoria perante a autoridade (Art. 65, III, d)",
  },
  {
    id: "influencia_multidao",
    label:
      "Sob influência de multidão em tumulto, se não o provocou (Art. 65, III, e)",
  },
  {
    id: "circunstancia_relevante",
    label:
      "Outra circunstância relevante, anterior ou posterior ao crime (Art. 66)",
  },
];

const SALARIO_MINIMO = 1518; // Salário mínimo de 2025

export function CalculationSummary() {
  const { state, selectedCrime, actions } = useDosimetryCalculator();
  const { results, phaseOneData, phaseTwoData, phaseThreeData } = state;

  const previewPenaDefinitiva = useMemo(() => {
    if (results.penaProvisoria === undefined) return undefined;
    return calculatePhaseThree(
      results.penaProvisoria,
      phaseThreeData.causasAumento,
      phaseThreeData.causasDiminuicao,
      causasData as Causa[]
    );
  }, [
    results.penaProvisoria,
    phaseThreeData.causasAumento,
    phaseThreeData.causasDiminuicao,
  ]);

  const totalMulta = useMemo(() => {
    return calculateMulta(
      phaseThreeData.diasMulta,
      phaseThreeData.valorDiaMulta,
      SALARIO_MINIMO
    );
  }, [phaseThreeData.diasMulta, phaseThreeData.valorDiaMulta]);

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

  const handleFinalize = () => {
    actions.calculateAndProceed();
    toast.success("Cálculo Finalizado!", {
      description: "A pena definitiva foi calculada com sucesso.",
    });
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
            <p>{`Mínima: ${
              selectedCrime.penaMinimaMeses !== null
                ? formatPena(selectedCrime.penaMinimaMeses)
                : "--"
            } / Máxima: ${
              selectedCrime.penaMaximaMeses !== null
                ? formatPena(selectedCrime.penaMaximaMeses)
                : "--"
            }`}</p>
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
              disabled={results.penaPrimeiraFase == null}
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
              disabled={results.penaProvisoria == null}
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
              disabled={results.penaDefinitiva == null}
              onClick={() => handleCopy(getPhaseThreeText())}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xl font-bold text-green-700">
            {results.penaDefinitiva != null
              ? formatPena(results.penaDefinitiva)
              : previewPenaDefinitiva != null
              ? formatPena(previewPenaDefinitiva)
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
        {selectedCrime?.temMulta && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Cálculo da Multa</h3>
            <div className="space-y-2">
              <Label>Dias-multa: {phaseThreeData.diasMulta}</Label>
              <Slider
                min={10}
                max={360}
                step={1}
                value={[phaseThreeData.diasMulta]}
                onValueChange={(value) =>
                  actions.updatePhaseThree({ diasMulta: value[0] })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                Valor do Dia-multa: R${" "}
                {(phaseThreeData.valorDiaMulta * SALARIO_MINIMO).toFixed(2)}
              </Label>
              <Slider
                min={1 / 30}
                max={5}
                step={1 / 30}
                value={[phaseThreeData.valorDiaMulta]}
                onValueChange={(value) =>
                  actions.updatePhaseThree({ valorDiaMulta: value[0] })
                }
              />
            </div>
            <div>
              <Label className="text-lg font-semibold">Total da Multa:</Label>
              <p className="text-xl font-bold">R$ {totalMulta.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
      {state.currentPhase === 3 && results.penaDefinitiva == null && (
        <CardFooter>
          <Button onClick={handleFinalize} className="w-full">
            Finalizar Cálculo
          </Button>
        </CardFooter>
      )}
      {results.penaDefinitiva != null && (
        <CardFooter className="flex-col items-start gap-4">
          <div>
            <p className="font-semibold">Data Final da Pena:</p>
            <p>
              {results.dataFinalPena
                ? results.dataFinalPena.toLocaleDateString("pt-BR")
                : "--"}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
