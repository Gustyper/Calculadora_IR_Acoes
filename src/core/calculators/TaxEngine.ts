import { type Operacao, type ResultadoMensal } from '../types';

export class TaxEngine {
  private estoque: Map<string, { quantidade: number; precoMedio: number }> = new Map();
  private prejuizoAcumulado = 0;

  calcular(operacoes: Operacao[]): ResultadoMensal[] {
    const opsOrdenadas = [...operacoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    
    // Agora o mapa de resultados separa por categoria
    const resultadosPorMes: Record<string, { 
      lucroAcoes: number; 
      vendasAcoes: number;
      lucroBdrEtf: number;
    }> = {};

    this.estoque.clear();
    this.prejuizoAcumulado = 0;

    opsOrdenadas.forEach(op => {
      const mesChave = op.data.substring(0, 7);
      if (!resultadosPorMes[mesChave]) {
        resultadosPorMes[mesChave] = { lucroAcoes: 0, vendasAcoes: 0, lucroBdrEtf: 0 };
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
        // Regra Ações: Isenção se vendas <= 20k
        const lucroAcoesTributavel = data.vendasAcoes > 20000 ? Math.max(0, data.lucroAcoes) : 0;
        
        // Regra BDR/ETF: Sempre tributável se houver lucro
        const lucroBdrTributavel = Math.max(0, data.lucroBdrEtf);

        const lucroTotalMes = data.lucroAcoes + data.lucroBdrEtf;
        
        // Compensação de prejuízo (simplificada: consolidando as categorias)
        let baseCalculo = lucroAcoesTributavel + lucroBdrTributavel;
        
        // Se o resultado total do mês (incluindo prejuízos de ações isentas) for negativo, acumula
        if (lucroTotalMes < 0) {
            this.prejuizoAcumulado += Math.abs(lucroTotalMes);
            baseCalculo = 0;
        } else {
            const compensacao = Math.min(baseCalculo, this.prejuizoAcumulado);
            baseCalculo -= compensacao;
            this.prejuizoAcumulado -= compensacao;
        }

        const imposto = baseCalculo * 0.15;

        return {
          mes,
          lucroTotal: lucroTotalMes,
          vendasTotais: data.vendasAcoes, // Vendas para fins de controle de isenção
          impostoDevido: imposto,
          darfEmitir: imposto > 0
        };
      });
  }
}