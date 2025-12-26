import { useState, useMemo } from 'react';
import { type Operacao, type ResultadoMensal } from '../core/types';
import { TaxEngine } from '../core/calculators/TaxEngine';

export function useCalculadoraIR() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);

  const resultados = useMemo(() => {
    const engine = new TaxEngine();
    return engine.calcular(operacoes);
  }, [operacoes]);

  const adicionarOperacao = (op: Operacao) => {
    setOperacoes((prev) => [...prev, op]);
  };

  return { operacoes, resultados, adicionarOperacao };
}