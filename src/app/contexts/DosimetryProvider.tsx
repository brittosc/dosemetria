// src/app/contexts/DosimetryProvider.tsx

"use client";

import React, {
  createContext,
  useReducer,
  useMemo,
  ReactNode,
  useEffect,
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
} from "@/lib/calculations";
import { Crime } from "@/types/crime";

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
  detracao: {
    anos: number;
    meses: number;
    dias: number;
  };
  concurso: "material" | "formal" | "continuado";
  salarioMinimo: number;
  finalResults: {
    penaTotal?: number;
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
  };
}

type Action =
  | { type: "ADD_CRIME" }
  | { type: "REMOVE_CRIME"; payload: string }
  | { type: "UPDATE_CRIME"; payload: Partial<CrimeState> & { id: string } }
  | { type: "UPDATE_CONCURSO"; payload: "material" | "formal" | "continuado" }
  | {
      type: "UPDATE_DETRACAO";
      payload: { anos: number; meses: number; dias: number };
    }
  | { type: "UPDATE_SALARIO_MINIMO"; payload: number }
  | { type: "RECALCULATE_FINALS" }
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
  detracao: { anos: 0, meses: 0, dias: 0 },
  concurso: "material",
  salarioMinimo: 1518,
  finalResults: {},
};

function calculateCrimePens(crime: CrimeState): CrimeState {
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
    case "UPDATE_DETRACAO":
      return { ...state, detracao: action.payload };
    case "UPDATE_SALARIO_MINIMO":
      return { ...state, salarioMinimo: action.payload };
    case "RECALCULATE_FINALS": {
      if (state.crimes.length === 0 || !state.crimes.some((c) => c.crimeId)) {
        return { ...state, finalResults: {} };
      }

      let penaTotalBruta = 0;
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

      const detracaoEmMeses =
        state.detracao.anos * 12 +
        state.detracao.meses +
        state.detracao.dias / 30;

      const penaParaRegime = Math.max(0, penaTotalBruta - detracaoEmMeses);

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

      // Verificação específica para feminicídio, agora corrigida
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

      const dataInicial =
        state.crimes.length > 0 && state.crimes[0].dataCrime
          ? new Date(state.crimes[0].dataCrime)
          : new Date();
      const dataFinalPena = calculateFinalDate(dataInicial, penaParaRegime);

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
        isFeminicidio // Passando o parâmetro
      );

      const progressionSteps = calculateAllProgressions(
        penaTotalBruta,
        progression.fracao,
        regimeInicial
      );

      return {
        ...state,
        finalResults: {
          penaTotal: penaTotalBruta,
          penaParaRegime,
          regimeInicial,
          podeSubstituir,
          podeSursis,
          dataFinalPena,
          multaTotal,
          progression,
          progressionSteps,
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

  useEffect(() => {
    dispatch({ type: "RECALCULATE_FINALS" });
  }, [state.crimes, state.detracao, state.concurso, state.salarioMinimo]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DosimetryContext.Provider value={value}>
      {children}
    </DosimetryContext.Provider>
  );
}
