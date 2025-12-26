import { useState, useMemo } from 'react';
import { type Operacao, type ResultadoMensal } from '../core/types';
import { TaxEngine } from '../core/calculators/TaxEngine';

export function useCalculadoraIR() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);

  const { resultados, custodia } = useMemo(() => {
    const engine = new TaxEngine();
    const res = engine.calcular(operacoes);
    const cust = Array.from(engine['estoque'].entries()); 
    return { resultados: res, custodia: cust };
  }, [operacoes]);

  const adicionarOperacao = (op: Operacao) => {
    setOperacoes((prev) => [...prev, op]);
  };

  return { operacoes, resultados, custodia, adicionarOperacao };
}