export type TipoOperacao = 'COMPRA' | 'VENDA';
export type CategoriaAtivo = 'ACAO' | 'BDR_ETF';

export interface Operacao {
  id: string;
  data: string;
  ticker: string;
  tipo: TipoOperacao;
  categoria: CategoriaAtivo;
  quantidade: number;
  precoUnitario: number;
  taxas: number;
}

export interface ResultadoMensal {
  mes: string;
  lucroTotal: number;
  impostoDevido: number;
  vendasTotais: number;
  darfEmitir: boolean;
}