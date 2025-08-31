import { z } from "zod";

// Esquema para a seleção inicial do crime
export const crimeSelectionSchema = z.object({
  crimeId: z.string().min(1, "Selecione um crime para começar."),
});

// Esquema para a Primeira Fase
export const phaseOneSchema = crimeSelectionSchema.extend({
  // CORREÇÃO APLICADA AQUI:
  // z.coerce.number() é a forma mais compatível de converter o input
  // de string para número para o react-hook-form.
  penaBase: z.coerce
    .number()
    .positive("A pena-base deve ser um número positivo."),

  circunstanciasJudiciais: z.array(z.string()).optional(),

  dataCrime: z
    .date()
    .min(new Date("1900-01-01"), { message: "A data do crime é obrigatória." }),
});

// Esquema para a Segunda Fase
export const phaseTwoSchema = z.object({
  agravantes: z.array(z.string()).optional(),
  atenuantes: z.array(z.string()).optional(),
});

// Esquema para uma Causa de Aumento/Diminuição individual
const causaSchema = z.object({
  id: z.string(),
  valorAplicado: z.number().min(0).max(1),
});

// Esquema para a Terceira Fase
export const phaseThreeSchema = z.object({
  causasAumento: z.array(causaSchema).optional(),
  causasDiminuicao: z.array(causaSchema).optional(),
});
