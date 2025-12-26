import React, { useState } from 'react';
import { useCalculadoraIR } from './hooks/useCalculadoraIR';
import { type TipoOperacao, type CategoriaAtivo } from './core/types';
import { PlusCircle, Calculator, History, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  const { operacoes, resultados, custodia, adicionarOperacao } = useCalculadoraIR();
  
  const [formData, setFormData] = useState({
    data: '', ticker: '', tipo: 'COMPRA' as TipoOperacao,
    categoria: 'ACAO' as CategoriaAtivo, quantidade: 0, precoUnitario: 0, taxas: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.tipo === 'VENDA') {
      // Busca o ativo na custódia calculada
      const ativo = custodia.find(([t]) => t === formData.ticker);
      const qtdDisponivel = ativo ? ativo[1].quantidade : 0;

      if (formData.quantidade > qtdDisponivel) {
        alert(`Erro: Você possui apenas ${qtdDisponivel} de ${formData.ticker} em estoque.`);
        return;
      }
    }

    adicionarOperacao({ ...formData, id: Math.random().toString(36).substring(2, 9) });
    setFormData({ ...formData, ticker: '', quantidade: 0, precoUnitario: 0, taxas: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Calculator size={28} />
            <span>TaxCalc <span className="text-slate-400 font-light">Brasil</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* Coluna 1: Input */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PlusCircle size={20} className="text-blue-500" /> Nova Operação
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Data da Operação</label>
                <input type="date" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  onChange={e => setFormData({...formData, data: e.target.value})} value={formData.data} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Ticker</label>
                  <input type="text" placeholder="PETR4" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} value={formData.ticker} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Categoria</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value as CategoriaAtivo})}>
                    <option value="ACAO">Ação</option>
                    <option value="BDR_ETF">BDR / ETF</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label>
                <div className="flex p-1 bg-slate-100 rounded-lg">
                  <button type="button" onClick={() => setFormData({...formData, tipo: 'COMPRA'})}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${formData.tipo === 'COMPRA' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Compra</button>
                  <button type="button" onClick={() => setFormData({...formData, tipo: 'VENDA'})}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${formData.tipo === 'VENDA' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}>Venda</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Qtd</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                    onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})} value={formData.quantidade || ''} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Preço (R$)</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                    onChange={e => setFormData({...formData, precoUnitario: Number(e.target.value)})} value={formData.precoUnitario || ''} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Taxas Totais (R$)</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  onChange={e => setFormData({...formData, taxas: Number(e.target.value)})} value={formData.taxas || ''} />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                Adicionar Operação
              </button>
            </form>
          </section>
        </div>

        {/* Coluna 2: Resultados e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard de Impostos */}
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" /> Resumo de Tributação
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resultados.map(res => (
                <div key={res.mes} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-2 h-full ${res.darfEmitir ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{res.mes}</p>
                      <h3 className="text-2xl font-black text-slate-800">R$ {res.impostoDevido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                    </div>
                    {res.darfEmitir ? <AlertCircle className="text-red-500" /> : <TrendingUp className="text-green-500" />}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Vendas (Ações):</span> <b>R$ {res.vendasTotais.toLocaleString('pt-BR')}</b></div>
                    <div className="flex justify-between text-slate-600"><span>Lucro Líquido:</span> <b className={res.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}>R$ {res.lucroTotal.toLocaleString('pt-BR')}</b></div>
                  </div>
                </div>
              ))}
              {resultados.length === 0 && <div className="col-span-full p-8 text-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500">Aguardando operações para calcular...</div>}
            </div>
          </section>

          {/* Dashboard de Custódia Atual */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-blue-50/50">
              <h2 className="font-bold flex items-center gap-2 text-blue-700">
                <TrendingUp size={18} /> Sua Custódia Atual
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {custodia.map(([ticker, info]) => (
                info.quantidade > 0 && (
                  <div key={ticker} className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-400">{ticker}</p>
                    <p className="text-lg font-black text-slate-800">{info.quantidade} un.</p>
                    <p className="text-xs text-slate-500">PM: R$ {info.precoMedio.toFixed(2)}</p>
                  </div>
                )
              ))}
              {custodia.filter(c => c[1].quantidade > 0).length === 0 && (
                <p className="text-sm text-slate-400 col-span-full italic">Nenhum ativo em carteira no momento.</p>
              )}
            </div>
          </section>

          {/* Tabela de Histórico */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold flex items-center gap-2"><History size={18} /> Histórico</h2>
              <span className="text-xs font-medium px-2 py-1 bg-slate-200 rounded-full">{operacoes.length} itens</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold">Ativo</th>
                    <th className="p-4 font-semibold">Tipo</th>
                    <th className="p-4 font-semibold">Qtd</th>
                    <th className="p-4 font-semibold text-right">Unitário</th>
                    <th className="p-4 font-semibold text-right">Taxas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {operacoes.map(op => (
                    <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-600">{new Date(op.data).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 font-bold">{op.ticker} <span className="text-[10px] font-normal text-slate-400 ml-1">{op.categoria}</span></td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${op.tipo === 'COMPRA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {op.tipo}
                        </span>
                      </td>
                      <td className="p-4">{op.quantidade}</td>
                      <td className="p-4 text-right font-medium text-slate-700">R$ {op.precoUnitario.toFixed(2)}</td>
                      <td className="p-4 text-right text-slate-400">R$ {op.taxas.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}