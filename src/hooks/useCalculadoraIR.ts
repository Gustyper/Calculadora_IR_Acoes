import { useState, useEffect, useMemo } from 'react';
import { type Operacao } from '../core/types';
import { TaxEngine } from '../core/calculators/TaxEngine';

const STORAGE_KEY = 'taxcalc_operacoes';

export function useCalculadoraIR() {
  // Inicializa o estado buscando do Local Storage ou com array vazio
  const [operacoes, setOperacoes] = useState<Operacao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Persiste no Local Storage sempre que a lista de operações mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operacoes));
  }, [operacoes]);

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

  // Função útil para o usuário resetar os dados
  const limparDados = () => {
    if (confirm("Deseja apagar todo o histórico de operações?")) {
      setOperacoes([]);
    }
  };

  const removerUltimaOperacao = () => {
    setOperacoes((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  };

  return { operacoes, resultados, custodia, prejuizos, adicionarOperacao, limparDados, removerUltimaOperacao };
}