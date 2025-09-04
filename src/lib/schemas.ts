import { z } from "zod";

// Esquema para a seleção inicial do crime
export const crimeSelectionSchema = z.object({
  crimeId: z.string().min(1, "Selecione um crime para começar."),
});

// Esquema para uma Causa de Aumento/Diminuição individual
const causaSchema = z.object({
  id: z.string(),
  valorAplicado: z.union([z.number().min(0), z.string()]),
});

// Esquema para a Terceira Fase
export const phaseThreeSchema = z.object({
  causasAumento: z.array(causaSchema).optional(),
  causasDiminuicao: z.array(causaSchema).optional(),
});
