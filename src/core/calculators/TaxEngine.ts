import { type Operacao, type ResultadoMensal } from '../types';

export class TaxEngine {
  private estoque: Map<string, { quantidade: number; precoMedio: number }> = new Map();
  // Dois acumuladores de prejuízo separados (regra legal)
  private prejuizoGeral = 0; // Ações, BDRs e ETFs
  private prejuizoFii = 0;   // Apenas FIIs

  calcular(operacoes: Operacao[]): ResultadoMensal[] {
    const opsOrdenadas = [...operacoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    
    const resultadosPorMes: Record<string, { 
      lucroAcoes: number; 
      vendasAcoes: number;
      lucroBdrEtf: number;
      lucroFii: number;
    }> = {};

    this.estoque.clear();
    this.prejuizoGeral = 0;
    this.prejuizoFii = 0;

    opsOrdenadas.forEach(op => {
      const mesChave = op.data.substring(0, 7);
      if (!resultadosPorMes[mesChave]) {
        resultadosPorMes[mesChave] = { lucroAcoes: 0, vendasAcoes: 0, lucroBdrEtf: 0, lucroFii: 0 };
      }

      const status = this.estoque.get(op.ticker) || { quantidade: 0, precoMedio: 0 };

      if (op.tipo === 'COMPRA') {
        const novaQtd = status.quantidade + op.quantidade;
        const custoCompra = (op.quantidade * op.precoUnitario) + op.taxas;
        const custoTotalAntigo = status.quantidade * status.precoMedio;
        status.precoMedio = (custoTotalAntigo + custoCompra) / novaQtd;
        status.quantidade = novaQtd;
      } else {
        const valorVendaLiquido = (op.quantidade * op.precoUnitario) - op.taxas;
        const custoAquisicao = op.quantidade * status.precoMedio;
        const lucro = valorVendaLiquido - custoAquisicao;

        if (op.categoria === 'ACAO') {
          resultadosPorMes[mesChave].lucroAcoes += lucro;
          resultadosPorMes[mesChave].vendasAcoes += (op.quantidade * op.precoUnitario);
        } else if (op.categoria === 'FII') {
          resultadosPorMes[mesChave].lucroFii += lucro;
        } else {
          resultadosPorMes[mesChave].lucroBdrEtf += lucro;
        }
        status.quantidade -= op.quantidade;
      }
      this.estoque.set(op.ticker, { ...status });
    });

    return Object.entries(resultadosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, data]) => {
        // --- 1. CÁLCULO GERAL (15%) ---
        const lucroAcoesTributavel = data.vendasAcoes > 20000 ? data.lucroAcoes : 0;
        let baseCalculoGeral = lucroAcoesTributavel + data.lucroBdrEtf;
        
        // Se o resultado real de ações (mesmo isento) for prejuízo, ele compensa o BDR
        const lucroRealGeralMes = data.lucroAcoes + data.lucroBdrEtf;

        if (lucroRealGeralMes < 0) {
          this.prejuizoGeral += Math.abs(lucroRealGeralMes);
          baseCalculoGeral = 0;
        } else {
          const compensacao = Math.min(Math.max(0, baseCalculoGeral), this.prejuizoGeral);
          baseCalculoGeral -= compensacao;
          this.prejuizoGeral -= compensacao;
        }

        // --- 2. CÁLCULO FII (20%) ---
        let baseCalculoFii = data.lucroFii;
        if (baseCalculoFii < 0) {
          this.prejuizoFii += Math.abs(baseCalculoFii);
          baseCalculoFii = 0;
        } else {
          const compensacaoFii = Math.min(baseCalculoFii, this.prejuizoFii);
          baseCalculoFii -= compensacaoFii;
          this.prejuizoFii -= compensacaoFii;
        }

        const impostoGeral = Math.max(0, baseCalculoGeral) * 0.15;
        const impostoFii = Math.max(0, baseCalculoFii) * 0.20;
        const impostoTotal = impostoGeral + impostoFii;

        return {
          mes,
          lucroTotal: data.lucroAcoes + data.lucroBdrEtf + data.lucroFii,
          vendasTotais: data.vendasAcoes,
          impostoDevido: impostoTotal,
          darfEmitir: impostoTotal > 0
        };
      });
  }
}