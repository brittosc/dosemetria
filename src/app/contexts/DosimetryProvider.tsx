// src/app/contexts/DosimetryProvider.tsx

"use client";

import React, {
  createContext,
  useReducer,
  useMemo,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import causasDataRaw from "@/app/data/causas.json";
import crimesDataRaw from "@/app/data/crimes.json";
import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
  Causa,
  CausaAplicada,
  Circunstancia,
  calculateConcursoMaterial,
  calculateConcursoFormal,
  calculateCrimeContinuado,
  calculateRegimeInicial,
  canSubstituirPena,
  canSursis,
  calculateFinalDate,
  calculateMulta,
  calculateProgression,
  calculateAllProgressions,
  calculateDetracaoTotal,
  calculateRemicaoTotal,
  calculateLivramentoCondicional,
} from "@/lib/calculations";
import { Crime } from "@/types/crime";

export interface DetracaoPeriodo {
  id: string;
  inicio?: Date;
  fim?: Date;
}

export interface Remicao {
  diasTrabalhados: number;
  horasEstudo: number;
}

export interface CrimeState {
  id: string;
  crimeId?: string;
  penaBase: number;
  circunstanciasJudiciais: Circunstancia[];
  dataCrime?: Date;
  selectedQualificadoraId?: string;
  agravantes: Circunstancia[];
  atenuantes: Circunstancia[];
  causasAumento: CausaAplicada[];
  causasDiminuicao: CausaAplicada[];
  penaPrimeiraFase?: number;
  penaProvisoria?: number;
  penaDefinitiva?: number;
  penaMulta: {
    diasMulta: number;
    valorDiaMulta: number;
  };
  resultadoMorte: boolean;
}

export interface DosimetryState {
  crimes: CrimeState[];
  detracaoPeriodos: DetracaoPeriodo[];
  remicao: Remicao;
  dataInicioCumprimento: Date; // NOVO CAMPO
  concurso: "material" | "formal" | "continuado";
  salarioMinimo: number;
  finalResults: {
    penaTotal?: number;
    totalDetracaoDias?: number;
    totalRemicaoDias?: number;
    penaParaRegime?: number;
    regimeInicial?: string;
    podeSubstituir?: boolean;
    podeSursis?: boolean;
    dataFinalPena?: Date;
    multaTotal?: number;
    progression?: { fracao: number; tempo: number };
    progressionSteps?: {
      regime: string;
      tempoCumprir: number;
      penaRestante: number;
    }[];
    livramentoCondicional?: {
      fracao: number;
      tempo: number;
      data?: Date;
    } | null;
  };
}

type Action =
  | { type: "ADD_CRIME" }
  | { type: "REMOVE_CRIME"; payload: string }
  | { type: "UPDATE_CRIME"; payload: Partial<CrimeState> & { id: string } }
  | { type: "UPDATE_CONCURSO"; payload: "material" | "formal" | "continuado" }
  | { type: "ADD_DETRACAO_PERIODO" }
  | { type: "REMOVE_DETRACAO_PERIODO"; payload: string }
  | { type: "UPDATE_DETRACAO_PERIODO"; payload: DetracaoPeriodo }
  | { type: "UPDATE_REMICAO"; payload: Remicao }
  | { type: "UPDATE_DATA_INICIO_CUMPRIMENTO"; payload: Date } // NOVA AÇÃO
  | { type: "UPDATE_SALARIO_MINIMO"; payload: number }
  | { type: "RECALCULATE_FINALS" }
  | { type: "LOAD_STATE"; payload: DosimetryState }
  | { type: "RESET" };

const initialCrimeState: Omit<CrimeState, "id"> = {
  crimeId: undefined,
  penaBase: 0,
  circunstanciasJudiciais: [],
  dataCrime: new Date(),
  selectedQualificadoraId: undefined,
  agravantes: [],
  atenuantes: [],
  causasAumento: [],
  causasDiminuicao: [],
  penaMulta: {
    diasMulta: 10,
    valorDiaMulta: 1 / 30,
  },
  resultadoMorte: false,
};

const initialState: DosimetryState = {
  crimes: [],
  detracaoPeriodos: [],
  remicao: { diasTrabalhados: 0, horasEstudo: 0 },
  dataInicioCumprimento: new Date(), // VALOR INICIAL
  concurso: "material",
  salarioMinimo: 1518,
  finalResults: {},
};

