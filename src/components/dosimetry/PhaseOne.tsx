"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, ChevronsUpDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Crime, Qualificadora } from "@/types/crime";
import { Circunstancia } from "@/lib/calculations";
import { Label } from "../ui/label";
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhaseOneContentProps {
  form: UseFormReturn<CrimeState>;
  selectedCrime?: Crime;
  activePena?: Crime | Qualificadora;
  crimesData: Crime[];
  handleCrimeChange: (crimeId: string) => void;
  handleQualificadoraChange: (qualificadoraId: string) => void;
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

export const PhaseOneContent = ({
  form,
  selectedCrime,
  activePena,
  crimesData,
  handleCrimeChange,
  handleQualificadoraChange,
}: PhaseOneContentProps) => {
  const [openCrimeSelector, setOpenCrimeSelector] = useState(false);
  const isMobile = useIsMobile();

  const CrimeSelectorContent = () => (
    <Command>
      <CommandInput placeholder="Buscar crime..." />
      <CommandEmpty>Nenhum crime encontrado.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {crimesData.map((crime: Crime) => (
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
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <>
      <FormItem className="flex flex-col">
        <FormLabel>Crime</FormLabel>
        {isMobile ? (
          <Drawer open={openCrimeSelector} onOpenChange={setOpenCrimeSelector}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
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
              <div className="p-4">
                <CrimeSelectorContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover open={openCrimeSelector} onOpenChange={setOpenCrimeSelector}>
            <PopoverTrigger asChild>
              <FormControl>
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
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <CrimeSelectorContent />
            </PopoverContent>
          </Popover>
        )}
        <FormMessage />
      </FormItem>

      {selectedCrime && (
        <>
          {selectedCrime.qualificadoras &&
            selectedCrime.qualificadoras.length > 0 && (
              <FormItem>
                <FormLabel>Qualificadora</FormLabel>
                <Select
                  onValueChange={handleQualificadoraChange}
                  value={
                    form.watch("selectedQualificadoraId") || "sem-qualificadora"
                  }
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
                    {selectedCrime.qualificadoras?.map((q: Qualificadora) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}

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
                {" "}
                Pena entre {activePena.penaMinimaMeses} (mínima) e{" "}
                {activePena.penaMaximaMeses} (máxima).{" "}
              </FormDescription>
            )}
            <FormMessage>{form.formState.errors.penaBase?.message}</FormMessage>
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
                      Selecione as que forem desfavoráveis. Cada uma aumenta a
                      pena em 1/6 por padrão.
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
                  render={({ field }) => {
                    const isChecked = field.value?.some(
                      (c: Circunstancia) => c.id === option
                    );
                    const circunstancia = field.value?.find(
                      (c: Circunstancia) => c.id === option
                    );
                    return (
                      <div className="space-y-2 rounded-md border p-3">
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      { id: option, fracao: "1/6" },
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (c: Circunstancia) => c.id !== option
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            {option}
                          </FormLabel>
                        </FormItem>
                        {isChecked && (
                          <div className="flex items-center gap-2 pt-2">
                            <Label
                              htmlFor={`fracao-${option}`}
                              className="text-sm"
                            >
                              Fração:
                            </Label>
                            <Input
                              id={`fracao-${option}`}
                              value={circunstancia?.fracao}
                              onChange={(e) => {
                                const newFracao = e.target.value;
                                field.onChange(
                                  field.value.map((c: Circunstancia) =>
                                    c.id === option
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
          </FormItem>
        </>
      )}
    </>
  );
};
