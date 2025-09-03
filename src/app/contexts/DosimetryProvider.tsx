"use client";

import React, { createContext, useReducer, useMemo, ReactNode } from "react";
import causasDataRaw from "@/app/data/causas.json";
import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
  Causa,
  CausaAplicada,
  Circunstancia,
  calculateConcursoMaterial,
  calculateRegimeInicial,
} from "@/lib/calculations";

// --- TIPOS E INTERFACES ---

export interface CrimeState {
  id: string; // unique id for the crime instance
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
    regimeInicial?: string;
    podeSubstituir?: boolean;
    podeSursis?: boolean;
    dataFinalPena?: Date;
    totalMulta?: number;
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
  | { type: "CALCULATE_ALL" }
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
  penaPrimeiraFase: undefined,
  penaProvisoria: undefined,
  penaDefinitiva: undefined,
};

const initialState: DosimetryState = {
  crimes: [], // Começa com a lista de crimes vazia
  detracao: { anos: 0, meses: 0, dias: 0 },
  concurso: "material",
  finalResults: {},
};

function calculateCrimePens(crime: CrimeState): CrimeState {
  const penaPrimeiraFase = calculatePhaseOne(
    crime.penaBase,
    crime.circunstanciasJudiciais
  );
  const penaProvisoria = calculatePhaseTwo(
    penaPrimeiraFase,
    crime.agravantes,
    crime.atenuantes
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
      return {
        ...initialState,
        crimes: [],
      };
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
        crime.id === action.payload.id
          ? calculateCrimePens({ ...crime, ...action.payload })
          : crime
      );
      return {
        ...state,
        crimes: updatedCrimes,
      };
    }
    case "UPDATE_CONCURSO":
      return { ...state, concurso: action.payload };
    case "UPDATE_DETRACAO":
      return { ...state, detracao: action.payload };
    case "CALCULATE_ALL": {
      const calculatedCrimes = state.crimes.map(calculateCrimePens);

      const penaTotal = calculateConcursoMaterial(calculatedCrimes);
      const reincidente = calculatedCrimes.some((c) =>
        c.agravantes.some((a) => a.id === "reincidencia")
      );
      const regimeInicial = calculateRegimeInicial(penaTotal, reincidente);

      return {
        ...state,
        crimes: calculatedCrimes,
        finalResults: {
          penaTotal,
          regimeInicial,
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
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DosimetryContext.Provider value={value}>
      {children}
    </DosimetryContext.Provider>
  );
}
