import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
  Causa,
  Circunstancia,
} from "./calculations";

describe("Cálculos de Dosimetria", () => {
  // Testes para a Primeira Fase
  describe("calculatePhaseOne", () => {
    it("deve calcular a pena da primeira fase corretamente", () => {
      const penaBase = 120;
      const circunstancias: Circunstancia[] = [
        { id: "maus-antecedentes", fracao: "1/6" },
      ];
      const penaPrimeiraFase = calculatePhaseOne(penaBase, circunstancias);
      expect(penaPrimeiraFase).toBe(140);
    });

    it("deve retornar a pena base se não houver circunstâncias", () => {
      const penaBase = 72;
      const circunstancias: Circunstancia[] = [];
      const penaPrimeiraFase = calculatePhaseOne(penaBase, circunstancias);
      expect(penaPrimeiraFase).toBe(72);
    });
  });

  // Testes para a Segunda Fase
  describe("calculatePhaseTwo", () => {
    it("deve aplicar agravantes corretamente", () => {
      const penaPrimeiraFase = 140;
      const agravantes: Circunstancia[] = [
        { id: "reincidencia", fracao: "1/6" },
      ];
      const penaProvisoria = calculatePhaseTwo(
        penaPrimeiraFase,
        agravantes,
        [],
        72,
      );
      expect(penaProvisoria).toBeCloseTo(163.33);
    });

    it("deve aplicar atenuantes corretamente", () => {
      const penaPrimeiraFase = 140;
      const atenuantes: Circunstancia[] = [{ id: "confissao", fracao: "1/6" }];
      const penaProvisoria = calculatePhaseTwo(
        penaPrimeiraFase,
        [],
        atenuantes,
        72,
      );
      expect(penaProvisoria).toBeCloseTo(116.67);
    });

    it("não deve reduzir a pena abaixo do mínimo legal", () => {
      const penaPrimeiraFase = 72;
      const atenuantes: Circunstancia[] = [{ id: "menor_21", fracao: "1/6" }];
      const penaProvisoria = calculatePhaseTwo(
        penaPrimeiraFase,
        [],
        atenuantes,
        72,
      );
      expect(penaProvisoria).toBe(72);
    });
  });

  // Testes para a Terceira Fase
  describe("calculatePhaseThree", () => {
    it("deve aplicar causas de aumento corretamente", () => {
      const penaProvisoria = 120;
      const causasAumento = [{ id: "causa_aumento_1", valorAplicado: "1/3" }];
      const causasData: Causa[] = [
        {
          id: "causa_aumento_1",
          tipo: "aumento",
          valor: { tipo: "fracao", fracao: "1/3" },
          artigo: "",
          descricao: "",
          baseLegal: "",
        },
      ];
      const penaDefinitiva = calculatePhaseThree(
        penaProvisoria,
        causasAumento,
        [],
        causasData,
      );
      expect(penaDefinitiva).toBe(160);
    });

    it("deve aplicar causas de diminuição corretamente", () => {
      const penaProvisoria = 120;
      const causasDiminuição = [
        { id: "causa_diminuicao_1", valorAplicado: "1/6" },
      ];
      const causasData: Causa[] = [
        {
          id: "causa_diminuicao_1",
          tipo: "diminuicao",
          valor: { tipo: "fracao", fracao: "1/6" },
          artigo: "",
          descricao: "",
          baseLegal: "",
        },
      ];
      const penaDefinitiva = calculatePhaseThree(
        penaProvisoria,
        [],
        causasDiminuição,
        causasData,
      );
      expect(penaDefinitiva).toBe(100);
    });
  });
});
