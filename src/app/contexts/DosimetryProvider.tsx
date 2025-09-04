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
} from "@/lib/calculations";
import { Crime } from "@/types/crime";

// --- TIPOS E INTERFACES ---

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
}

export interface DosimetryState {
  crimes: CrimeState[];
  detracao: {
    anos: number;
    meses: number;
    dias: number;
  };
  concurso: "material" | "formal" | "continuado";
  finalResults: {
    penaTotal?: number;
    penaParaRegime?: number;
    regimeInicial?: string;
    podeSubstituir?: boolean;
    podeSursis?: boolean;
    dataFinalPena?: Date;
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
};

const initialState: DosimetryState = {
  crimes: [],
  detracao: { anos: 0, meses: 0, dias: 0 },
  concurso: "material",
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

const crimesViolentosIds = [
  "homicidio_simples",
  "feminicidio",
  "lesao_corporal_simples",
  "lesao_corporal_grave",
  "lesao_corporal_gravissima",
  "lesao_corporal_seguida_de_morte",
  "lesao_corporal_violencia_domestica",
  "roubo_simples",
  "extorsao_simples",
  "extorsao_mediante_sequestro",
  "estupro",
  "estupro_de_vulneravel",
];

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
    case "RECALCULATE_FINALS": {
      if (state.crimes.length === 0) {
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
      const crimeComViolenciaOuGraveAmeaca = state.crimes.some((c) =>
        crimesViolentosIds.includes(c.crimeId ?? "")
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
      const dataFinalPena = calculateFinalDate(
        dataInicial,
        penaTotalBruta - detracaoEmMeses
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
  }, [state.crimes, state.detracao, state.concurso]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DosimetryContext.Provider value={value}>
      {children}
    </DosimetryContext.Provider>
  );
}
