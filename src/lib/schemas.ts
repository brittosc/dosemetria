// src/lib/schemas.ts
import { z } from "zod";

export const crimeSelectionSchema = z.object({
  crimeId: z.string().min(1, "Selecione um crime para começar."),
});

const causaSchema = z.object({
  id: z.string(),
  valorAplicado: z.union([z.number().min(0), z.string()]),
});

const circunstanciaSchema = z.object({
  id: z.string(),
  fracao: z.string(),
});

// Adiciona uma função para obter o final do dia
const getEndOfDay = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const crimeStateSchema = z.object({
  id: z.string(),
  crimeId: z.string().optional(),
  penaBase: z.number().min(0, "A pena-base deve ser um valor positivo."),
  circunstanciasJudiciais: z.array(circunstanciaSchema),
  dataCrime: z
    .date()
    .max(getEndOfDay(), { message: "A data do crime não pode ser no futuro." })
    .optional(),
  selectedQualificadoraId: z.string().optional(),
  agravantes: z.array(circunstanciaSchema),
  atenuantes: z.array(circunstanciaSchema),
  causasAumento: z.array(causaSchema),
  causasDiminuicao: z.array(causaSchema),
  penaPrimeiraFase: z.number().optional(),
  penaProvisoria: z.number().optional(),
  penaDefinitiva: z.number().optional(),
  penaMulta: z.object({
    diasMulta: z.number(),
    valorDiaMulta: z.number(),
  }),
  resultadoMorte: z.boolean(),
});

export const phaseThreeSchema = z.object({
  causasAumento: z.array(causaSchema).optional(),
  causasDiminuicao: z.array(causaSchema).optional(),
});
