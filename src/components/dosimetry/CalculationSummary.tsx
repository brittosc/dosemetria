"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FinalSummary } from "./FinalSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatPena } from "@/lib/calculations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export function CalculationSummary() {
  const { state, dispatch, crimesData, causasData } = useDosimetryCalculator();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo e Finalização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.crimes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Adicione um crime para ver o resumo do cálculo.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {state.crimes.map((crime, index) => {
              const selectedCrime = crimesData.find(
                (c) => c.id === crime.crimeId
              );
              return (
                <AccordionItem value={crime.id} key={crime.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{selectedCrime?.nome || `Crime ${index + 1}`}</span>
                      <span className="font-bold text-primary">
                        {crime.penaDefinitiva != null
                          ? formatPena(crime.penaDefinitiva)
                          : "--"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-2">
                    {/* Fase 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          1ª Fase - Pena-Base:
                        </p>
                        <span className="text-sm font-bold">
                          {formatPena(crime.penaPrimeiraFase || 0)}
                        </span>
                      </div>
                      {crime.circunstanciasJudiciais.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold">
                            Circunstâncias Judiciais:
                          </p>
                          <ul>
                            {crime.circunstanciasJudiciais.map((c) => (
                              <li key={c.id}>
                                - {c.id} ({c.fracao})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* Fase 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          2ª Fase - Pena Provisória:
                        </p>
                        <span className="text-sm font-bold">
                          {formatPena(crime.penaProvisoria || 0)}
                        </span>
                      </div>
                      {crime.agravantes.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold">Agravantes:</p>
                          <ul>
                            {crime.agravantes.map((c) => (
                              <li key={c.id}>
                                -{" "}
                                {
                                  agravantesOptions.find(
                                    (opt) => opt.id === c.id
                                  )?.label
                                }{" "}
                                ({c.fracao})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {crime.atenuantes.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold">Atenuantes:</p>
                          <ul>
                            {crime.atenuantes.map((c) => (
                              <li key={c.id}>
                                -{" "}
                                {
                                  atenuantesOptions.find(
                                    (opt) => opt.id === c.id
                                  )?.label
                                }{" "}
                                ({c.fracao})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* Fase 3 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          3ª Fase - Pena Definitiva:
                        </p>
                        <span className="text-sm font-bold">
                          {formatPena(crime.penaDefinitiva || 0)}
                        </span>
                      </div>
                      {crime.causasAumento.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold">Causas de Aumento:</p>
                          <ul>
                            {crime.causasAumento.map((c) => (
                              <li key={c.id}>
                                -{" "}
                                {
                                  causasData.find((cd) => cd.id === c.id)
                                    ?.descricao
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {crime.causasDiminuicao.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold">Causas de Diminuição:</p>
                          <ul>
                            {crime.causasDiminuicao.map((c) => (
                              <li key={c.id}>
                                -{" "}
                                {
                                  causasData.find((cd) => cd.id === c.id)
                                    ?.descricao
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {state.crimes.length > 0 && (
          <>
            <div className="space-y-2 pt-4 border-t">
              <Label>Concurso de Crimes</Label>
              <Select
                value={state.concurso}
                onValueChange={(value: "material" | "formal" | "continuado") =>
                  dispatch({ type: "UPDATE_CONCURSO", payload: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="continuado">Crime Continuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Detração</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Anos"
                  value={state.detracao.anos}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        anos: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Meses"
                  value={state.detracao.meses}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        meses: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Dias"
                  value={state.detracao.dias}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_DETRACAO",
                      payload: {
                        ...state.detracao,
                        dias: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
            <FinalSummary />
          </>
        )}
      </CardContent>
    </Card>
  );
}
