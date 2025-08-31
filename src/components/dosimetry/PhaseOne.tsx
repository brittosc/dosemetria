"use client";

import { useForm } from "react-hook-form";
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
  FormField,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

// Define o tipo inferido do schema para ser reutilizado
type PhaseOneFormValues = z.infer<typeof phaseOneSchema>;

// Tipos para as props
type PhaseOneProps = {
  crimesData: any[];
  selectedCrime?: any;
  initialValues: PhaseOneFormValues;
  onSelectCrime: (crimeId: string) => void;
  onFormSubmit: (data: PhaseOneFormValues) => void;
};

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
  // A tipagem <PhaseOneFormValues> foi adicionada aqui para corrigir os erros
  const form = useForm<PhaseOneFormValues>({
    resolver: zodResolver(phaseOneSchema),
    defaultValues: initialValues,
  });

  const handleCrimeChange = (crimeId: string) => {
    onSelectCrime(crimeId);
    form.setValue("crimeId", crimeId);
    // Reseta a pena base para o mínimo do novo crime
    const crime = crimesData.find((c) => c.id === crimeId);
    if (crime) {
      form.setValue("penaBase", crime.penaMinimaMeses);
    }
  };

  const onSubmit = (data: PhaseOneFormValues) => {
    onFormSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>1ª Fase: Fixação da Pena-Base</CardTitle>
        <CardDescription>
          Defina o crime e as circunstâncias judiciais do Art. 59 do Código
          Penal.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="crimeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crime</FormLabel>
                  <Select
                    onValueChange={handleCrimeChange}
                    defaultValue={field.value}
                  >
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCrime && (
              <>
                <FormField
                  control={form.control}
                  name="penaBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pena-Base (em meses)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Pena entre {selectedCrime.penaMinimaMeses} (mínima) e{" "}
                        {selectedCrime.penaMaximaMeses} (máxima).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunstanciasJudiciais"
                  render={() => (
                    <FormItem>
                      <FormLabel>Circunstâncias Judiciais (Art. 59)</FormLabel>
                      <FormDescription>
                        Selecione as que forem desfavoráveis. Cada uma aumenta a
                        pena em 1/6.
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {circunstanciasJudiciaisOptions.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="circunstanciasJudiciais"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                      checked={field.value?.includes(item)}
                                      onChange={(e) => {
                                        const newValues = e.target.checked
                                          ? [...(field.value || []), item]
                                          : field.value?.filter(
                                              (value) => value !== item
                                            );
                                        field.onChange(newValues);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataCrime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Crime</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
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
