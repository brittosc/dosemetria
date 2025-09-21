import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
  calculateRegimeInicial,
  canSubstituirPena,
  canSursis,
  calculateConcursoMaterial,
  calculateConcursoFormal,
  calculateCrimeContinuado,
} from "./calculations";
// A importação agora funcionará corretamente
import { CrimeState } from "@/app/contexts/DosimetryProvider";
import type { Causa, CausaAplicada } from "./calculations";

// Mock de dados para causas, necessário para a Fase 3
const mockCausasData: Causa[] = [
  {
    id: "tentativa",
    valor: { tipo: "fracao", fracao: "1/3" },
    tipo: "diminuicao",
  } as Causa,
  {
    id: "arma_fogo",
    valor: { tipo: "fracao", fracao: "2/3" },
    tipo: "aumento",
  } as Causa,
  {
    id: "roubo_majorado",
    valor: { tipo: "fracao", fracao: "1/3" },
    tipo: "aumento",
  } as Causa,
  { id: "dobro", valor: { tipo: "dobro" }, tipo: "aumento" } as Causa,
];

describe("Calculadora de Dosimetria - Testes Unitários", () => {
  // ===================================
  // FASE 1: PENA-BASE
  // ===================================
  describe("Fase 1: calculatePhaseOne", () => {
    it("deve retornar a pena-base se não houver circunstâncias judiciais", () => {
      expect(calculatePhaseOne(60, [])).toBe(60);
    });

    it("deve aumentar a pena-base em 1/6 para uma circunstância desfavorável", () => {
      // 60 meses + (1/6 de 60) = 60 + 10 = 70
      expect(
        calculatePhaseOne(60, [{ id: "culpabilidade", fracao: "1/6" }]),
      ).toBe(70);
    });

    it("deve aumentar a pena-base corretamente para múltiplas circunstâncias", () => {
      // 60 meses + (1/6 de 60) + (1/8 de 60) = 60 + 10 + 7.5 = 77.5
      const circunstancias = [
        { id: "culpabilidade", fracao: "1/6" },
        { id: "antecedentes", fracao: "1/8" },
      ];
      expect(calculatePhaseOne(60, circunstancias)).toBeCloseTo(77.5);
    });
  });

  // ===================================
  // FASE 2: PENA PROVISÓRIA
  // ===================================
  describe("Fase 2: calculatePhaseTwo", () => {
    it("deve aumentar a pena com uma agravante", () => {
      // 70 + (1/6 de 70) = 70 + 11.666...
      expect(
        calculatePhaseTwo(70, [{ id: "reincidencia", fracao: "1/6" }], [], 48),
      ).toBeCloseTo(81.67);
    });

    it("deve diminuir a pena com uma atenuante", () => {
      // 70 - (1/6 de 70) = 70 - 11.666...
      expect(
        calculatePhaseTwo(70, [], [{ id: "confissao", fracao: "1/6" }], 48),
      ).toBeCloseTo(58.33);
    });

    it("deve compensar agravantes com atenuantes", () => {
      const agravantes = [{ id: "reincidencia", fracao: "1/6" }];
      const atenuantes = [{ id: "confissao", fracao: "1/6" }];
      expect(calculatePhaseTwo(70, agravantes, atenuantes, 48)).toBe(70);
    });

    it("não deve reduzir a pena abaixo do mínimo legal (Súmula 231 do STJ)", () => {
      const atenuantes = [{ id: "menoridade", fracao: "1/6" }];
      // Pena-base no mínimo legal (48 meses)
      expect(calculatePhaseTwo(48, [], atenuantes, 48)).toBe(48);
    });
  });

  // ===================================
  // FASE 3: PENA DEFINITIVA
  // ===================================
  describe("Fase 3: calculatePhaseThree", () => {
    it("deve aplicar uma causa de diminuição (ex: tentativa)", () => {
      const penaProvisoria = 60;
      const causasDiminuicao: CausaAplicada[] = [
        { id: "tentativa", valorAplicado: "1/3" },
      ];
      // 60 - (1/3 de 60) = 60 - 20 = 40
      expect(
        calculatePhaseThree(
          penaProvisoria,
          [],
          causasDiminuicao,
          mockCausasData,
        ),
      ).toBe(40);
    });

    it("deve aplicar uma causa de aumento (ex: roubo majorado)", () => {
      const penaProvisoria = 72;
      const causasAumento: CausaAplicada[] = [
        { id: "roubo_majorado", valorAplicado: "1/3" },
      ];
      // 72 + (1/3 de 72) = 72 + 24 = 96
      expect(
        calculatePhaseThree(penaProvisoria, causasAumento, [], mockCausasData),
      ).toBe(96);
    });

    it("deve aplicar causas de aumento e diminuição na ordem correta", () => {
      const penaProvisoria = 72;
      const causasAumento: CausaAplicada[] = [
        { id: "roubo_majorado", valorAplicado: "1/3" },
      ];
      const causasDiminuicao: CausaAplicada[] = [
        { id: "tentativa", valorAplicado: "1/3" },
      ];

      // Primeiro aumenta: 72 + (1/3 de 72) = 96
      // Depois diminui: 96 - (1/3 de 96) = 96 - 32 = 64
      expect(
        calculatePhaseThree(
          penaProvisoria,
          causasAumento,
          causasDiminuicao,
          mockCausasData,
        ),
      ).toBe(64);
    });

    it('deve aplicar corretamente uma causa de aumento do tipo "dobro"', () => {
      const penaProvisoria = 48;
      const causasAumento: CausaAplicada[] = [
        { id: "dobro", valorAplicado: 2 },
      ];
      expect(
        calculatePhaseThree(penaProvisoria, causasAumento, [], mockCausasData),
      ).toBe(96);
    });
  });

  // ===================================
  // CONCURSO DE CRIMES
  // ===================================
  describe("Concurso de Crimes", () => {
    const crime1: CrimeState = { penaDefinitiva: 60 } as CrimeState; // 5 anos
    const crime2: CrimeState = { penaDefinitiva: 96 } as CrimeState; // 8 anos

    it("Concurso Material: deve somar as penas", () => {
      expect(calculateConcursoMaterial([crime1, crime2])).toBe(156); // 13 anos
    });

    it("Concurso Formal Próprio: deve aplicar a pena mais grave aumentada de 1/6 (2 crimes)", () => {
      // Pena mais grave (96) + 1/6 de 96 = 96 + 16 = 112
      expect(calculateConcursoFormal([crime1, crime2], "proprio")).toBe(112);
    });

    it("Crime Continuado: deve aplicar a pena mais grave aumentada de 1/6 (2 crimes)", () => {
      expect(calculateCrimeContinuado([crime1, crime2], "simples")).toBe(112);
    });
  });

  // ===================================
  // REGIME, SUBSTITUIÇÃO E SURSIS
  // ===================================
  describe("Regime, Substituição e Sursis", () => {
    it("deve definir o regime Fechado para penas > 8 anos", () => {
      expect(calculateRegimeInicial(108, false)).toBe("Fechado"); // 9 anos
    });
    it("deve definir o regime Semiaberto para penas entre 4 e 8 anos (primário)", () => {
      expect(calculateRegimeInicial(72, false)).toBe("Semiaberto"); // 6 anos
    });
    it("deve definir o regime Fechado para penas entre 4 e 8 anos (reincidente)", () => {
      expect(calculateRegimeInicial(72, true)).toBe("Fechado"); // 6 anos
    });

    it("deve permitir a substituição para pena <= 4 anos, primário e sem violência", () => {
      expect(canSubstituirPena(48, false, false)).toBe(true);
    });
    it("NÃO deve permitir a substituição se o crime tiver violência", () => {
      expect(canSubstituirPena(36, false, true)).toBe(false);
    });

    it("deve permitir o Sursis para pena <= 2 anos se a substituição não for cabível", () => {
      // Não pode substituir por ser reincidente, mas pode ter sursis
      expect(canSursis(24, false, false)).toBe(true);
    });
  });
});
