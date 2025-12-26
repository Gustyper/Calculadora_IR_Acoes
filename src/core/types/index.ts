export type TipoOperacao = 'COMPRA' | 'VENDA';

export interface Operacao {
  id: string;            // UUID ou Timestamp para identificar a linha
  data: string;          // Formato YYYY-MM-DD
  ticker: string;        // Ex: PETR4, VALE3
  tipo: TipoOperacao;
  quantidade: number;
  precoUnitario: number;
  taxas: number;         // Corretagem e Emolumentos
}

export interface ResultadoMensal {
  mes: string;           // YYYY-MM
  lucroTotal: number;
  impostoDevido: number;
  vendasTotais: number;
  darfEmitir: boolean;
}