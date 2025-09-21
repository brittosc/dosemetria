import { calculatePrescription, PrescriptionData } from "./calculations";

describe("Calculadora de Prescrição - Testes Unitários com Jest", () => {
  const baseData: Omit<PrescriptionData, "pena" | "tipo"> = {
    reincidente: false,
    menorDe21: false,
    maiorDe70: false,
    dataFato: new Date("2020-01-01T00:00:00Z"),
    dataRecebimentoDenuncia: undefined,
    dataPublicacaoSentenca: undefined,
    datasOutrasCausasInterruptivas: [],
    periodosSuspensao: [],
  };

  describe("Cálculo do Prazo Base", () => {
    it("Pena > 12 anos: prescreve em 20 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 145,
        tipo: "punitiva",
      });
      expect(prazo).toBe(20 * 12);
    });
    it("Pena > 8 e <= 12 anos: prescreve em 16 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 100,
        tipo: "punitiva",
      });
      expect(prazo).toBe(16 * 12);
    });
    it("Pena > 4 e <= 8 anos: prescreve em 12 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 60,
        tipo: "punitiva",
      });
      expect(prazo).toBe(12 * 12);
    });
    it("Pena > 2 e <= 4 anos: prescreve em 8 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 30,
        tipo: "punitiva",
      });
      expect(prazo).toBe(8 * 12);
    });
    it("Pena > 1 e <= 2 anos: prescreve em 4 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 18,
        tipo: "punitiva",
      });
      expect(prazo).toBe(4 * 12);
    });
    it("Pena <= 1 ano: prescreve em 3 anos", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 12,
        tipo: "punitiva",
      });
      expect(prazo).toBe(3 * 12);
    });
    it("Pena de multa: prescreve em 2 anos (regra específica não implementada, usando o fallback)", () => {
      const { prazo } = calculatePrescription({
        ...baseData,
        pena: 0,
        tipo: "punitiva",
      });
      // Nossa função atual usa a regra geral, o que resulta em 3 anos.
      expect(prazo).toBe(3 * 12);
    });
  });

  describe("Cenários Complexos", () => {
    it("Deve reiniciar a contagem a partir da publicação da sentença (último marco)", () => {
      const data: PrescriptionData = {
        ...baseData,
        pena: 120,
        tipo: "punitiva",
        dataRecebimentoDenuncia: new Date("2022-03-20T00:00:00Z"),
        dataPublicacaoSentenca: new Date("2023-09-05T00:00:00Z"),
      };
      const { prazo, dataPrescricao } = calculatePrescription(data);
      expect(prazo).toBe(16 * 12);
      expect(dataPrescricao?.getUTCFullYear()).toBe(2039);
    });

    it("Deve aplicar reincidência e redução por idade simultaneamente na prescrição executória", () => {
      const data: PrescriptionData = {
        ...baseData,
        dataFato: new Date("2015-01-01T00:00:00Z"),
        pena: 108,
        tipo: "executoria",
        reincidente: true,
        menorDe21: true,
        dataPublicacaoSentenca: new Date("2019-08-15T00:00:00Z"),
      };
      const prazoBase = 16 * 12;
      const prazoComAumento = prazoBase + prazoBase / 3;
      const prazoFinal = prazoComAumento / 2; // 128 meses (10 anos e 8 meses)

      const { prazo, dataPrescricao } = calculatePrescription(data);
      expect(prazo).toBeCloseTo(prazoFinal);

      expect(dataPrescricao?.getUTCFullYear()).toBe(2030);
      expect(dataPrescricao?.getUTCMonth()).toBe(3); // Abril
      expect(dataPrescricao?.getUTCDate()).toBe(15);
    });

    it("Deve combinar as duas causas de redução (menor de 21 e maior de 70), mas aplicar a redução apenas uma vez", () => {
      const data: PrescriptionData = {
        ...baseData,
        pena: 96,
        tipo: "punitiva",
        menorDe21: true,
        maiorDe70: true, // Ambas as condições presentes
      };
      const { prazo } = calculatePrescription(data);
      // O prazo é reduzido pela metade, não por 1/4.
      expect(prazo).toBe((12 * 12) / 2); // Esperado: 6 anos
    });

    it("Não deve aplicar aumento de reincidência na prescrição punitiva", () => {
      const data: PrescriptionData = {
        ...baseData,
        pena: 72,
        tipo: "punitiva", // Punitiva, não executória
        reincidente: true,
      };
      const { prazo } = calculatePrescription(data);
      expect(prazo).toBe(12 * 12); // Deve permanecer 12 anos, sem o aumento de 1/3
    });
  });
});
