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
import {
  agravantesOptions,
  atenuantesOptions,
} from "@/app/data/circunstancias";

interface PhaseTwoContentProps {
  form: UseFormReturn<CrimeState>;
}

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
