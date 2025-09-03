"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import { Circunstancia } from "@/lib/calculations";
import { Label } from "../ui/label";
import { CrimeState } from "@/app/contexts/DosimetryProvider";

interface PhaseTwoContentProps {
  form: UseFormReturn<CrimeState>;
}

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

export const PhaseTwoContent = ({ form }: PhaseTwoContentProps) => {
  return (
    <>
      <div>
        <FormLabel className="text-base font-semibold">
          Circunstâncias Agravantes (Arts. 61 e 62)
        </FormLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {agravantesOptions.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="agravantes"
              render={({ field }) => {
                const isChecked = field.value?.some(
                  (c: Circunstancia) => c.id === item.id
                );
                const circunstancia = field.value?.find(
                  (c: Circunstancia) => c.id === item.id
                );
                return (
                  <div className="space-y-2 rounded-md border p-3">
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            checked
                              ? field.onChange([
                                  ...(field.value || []),
                                  { id: item.id, fracao: "1/6" },
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (c: Circunstancia) => c.id !== item.id
                                  )
                                )
                          }
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                    {isChecked && (
                      <div className="flex items-center gap-2 pt-2">
                        <Label
                          htmlFor={`fracao-agravante-${item.id}`}
                          className="text-sm"
                        >
                          Fração:
                        </Label>
                        <Input
                          id={`fracao-agravante-${item.id}`}
                          value={circunstancia?.fracao}
                          onChange={(e) => {
                            const newFracao = e.target.value;
                            field.onChange(
                              field.value.map((c: Circunstancia) =>
                                c.id === item.id
                                  ? { ...c, fracao: newFracao }
                                  : c
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <FormLabel className="text-base font-semibold">
          Circunstâncias Atenuantes (Arts. 65 e 66)
        </FormLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {atenuantesOptions.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="atenuantes"
              render={({ field }) => {
                const isChecked = field.value?.some(
                  (c: Circunstancia) => c.id === item.id
                );
                const circunstancia = field.value?.find(
                  (c: Circunstancia) => c.id === item.id
                );
                return (
                  <div className="space-y-2 rounded-md border p-3">
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            checked
                              ? field.onChange([
                                  ...(field.value || []),
                                  { id: item.id, fracao: "1/6" },
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (c: Circunstancia) => c.id !== item.id
                                  )
                                )
                          }
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                    {isChecked && (
                      <div className="flex items-center gap-2 pt-2">
                        <Label
                          htmlFor={`fracao-atenuante-${item.id}`}
                          className="text-sm"
                        >
                          Fração:
                        </Label>
                        <Input
                          id={`fracao-atenuante-${item.id}`}
                          value={circunstancia?.fracao}
                          onChange={(e) => {
                            const newFracao = e.target.value;
                            field.onChange(
                              field.value.map((c: Circunstancia) =>
                                c.id === item.id
                                  ? { ...c, fracao: newFracao }
                                  : c
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