function calculateCrimePens(crime: CrimeState): CrimeState {
  // ... (sem alterações nesta função) ...
  const crimesData: Crime[] = crimesDataRaw as Crime[];
  const selectedCrime = crimesData.find((c) => c.id === crime.crimeId);
  const activePena =
    selectedCrime?.qualificadoras?.find(
      (q) => q.id === crime.selectedQualificadoraId
    ) || selectedCrime;
  const penaMinima = activePena?.penaMinimaMeses ?? 0;

  const penaPrimeiraFase = calculatePhaseOne(
    crime.penaBase,
    crime.circunstanciasJudiciais
  );

  const penaProvisoria = calculatePhaseTwo(
    penaPrimeiraFase,
    crime.agravantes,
    crime.atenuantes,
    penaMinima
  );

  const penaDefinitiva = calculatePhaseThree(
    penaProvisoria,
    crime.causasAumento,
    crime.causasDiminuicao,
    causasDataRaw as Causa[]
  );
  return {
    ...crime,
    penaPrimeiraFase,
    penaProvisoria,
    penaDefinitiva,
  };
}

function dosimetryReducer(
  state: DosimetryState,
  action: Action
): DosimetryState {
  switch (action.type) {
    case "RESET":
      return { ...initialState, crimes: [] };
    case "LOAD_STATE":
      return action.payload;
    case "ADD_CRIME":
      return {
        ...state,
        crimes: [
          ...state.crimes,
          { id: crypto.randomUUID(), ...initialCrimeState },
        ],
      };
    case "REMOVE_CRIME":
      return {
        ...state,
        crimes: state.crimes.filter((crime) => crime.id !== action.payload),
      };
    case "UPDATE_CRIME": {
      const updatedCrimes = state.crimes.map((crime) =>
        crime.id === action.payload.id ? { ...crime, ...action.payload } : crime
      );
      const calculatedCrimes = updatedCrimes.map((crime) =>
        crime.id === action.payload.id && crime.crimeId
          ? calculateCrimePens(crime)
          : crime
      );
      return { ...state, crimes: calculatedCrimes };
    }
    case "UPDATE_CONCURSO":
      return { ...state, concurso: action.payload };
    case "ADD_DETRACAO_PERIODO":
      return {
        ...state,
        detracaoPeriodos: [
          ...state.detracaoPeriodos,
          { id: crypto.randomUUID() },
        ],
      };
    case "REMOVE_DETRACAO_PERIODO":
      return {
        ...state,
        detracaoPeriodos: state.detracaoPeriodos.filter(
          (p) => p.id !== action.payload
        ),
      };
    case "UPDATE_DETRACAO_PERIODO":
      return {
        ...state,
        detracaoPeriodos: state.detracaoPeriodos.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "UPDATE_REMICAO":
      return { ...state, remicao: action.payload };
    case "UPDATE_DATA_INICIO_CUMPRIMENTO": // NOVO CASE
      return { ...state, dataInicioCumprimento: action.payload };
    case "UPDATE_SALARIO_MINIMO":
      return { ...state, salarioMinimo: action.payload };
    case "RECALCULATE_FINALS": {
      if (state.crimes.length === 0 || !state.crimes.some((c) => c.crimeId)) {
        return { ...state, finalResults: {} };
      }

      let penaTotalBruta = 0;
      // ... (lógica do concurso de crimes sem alterações) ...
      switch (state.concurso) {
        case "formal":
          penaTotalBruta = calculateConcursoFormal(state.crimes);
          break;
        case "continuado":
          penaTotalBruta = calculateCrimeContinuado(state.crimes);
          break;
        case "material":
        default:
          penaTotalBruta = calculateConcursoMaterial(state.crimes);
          break;
      }

      const totalDetracaoDias = calculateDetracaoTotal(state.detracaoPeriodos);
      const totalRemicaoDias = calculateRemicaoTotal(
        state.remicao.diasTrabalhados,
        state.remicao.horasEstudo
      );
      const totalAbatimentoMeses = (totalDetracaoDias + totalRemicaoDias) / 30;

      const penaParaRegime = Math.max(0, penaTotalBruta - totalAbatimentoMeses);

      // ... (lógica de reincidência, violência, etc. sem alterações) ...
      const reincidente = state.crimes.some((c) =>
        c.agravantes.some((a) => a.id === "reincidencia")
      );

      const crimeComViolenciaOuGraveAmeaca = state.crimes.some((crimeState) => {
        const crimeData = (crimesDataRaw as Crime[]).find(
          (c) => c.id === crimeState.crimeId
        );
        return crimeData?.violento ?? false;
      });

      const crimeHediondoOuEquiparado = state.crimes.some((crimeState) => {
        const crimeData = (crimesDataRaw as Crime[]).find(
          (c) => c.id === crimeState.crimeId
        );
        const qualificadoraData = crimeData?.qualificadoras?.find(
          (q) => q.id === crimeState.selectedQualificadoraId
        );
        return (qualificadoraData?.hediondo || crimeData?.hediondo) ?? false;
      });

      const resultadoMorte = state.crimes.some((c) => c.resultadoMorte);
      const isFeminicidio = state.crimes.some(
        (c) => c.crimeId === "feminicidio"
      );

      const regimeInicial = calculateRegimeInicial(penaParaRegime, reincidente);
      const podeSubstituir = canSubstituirPena(
        penaTotalBruta,
        reincidente,
        crimeComViolenciaOuGraveAmeaca
      );
      const podeSursis = canSursis(penaTotalBruta, reincidente, podeSubstituir);

      // CORREÇÃO: Usa a nova data de início como base para o cálculo final
      const dataInicial = state.dataInicioCumprimento;
      const dataFinalPena = calculateFinalDate(dataInicial, penaParaRegime);

      // ... (lógica de multa e progressão sem alterações) ...
      const multaTotal = state.crimes.reduce((acc, crime) => {
        const crimeData = (crimesDataRaw as Crime[]).find(
          (c) => c.id === crime.crimeId
        );
        if (crimeData?.temMulta) {
          return (
            acc +
            calculateMulta(
              crime.penaMulta.diasMulta,
              crime.penaMulta.valorDiaMulta,
              state.salarioMinimo
            )
          );
        }
        return acc;
      }, 0);

      const progression = calculateProgression(
        penaTotalBruta,
        reincidente,
        crimeComViolenciaOuGraveAmeaca,
        crimeHediondoOuEquiparado,
        resultadoMorte,
        isFeminicidio
      );

      const progressionSteps = calculateAllProgressions(
        penaTotalBruta,
        progression.fracao,
        regimeInicial
      );

      const livramentoCondicional = calculateLivramentoCondicional(
        penaTotalBruta,
        reincidente,
        crimeHediondoOuEquiparado
      );

      return {
        ...state,
        finalResults: {
          penaTotal: penaTotalBruta,
          totalDetracaoDias,
          totalRemicaoDias,
          penaParaRegime,
          regimeInicial,
          podeSubstituir,
          podeSursis,
          dataFinalPena,
          multaTotal,
          progression,
          progressionSteps,
          livramentoCondicional,
        },
      };
    }
    default:
      return state;
  }
}

interface DosimetryContextType {
  state: DosimetryState;
  dispatch: React.Dispatch<Action>;
}

export const DosimetryContext = createContext<DosimetryContextType>({
  state: initialState,
  dispatch: () => null,
});

export function DosimetryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dosimetryReducer, initialState);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const savedState = localStorage.getItem("dosimetryState");
      if (savedState) {
        try {
          const parsedState: DosimetryState = JSON.parse(savedState);
          parsedState.crimes.forEach((crime) => {
            if (crime.dataCrime) {
              crime.dataCrime = new Date(crime.dataCrime);
            }
          });
          parsedState.detracaoPeriodos.forEach((periodo) => {
            if (periodo.inicio) periodo.inicio = new Date(periodo.inicio);
            if (periodo.fim) periodo.fim = new Date(periodo.fim);
          });
          if (parsedState.dataInicioCumprimento) {
            parsedState.dataInicioCumprimento = new Date(
              parsedState.dataInicioCumprimento
            );
          }
          dispatch({ type: "LOAD_STATE", payload: parsedState });
        } catch (error) {
          console.error("Failed to parse saved state:", error);
          localStorage.removeItem("dosimetryState");
        }
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem("dosimetryState", JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    dispatch({ type: "RECALCULATE_FINALS" });
  }, [
    state.crimes,
    state.detracaoPeriodos,
    state.remicao,
    state.concurso,
    state.salarioMinimo,
    state.dataInicioCumprimento,
  ]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DosimetryContext.Provider value={value}>
      {children}
    </DosimetryContext.Provider>
  );
}
