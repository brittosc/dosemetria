export interface Qualificadora {
  id: string;
  nome: string;
  descricao?: string;
  penaMinimaMeses: number;
  penaMaximaMeses: number;
  violento: boolean;
  hediondo: boolean;
}

export interface Crime {
  id: string;
  artigo: string;
  nome: string;
  penaMinimaMeses: number | null;
  penaMaximaMeses: number | null;
  qualificadoras?: Qualificadora[];
  temMulta?: boolean;
  descricao?: string;
  paragrafo?: string;
  violento: boolean;
  hediondo: boolean;
  outrasPenas?: string[];
  lei?: string;
}
