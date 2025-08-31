"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phaseOneSchema } from "@/lib/schemas";

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
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

// Tipagem derivada do schema
type PhaseOneFormValues = z.infer<typeof phaseOneSchema>;

// Props
interface Crime {
  id: string;
  nome: string;
  artigo: string;
  penaMinimaMeses: number;
  penaMaximaMeses: number;
}

interface PhaseOneProps {
  crimesData: Crime[];
  selectedCrime?: Crime;
  initialValues: PhaseOneFormValues;
  onSelectCrime: (crimeId: string) => void;
  onFormSubmit: (data: PhaseOneFormValues) => void;
}

// Circunstâncias do Art. 59
const circunstanciasJudiciaisOptions = [
  "Culpabilidade",
  "Antecedentes",
  "Conduta Social",
  "Personalidade do Agente",
  "Motivos",
  "Circunstâncias do Crime",
  "Consequências do Crime",
  "Comportamento da Vítima",
];

export function PhaseOne({
  crimesData,
  selectedCrime,
  initialValues,
  onSelectCrime,
  onFormSubmit,
}: PhaseOneProps) {
  const form = useForm<PhaseOneFormValues>({
    resolver: zodResolver(phaseOneSchema) as unknown as (values: unknown) => Promise<{ values: PhaseOneFormValues; errors: any }>,
    defaultValues: initialValues,
  });

  const handleCrimeChange = (crimeId: string) => {
    onSelectCrime(crimeId);
    form.setValue("crimeId", crimeId);

    const crime = crimesData.find((c) => c.id === crimeId);
    if (crime) form.setValue("penaBase", crime.penaMinimaMeses);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>1ª Fase: Fixação da Pena-Base</CardTitle>
        <CardDescription>
          Defina o crime e as circunstâncias judiciais do Art. 59 do Código Penal.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Seleção do Crime */}
          <FormItem>
            <FormLabel>Crime</FormLabel>
            <Controller
              name="crimeId"
              control={form.control}
              render={({ field }) => (
                <Select defaultValue={field.value} onValueChange={handleCrimeChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o crime..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {crimesData.map((crime) => (
                      <SelectItem key={crime.id} value={crime.id}>
                        {crime.nome} (Art. {crime.artigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormMessage>{form.formState.errors.crimeId?.message}</FormMessage>
          </FormItem>

          {selectedCrime && (
            <>
              {/* Pena Base */}
              <FormItem>
                <FormLabel>Pena-Base (em meses)</FormLabel>
                <Controller
                  name="penaBase"
                  control={form.control}
                  render={({ field }) => <Input type="number" {...field} />}
                />
                <FormDescription>
                  Pena entre {selectedCrime.penaMinimaMeses} (mínima) e {selectedCrime.penaMaximaMeses} (máxima).
                </FormDescription>
                <FormMessage>{form.formState.errors.penaBase?.message}</FormMessage>
              </FormItem>

              {/* Circunstâncias Judiciais */}
              <FormItem>
                <FormLabel>Circunstâncias Judiciais (Art. 59)</FormLabel>
                <FormDescription>
                  Selecione as que forem desfavoráveis. Cada uma aumenta a pena em 1/6.
                </FormDescription>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {circunstanciasJudiciaisOptions.map((option) => (
                    <Controller
                      key={option}
                      name="circunstanciasJudiciais"
                      control={form.control}
                      render={({ field }) => {
                        const checked = field.value?.includes(option) ?? false;
                        return (
                          <div className="flex flex-row items-start space-x-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={checked}
                                onChange={(e) => {
                                  const newValues = e.target.checked
                                    ? [...(field.value || []), option]
                                    : field.value?.filter((v) => v !== option);
                                  field.onChange(newValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{option}</FormLabel>
                          </div>
                        );
                      }}
                    />
                  ))}
                </div>
              </FormItem>

              {/* Data do Crime */}
              <FormItem>
                <FormLabel>Data do Crime</FormLabel>
                <Controller
                  name="dataCrime"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Escolha uma data"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FormMessage>{form.formState.errors.dataCrime?.message}</FormMessage>
              </FormItem>
            </>
          )}

          <CardFooter>
            <Button type="submit" disabled={!selectedCrime}>
              Calcular Pena-Base e Avançar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
