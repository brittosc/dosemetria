"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phaseTwoSchema } from "@/lib/schemas";
import { formatPena } from "@/lib/calculations";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox"; // Certifique-se de ter este componente do shadcn

// Tipos para as props
type PhaseTwoProps = {
  initialValues: z.infer<typeof phaseTwoSchema>;
  penaPrimeiraFase: number;
  onFormSubmit: (data: z.infer<typeof phaseTwoSchema>) => void;
  onGoBack: () => void;
};

// Opções extraídas dos Arts. 61, 62, 65 e 66 do Código Penal
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

export function PhaseTwo({
  initialValues,
  penaPrimeiraFase,
  onFormSubmit,
  onGoBack,
}: PhaseTwoProps) {
  const form = useForm<z.infer<typeof phaseTwoSchema>>({
    resolver: zodResolver(phaseTwoSchema),
    defaultValues: initialValues,
  });

  const onSubmit = (data: z.infer<typeof phaseTwoSchema>) => {
    onFormSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>2ª Fase: Cálculo da Pena Provisória</CardTitle>
        <CardDescription>
          Selecione as circunstâncias agravantes e atenuantes. A pena atual de
          partida é:
          <span className="font-bold"> {formatPena(penaPrimeiraFase)}</span>.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Agravantes */}
            <div>
              <FormLabel className="text-base font-semibold">
                Circunstâncias Agravantes (Arts. 61 e 62)
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {agravantesOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="agravantes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Atenuantes */}
            <div>
              <FormLabel className="text-base font-semibold">
                Circunstâncias Atenuantes (Arts. 65 e 66)
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {atenuantesOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="atenuantes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onGoBack}>
              Voltar para 1ª Fase
            </Button>
            <Button type="submit">Calcular Pena Provisória e Avançar</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
