"use client";

import React, { createContext, useReducer, useMemo, ReactNode } from "react";
import crimesData from "@/app/data/crimes.json";
import causasDataRaw from "@/app/data/causas.json";
import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
  Causa,
  CausaAplicada,
  calculateFinalDate,
} from "@/lib/calculations";

// --- TIPOS E INTERFACES ---

export interface DosimetryState {
  currentPhase: number;
  selectedCrimeId?: string;
  phaseOneData: {
    penaBase: number;
    circunstanciasJudiciais: string[];
    dataCrime?: Date;
    selectedQualificadoraId?: string;
  };
  phaseTwoData: {
    agravantes: string[];
    atenuantes: string[];
  };
  phaseThreeData: {
    causasAumento: CausaAplicada[];
    causasDiminuicao: CausaAplicada[];
    diasMulta: number;
  };
  results: {
    penaPrimeiraFase?: number;
    penaProvisoria?: number;
    penaDefinitiva?: number;
    dataFinalPena?: Date;
  };
}

type Action =
  | { type: "SET_CRIME"; payload: string }
  | { type: "SET_QUALIFICADORA"; payload: string | undefined }
  | {
      type: "UPDATE_PHASE_ONE";
      payload: Partial<DosimetryState["phaseOneData"]>;
    }
  | {
      type: "UPDATE_PHASE_TWO";
      payload: Partial<DosimetryState["phaseTwoData"]>;
    }
  | {
      type: "UPDATE_PHASE_THREE";
      payload: Partial<DosimetryState["phaseThreeData"]>;
    }
  | { type: "CALCULATE_AND_PROCEED" }
  | { type: "GO_TO_PHASE"; payload: number }
  | { type: "RESET" };

const initialState: DosimetryState = {
  currentPhase: 1,
  selectedCrimeId: undefined,
  phaseOneData: {
    penaBase: 0,
    circunstanciasJudiciais: [],
    dataCrime: new Date(),
    selectedQualificadoraId: undefined,
  },
  phaseTwoData: { agravantes: [], atenuantes: [] },
  phaseThreeData: { causasAumento: [], causasDiminuicao: [], diasMulta: 0 },
  results: {},
};

function dosimetryReducer(
  state: DosimetryState,
  action: Action
): DosimetryState {
  switch (action.type) {
    case "RESET":
      return initialState;

    case "SET_CRIME": {
      const crime = crimesData.find((c) => c.id === action.payload);
      return {
        ...initialState,
        selectedCrimeId: action.payload,
        phaseOneData: {
          ...initialState.phaseOneData,
          penaBase: crime?.penaMinimaMeses ?? 0,
        },
      };
    }

    case "SET_QUALIFICADORA": {
      const crime = crimesData.find((c) => c.id === state.selectedCrimeId);
      const qualificadora = crime?.qualificadoras?.find(
        (q) => q.id === action.payload
      );
      return {
        ...state,
        phaseOneData: {
          ...state.phaseOneData,
          selectedQualificadoraId: action.payload,
          penaBase:
            qualificadora?.penaMinimaMeses ?? crime?.penaMinimaMeses ?? 0,
        },
      };
    }

    case "UPDATE_PHASE_ONE":
      return {
        ...state,
        phaseOneData: { ...state.phaseOneData, ...action.payload },
      };

    case "UPDATE_PHASE_TWO":
      return {
        ...state,
        phaseTwoData: { ...state.phaseTwoData, ...action.payload },
      };

    case "UPDATE_PHASE_THREE":
      return {
        ...state,
        phaseThreeData: { ...state.phaseThreeData, ...action.payload },
      };

    case "GO_TO_PHASE":
      return { ...state, currentPhase: action.payload };

    case "CALCULATE_AND_PROCEED": {
      if (state.currentPhase === 1) {
        const crime = crimesData.find((c) => c.id === state.selectedCrimeId);
        if (!crime) return state;

        const penaPrimeiraFase = calculatePhaseOne(
          state.phaseOneData.penaBase,
          state.phaseOneData.circunstanciasJudiciais
        );
        return {
          ...state,
          currentPhase: 2,
          results: { ...state.results, penaPrimeiraFase },
        };
      }

      if (state.currentPhase === 2 && state.results.penaPrimeiraFase) {
        const penaProvisoria = calculatePhaseTwo(
          state.results.penaPrimeiraFase,
          state.phaseTwoData.agravantes,
          state.phaseTwoData.atenuantes
        );
        return {
          ...state,
          currentPhase: 3,
          results: { ...state.results, penaProvisoria },
        };
      }
      if (
        state.currentPhase === 3 &&
        state.results.penaProvisoria !== undefined
      ) {
        const penaDefinitiva = calculatePhaseThree(
          state.results.penaProvisoria,
          state.phaseThreeData.causasAumento,
          state.phaseThreeData.causasDiminuicao,
          causasDataRaw as Causa[]
        );
        const dataFinalPena = calculateFinalDate(
          state.phaseOneData.dataCrime || new Date(),
          penaDefinitiva
        );
        return {
          ...state,
          results: { ...state.results, penaDefinitiva, dataFinalPena },
        };
      }
      return state;
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
