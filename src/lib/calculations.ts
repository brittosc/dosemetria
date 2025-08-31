// src/lib/calculations.ts

export type Causa = {
  id: string;
  artigo: string;
  descricao: string;
  tipo: string;
  valor: {
    tipo: "fracao" | "multiplicador" | "range";
    valor?: number;
    min?: number;
    max?: number;
  };
};

export type CausaAplicada = {
  id: string;
  valorAplicado: number;
};

/**
 * Calcula a pena definitiva aplicando causas de aumento e diminuição
 * em cascata sobre a pena provisória.
 *
 * @param penaProvisoria - valor da pena provisória
 * @param causasAumento - array de causas de aumento aplicadas
 * @param causasDiminuicao - array de causas de diminuição aplicadas
 * @param causasData - array com todas as causas possíveis
 * @returns pena definitiva após aplicação das causas
 */
export function calculatePhaseThree(
  penaProvisoria: number,
  causasAumento: CausaAplicada[],
  causasDiminuicao: CausaAplicada[],
  causasData: Causa[]
): number {
  let penaAtual = penaProvisoria;

  // Aplica todas as causas de aumento em cascata
  causasAumento.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;

    switch (causaInfo.valor.tipo) {
      case "fracao":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual += penaAtual * causaInfo.valor.valor;
        }
        break;
      case "multiplicador":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual *= causaInfo.valor.valor;
        }
        break;
      case "range":
        if (
          causaInfo.valor.min !== undefined &&
          causaInfo.valor.max !== undefined
        ) {
          const range = causaInfo.valor.max - causaInfo.valor.min;
          const fracao =
            causaInfo.valor.min + range * causaAplicada.valorAplicado;
          penaAtual += penaAtual * fracao;
        }
        break;
    }
  });

  // Aplica todas as causas de diminuição em cascata
  causasDiminuicao.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;

    switch (causaInfo.valor.tipo) {
      case "fracao":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual -= penaAtual * causaInfo.valor.valor;
        }
        break;
      case "multiplicador":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual /= causaInfo.valor.valor;
        }
        break;
      case "range":
        if (
          causaInfo.valor.min !== undefined &&
          causaInfo.valor.max !== undefined
        ) {
          const range = causaInfo.valor.max - causaInfo.valor.min;
          const fracao =
            causaInfo.valor.min + range * causaAplicada.valorAplicado;
          penaAtual -= penaAtual * fracao;
        }
        break;
    }
  });

  return penaAtual;
}

/**
 * Formata o valor da pena para exibição
 *
 * @param pena - valor da pena
 * @returns pena formatada como string
 */
export function formatPena(pena: number): string {
  return `${pena.toFixed(2)} anos`;
}
