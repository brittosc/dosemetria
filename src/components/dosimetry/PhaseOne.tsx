"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Checkbox } from "../ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState } from "react";
import { Crime } from "@/types/crime";
export interface PhaseOneFormValues {
  crimeId: string;
  penaBase: number;
  circunstanciasJudiciais: string[];
  dataCrime: Date;
  qualificadoraId?: string;
}

interface PhaseOneProps {
  crimesData: Crime[];
  selectedCrime?: Crime;
  initialValues: PhaseOneFormValues;
  onSelectCrime: (crimeId: string) => void;
  onSelectQualificadora: (qualificadoraId?: string) => void;
  onFormSubmit: (data: PhaseOneFormValues) => void;
}

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
  onSelectQualificadora,
  onFormSubmit,
}: PhaseOneProps) {
  const form = useForm<PhaseOneFormValues>({ defaultValues: initialValues });
  const isMobile = useIsMobile();
  const selectedQualificadoraId = form.watch("qualificadoraId");
  const [openCrimeSelector, setOpenCrimeSelector] = useState(false);
  const [openQualificadoraSelector, setOpenQualificadoraSelector] =
    useState(false);

  const handleCrimeChange = (crimeId: string) => {
    onSelectCrime(crimeId);
    form.setValue("crimeId", crimeId);
    form.setValue("qualificadoraId", undefined);
    const crime = crimesData.find((c) => c.id === crimeId);
    if (crime) {
      form.setValue("penaBase", crime.penaMinimaMeses ?? 0);
      onSelectQualificadora(undefined);
    }
  };

  const handleQualificadoraChange = (qualificadoraId: string) => {
    const finalId =
      qualificadoraId === "sem-qualificadora" ? undefined : qualificadoraId;
    onSelectQualificadora(finalId);
    form.setValue("qualificadoraId", finalId);

    if (selectedCrime) {
      const qualificadora = selectedCrime.qualificadoras?.find(
        (q) => q.id === finalId
      );
      form.setValue(
        "penaBase",
        qualificadora?.penaMinimaMeses ?? selectedCrime.penaMinimaMeses ?? 0
      );
    }
  };

  const onSubmit: SubmitHandler<PhaseOneFormValues> = (data) =>
    onFormSubmit(data);

  const activePena =
    selectedCrime?.qualificadoras?.find(
      (q) => q.id === selectedQualificadoraId
    ) || selectedCrime;

  const renderCrimeSelector = () => {
    const content = (
      <Command>
        <CommandInput
          placeholder="Buscar crime..."
          onFocus={(e) => {
            if (isMobile) {
              e.target.readOnly = true;
            }
          }}
        />
        <CommandEmpty>Nenhum crime encontrado.</CommandEmpty>
        <CommandGroup>
          <CommandList>
            {crimesData.map((crime) => (
              <CommandItem
                value={`${crime.nome} ${crime.artigo}`}
                key={crime.id}
                onSelect={() => {
                  handleCrimeChange(crime.id);
                  setOpenCrimeSelector(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    crime.id === selectedCrime?.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {crime.nome} (Art. {crime.artigo})
              </CommandItem>
            ))}
          </CommandList>
        </CommandGroup>
      </Command>
    );

    if (isMobile) {
      return (
        <Drawer open={openCrimeSelector} onOpenChange={setOpenCrimeSelector}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !selectedCrime && "text-muted-foreground"
              )}
            >
              {selectedCrime
                ? `${selectedCrime.nome} (Art. ${selectedCrime.artigo})`
                : "Selecione o crime"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Selecione o Crime</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">{content}</div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Popover open={openCrimeSelector} onOpenChange={setOpenCrimeSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !selectedCrime && "text-muted-foreground"
            )}
          >
            {selectedCrime
              ? `${selectedCrime.nome} (Art. ${selectedCrime.artigo})`
              : "Selecione o crime"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          {content}
        </PopoverContent>
      </Popover>
    );
  };

  const renderQualificadoraSelector = () => {
    const content = (
      <Select
        value={selectedQualificadoraId || "sem-qualificadora"}
        onValueChange={(value) => {
          handleQualificadoraChange(value);
          if (isMobile) setOpenQualificadoraSelector(false);
        }}
      >
        <SelectContent>
          <SelectItem value="sem-qualificadora">
            Nenhuma (Crime Simples)
          </SelectItem>
          {selectedCrime?.qualificadoras?.map((q) => (
            <SelectItem key={q.id} value={q.id}>
              {q.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    if (isMobile) {
      return (
        <Drawer
          open={openQualificadoraSelector}
          onOpenChange={setOpenQualificadoraSelector}
        >
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedQualificadoraId
                ? selectedCrime?.qualificadoras?.find(
                    (q) => q.id === selectedQualificadoraId
                  )?.nome
                : "Nenhuma (Crime Simples)"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Selecione a Qualificadora</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">{content}</div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Select
        value={selectedQualificadoraId || "sem-qualificadora"}
        onValueChange={handleQualificadoraChange}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma qualificadora" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="sem-qualificadora">
            Nenhuma (Crime Simples)
          </SelectItem>
          {selectedCrime?.qualificadoras?.map((q) => (
            <SelectItem key={q.id} value={q.id}>
              {q.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-1 md:p-0"
        >
          <CardContent className="space-y-6">
            <FormItem className="flex flex-col">
              <FormLabel>Crime</FormLabel>
              <FormControl>{renderCrimeSelector()}</FormControl>
              <FormMessage />
            </FormItem>

            {selectedCrime &&
              selectedCrime.qualificadoras &&
              selectedCrime.qualificadoras.length > 0 && (
                <FormItem>
                  <FormLabel>Qualificadora</FormLabel>
                  <FormControl>{renderQualificadoraSelector()}</FormControl>
                </FormItem>
              )}

            {selectedCrime && (
              <>
                <FormItem>
                  <FormLabel>Pena-Base (em meses)</FormLabel>
                  <Controller
                    name="penaBase"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    )}
                  />
                  {activePena && activePena.penaMinimaMeses !== null && (
                    <FormDescription>
                      Pena entre {activePena.penaMinimaMeses} (mínima) e{" "}
                      {activePena.penaMaximaMeses} (máxima).
                    </FormDescription>
                  )}
                  <FormMessage>
                    {form.formState.errors.penaBase?.message}
                  </FormMessage>
                </FormItem>

                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Circunstâncias Judiciais (Art. 59)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Selecione as que forem desfavoráveis. Cada uma
                            aumenta a pena em 1/6.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {circunstanciasJudiciaisOptions.map((option) => (
                      <Controller
                        key={option}
                        name="circunstanciasJudiciais"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        option,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== option
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                              {option}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>

                <FormItem className="flex flex-col">
                  <FormLabel>Data do Crime</FormLabel>
                  <Controller
                    name="dataCrime"
                    control={form.control}
                    render={({ field }) =>
                      isMobile ? (
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </DrawerContent>
                        </Drawer>
                      ) : (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP", { locale: ptBR })
                                : "Escolha uma data"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )
                    }
                  />
                  <FormMessage>
                    {form.formState.errors.dataCrime?.message}
                  </FormMessage>
                </FormItem>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={!selectedCrime}
              className="w-full md:w-auto"
            >
              Calcular Pena-Base e Avançar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
