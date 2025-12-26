import { useState, useMemo } from 'react';
import { type Operacao} from '../core/types';
import { TaxEngine } from '../core/calculators/TaxEngine';

export function useCalculadoraIR() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);

  const { resultados, custodia, prejuizos } = useMemo(() => {
    const engine = new TaxEngine();
    const res = engine.calcular(operacoes);
    return { 
      resultados: res, 
      custodia: Array.from(engine['estoque'].entries()),
      prejuizos: { 
        geral: engine['prejuizoGeral'], 
        fii: engine['prejuizoFii'] 
      }
    };
  }, [operacoes]);

  const adicionarOperacao = (op: Operacao) => {
    setOperacoes((prev) => [...prev, op]);
  };

  return { operacoes, resultados, custodia, prejuizos, adicionarOperacao };
}