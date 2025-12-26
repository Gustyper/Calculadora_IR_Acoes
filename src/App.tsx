import React, { useState } from 'react';
import { useCalculadoraIR } from './hooks/useCalculadoraIR';
import { type Operacao } from './core/types';
import { PlusCircle, Calculator } from 'lucide-react';

export default function App() {
  const { operacoes, resultados, adicionarOperacao } = useCalculadoraIR();
  
  // Estado local para o formulário
  const [formData, setFormData] = useState({
    data: '', 
    ticker: '', 
    tipo: 'COMPRA' as Operacao,
    categoria: 'ACAO' as CategoriaAtivo,
    quantidade: 0, 
    precoUnitario: 0, 
    taxas: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adicionarOperacao({ ...formData, id: crypto.randomUUID() });
    setFormData({ data: '', ticker: '', tipo: 'COMPRA', quantidade: 0, precoUnitario: 0, taxas: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="text-blue-600" /> Calculadora IR Simples
        </h1>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulário de Inserção */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Adicionar Operação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="date" required className="w-full p-2 border rounded" 
              onChange={e => setFormData({...formData, data: e.target.value})} value={formData.data} />
            
            <input type="text" placeholder="Ticker (ex: PETR4)" required className="w-full p-2 border rounded"
              onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} value={formData.ticker} />
            
            <select 
              className="w-full p-2 border rounded" 
              value={formData.categoria}
              onChange={e => setFormData({...formData, categoria: e.target.value as CategoriaAtivo})}
            >
              <option value="ACAO">Ação (Isenção 20k)</option>
              <option value="BDR_ETF">BDR / ETF (Sem Isenção)</option>
            </select>

            <select className="w-full p-2 border rounded" value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value as Operacao})}>
              <option value="COMPRA">Compra</option>
              <option value="VENDA">Venda</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Qtd" className="p-2 border rounded"
                onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})} value={formData.quantidade || ''} />
              <input type="number" step="0.01" placeholder="Preço Unit." className="p-2 border rounded"
                onChange={e => setFormData({...formData, precoUnitario: Number(e.target.value)})} value={formData.precoUnitario || ''} />
            </div>

            <input type="number" step="0.01" placeholder="Taxas Totais" className="w-full p-2 border rounded"
              onChange={e => setFormData({...formData, taxas: Number(e.target.value)})} value={formData.taxas || ''} />

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2">
              <PlusCircle size={20} /> Adicionar
            </button>
          </form>
        </section>

        {/* Lista de Operações Cadastradas */}
        <section className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-full">
          <h2 className="text-xl font-semibold mb-4">Histórico de Operações</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Data</th>
                  <th className="p-2">Ticker</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Qtd</th>
                  <th className="p-2">Preço Unit.</th>
                  <th className="p-2">Taxas</th>
                </tr>
              </thead>
              <tbody>
                {operacoes.map(op => (
                  <tr key={op.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{op.data}</td>
                    <td className="p-2 font-mono font-bold">{op.ticker}</td>
                    <td className="p-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${op.tipo === 'COMPRA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {op.tipo}
                      </span>
                    </td>
                    <td className="p-2">{op.quantidade}</td>
                    <td className="p-2">R$ {op.precoUnitario.toFixed(2)}</td>
                    <td className="p-2 text-gray-500">R$ {op.taxas.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resultados */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Resumo de Impostos</h2>
          {resultados.length === 0 && <p className="text-gray-500">Nenhuma operação registrada.</p>}
          {resultados.map(res => (
            <div key={res.mes} className={`p-4 rounded-xl border ${res.darfEmitir ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{res.mes}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${res.darfEmitir ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                  {res.darfEmitir ? 'DARF DEVIDO' : 'ISENTO / SEM IMPOSTO'}
                </span>
              </div>
              <p className="text-sm">Vendas: R$ {res.vendasTotais.toLocaleString('pt-BR')}</p>
              <p className="text-sm">Lucro: R$ {res.lucroTotal.toLocaleString('pt-BR')}</p>
              {res.darfEmitir && <p className="text-lg font-bold mt-2 text-red-700">Imposto: R$ {res.impostoDevido.toLocaleString('pt-BR')}</p>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}