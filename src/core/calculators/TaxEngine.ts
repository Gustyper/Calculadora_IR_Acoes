import { Operacao, ResultadoMensal } from '../types';

export class TaxEngine {
  private estoque: Map<string, { quantidade: number; precoMedio: number }> = new Map();

  calcular(operacoes: Operacao[]): ResultadoMensal[] {
    // 1. Ordenar operações por data (essencial para Preço Médio)
    const opsOrdenadas = [...operacoes].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    const resultados: Record<string, { lucro: number; vendas: number }> = {};

    opsOrdenadas.forEach(op => {
      const mesChave = op.data.substring(0, 7); // YYYY-MM
      if (!resultados[mesChave]) resultados[mesChave] = { lucro: 0, vendas: 0 };

      const status = this.estoque.get(op.ticker) || { quantidade: 0, precoMedio: 0 };

      if (op.tipo === 'COMPRA') {
        const novaQtd = status.quantidade + op.quantidade;
        const novoCustoTotal = (status.quantidade * status.precoMedio) + (op.quantidade * op.precoUnitario + op.taxas);
        status.precoMedio = novoCustoTotal / novaQtd;
        status.quantidade = novaQtd;
      } else {
        // Venda
        const valorVendaLiquido = (op.quantidade * op.precoUnitario) - op.taxas;
        const custoAquisicao = op.quantidade * status.precoMedio;
        
        resultados[mesChave].lucro += (valorVendaLiquido - custoAquisicao);
        resultados[mesChave].vendas += (op.quantidade * op.precoUnitario);
        status.quantidade -= op.quantidade;
      }

      this.estoque.set(op.ticker, status);
    });

    return this.formatarResultados(resultados);
  }

  private formatarResultados(resultados: Record<string, { lucro: number; vendas: number }>): ResultadoMensal[] {
    return Object.entries(resultados).map(([mes, data]) => {
      const isento = data.vendas <= 20000;
      const imposto = (!isento && data.lucro > 0) ? data.lucro * 0.15 : 0;

      return {
        mes,
        lucroTotal: data.lucro,
        vendasTotais: data.vendas,
        impostoDevido: imposto,
        darfEmitir: imposto > 0
      };
    });
  }
}