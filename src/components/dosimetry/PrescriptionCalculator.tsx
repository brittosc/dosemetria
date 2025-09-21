// src/components/dosimetry/PrescriptionCalculator.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { calculatePrescription, formatPena } from "@/lib/calculations";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { motion } from "framer-motion";

const prescriptionSchema = z.object({
  pena: z.number().min(0, "A pena deve ser positiva."),
  tipo: z.enum(["punitiva", "executoria"]),
  reincidente: z.boolean(),
  menorDe21: z.boolean(),
  maiorDe70: z.boolean(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export function PrescriptionCalculator() {
  const [prescriptionResult, setPrescriptionResult] = useState<number | null>(
    null,
  );

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      pena: 0,
      tipo: "punitiva",
      reincidente: false,
      menorDe21: false,
      maiorDe70: false,
    },
  });

  function onSubmit(values: PrescriptionFormValues) {
    const result = calculatePrescription(
      values.pena,
      values.tipo,
      values.reincidente,
      values.menorDe21,
      values.maiorDe70,
    );
    setPrescriptionResult(result);
  }

  const tipoPenaLabel =
    form.watch("tipo") === "punitiva"
      ? "Pena Máxima em Abstrato (meses)"
      : "Pena Concretamente Aplicada (meses)";

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Prescrição</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="punitiva" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Da Pretensão Punitiva
                      </FormLabel>
                    </FormItem>
                    <FormDescription className="pl-7 text-xs">
                      Antes da sentença transitar em julgado.
                    </FormDescription>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="executoria" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Da Pretensão Executória
                      </FormLabel>
                    </FormItem>
                    <FormDescription className="pl-7 text-xs">
                      Após o trânsito em julgado da condenação.
                    </FormDescription>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tipoPenaLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reincidente"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Réu reincidente?</FormLabel>
                  <FormDescription>
                    Aumenta o prazo da prescrição da pretensão executória em
                    1/3.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="menorDe21"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Agente era menor de 21 anos na data do fato?
                  </FormLabel>
                  <FormDescription>Reduz o prazo pela metade.</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maiorDe70"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Agente era maior de 70 anos na data da sentença?
                  </FormLabel>
                  <FormDescription>Reduz o prazo pela metade.</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">Calcular Prescrição</Button>
        </form>
      </Form>
      {prescriptionResult !== null && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold">A prescrição ocorrerá em:</p>
          <p className="text-xl font-bold text-green-700">
            {formatPena(prescriptionResult)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
