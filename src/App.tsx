import React, { useState } from 'react';
import { useCalculadoraIR } from './hooks/useCalculadoraIR';
import { type TipoOperacao, type CategoriaAtivo } from './core/types';
import { PlusCircle, Calculator, History, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { TICKERS_DATA } from './utils/tickers';
import { calcularVencimentoDARF } from './utils/dateUtils';
import { Github, ExternalLink } from 'lucide-react'; // Certifique-se de importar Github
  
export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'regras' | 'sobre'>('calc');

  const { operacoes, resultados, custodia, prejuizos, adicionarOperacao, limparDados } = useCalculadoraIR();
  
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

  const handleTickerChange = (value: string) => {
    const tickerUpper = value.toUpperCase();
    const categoriaAuto = TICKERS_DATA[tickerUpper];

    setFormData(prev => ({
      ...prev,
      ticker: tickerUpper,
      // Atualiza automaticamente para ACAO, BDR_ETF ou FII se existir no banco
      categoria: categoriaAuto ? categoriaAuto : prev.categoria
    }));
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
          
          <a 
            href="https://github.com/Gustyper/Calculadora_IR_Acoes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
          >
            <Github size={20} />
            <span className="hidden sm:inline">Ver Código Fonte</span>
          </a>
        </div>
      </nav>

      {/* Menu de Abas */}
      <div className="max-w-6xl mx-auto px-4 mb-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'calc', label: 'Calculadora' },
          { id: 'regras', label: 'Regras de IR' },
          { id: 'sobre', label: 'Sobre a Calculadora' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: REGRAS */}
      {activeTab === 'regras' && (
        <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
            <h2 className="text-2xl font-black text-slate-800">Guia Rápido de Tributação (B3)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                <h3 className="font-bold text-blue-700 uppercase text-xs tracking-widest">Ações (Swing)</h3>
                <p className="text-sm text-slate-600"><b>15%</b> sobre lucro. Isenção se vendas totais no mês forem abaixo de <b>R$ 20.000</b>.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl space-y-2">
                <h3 className="font-bold text-orange-700 uppercase text-xs tracking-widest">BDRs & ETFs</h3>
                <p className="text-sm text-slate-600"><b>15%</b> sobre lucro. <b>Não há isenção</b>, independente do valor vendido.</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl space-y-2">
                <h3 className="font-bold text-emerald-700 uppercase text-xs tracking-widest">FIIs & FIAGROs</h3>
                <p className="text-sm text-slate-600"><b>20%</b> sobre lucro. <b>Não há isenção</b>. Rendimentos mensais são isentos para PF.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" /> Atraso no Pagamento
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                O não pagamento do DARF até o vencimento gera <b>multa e juros</b>:
              </p>
              <ul className="text-sm text-slate-600 space-y-2 list-disc ml-5">
                <li><b>Multa:</b> 0,33% por dia de atraso (limitado a 20%).</li>
                <li><b>Juros:</b> Taxa SELIC acumulada do mês seguinte ao vencimento até o mês anterior ao pagamento, mais 1% no mês do pagamento.</li>
                <li><b>Como regularizar:</b> Acesse o Sicalc Web. O sistema calcula os encargos automaticamente ao informar o período de apuração.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ABA: SOBRE (Simplificado/Venda Descoberta) */}
      {activeTab === 'sobre' && (
        <div className="max-w-4xl mx-auto px-4 pb-12 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Sobre a Calculadora</h2>
            <p className="text-slate-600 leading-relaxed">
              Esta ferramenta foi desenvolvida para facilitar o cálculo de Preço Médio e Imposto de Renda para <b>investidores pessoa física</b> que realizam operações comuns (comprar primeiro, vender depois).
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <h4 className="font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle size={18} /> Limitações Atuais
              </h4>
              <ul className="text-sm text-amber-800 mt-2 space-y-2 list-disc ml-5">
                <li><b>Venda a Descoberto (Short):</b> Não há suporte para cálculos de operações onde o investidor vende um ativo sem possuí-lo (aluguel de ações).</li>
                <li><b>Day Trade:</b> A calculadora foca em Swing Trade (operações de mais de um dia).</li>
                <li><b>Exercício de Opções:</b> Não processa automaticamente cálculos derivados de exercício de opções ou subscrições complexas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ABA: CALCULADORA (Aba Principal) */}
      {activeTab === 'calc' && (
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
                    <input 
                      type="text" 
                      list="tickers-list"
                      placeholder="PETR4" 
                      required 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      // Mudança aqui: chama handleTickerChange para processar a categoria
                      onChange={e => handleTickerChange(e.target.value)} 
                      value={formData.ticker} 
                    />
                    <datalist id="tickers-list">
                      {/* Mudança aqui: extrai as chaves do objeto gerado pelo Python */}
                      {Object.keys(TICKERS_DATA).map(ticker => (
                        <option key={ticker} value={ticker} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Categoria</label>
                  <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" 
                      value={formData.categoria}
                      onChange={e => setFormData({...formData, categoria: e.target.value as CategoriaAtivo})}
                    >
                      <option value="ACAO">Ação</option>
                      <option value="BDR_ETF">BDR / ETF</option>
                      <option value="FII">FII / FIAGRO</option>
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
                  <div key={res.mes} className={`p-5 rounded-2xl border ${res.darfEmitir ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg text-slate-700">{res.mes}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.darfEmitir ? 'bg-amber-200 text-amber-900' : 'bg-green-200 text-green-900'}`}>
                      {res.darfEmitir ? 'AÇÃO NECESSÁRIA' : 'SEM PENDÊNCIAS'}
                    </span>
                  </div>

                  {res.darfEmitir ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Você deve emitir um <b>DARF</b> no valor de <b>R$ {res.impostoDevido.toFixed(2)}</b>.</p>
                      </div>
                      <ul className="text-xs text-amber-700 space-y-1 ml-6 list-disc">
                        <li>Código da Receita: <b>6015</b></li>
                        <li>
                          Vencimento: <b>{calcularVencimentoDARF(res.mes)}</b> 
                          <span className="text-[10px] ml-1 opacity-70">(Último dia útil do mês seguinte)</span>
                        </li>
                        <li>Emitir via: <b>Sicalc Web (Portal e-CAC)</b></li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700 font-medium italic">Parabéns! Não há imposto devido para este período (isenção ou falta de lucro).</p>
                  )}
                </div>
                ))}
                {resultados.length === 0 && <div className="col-span-full p-8 text-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500">Aguardando operações para calcular...</div>}
              </div>
            </section>

            {/* Seção de Prejuízos Acumulados */}
            <section className="bg-slate-800 text-white p-5 rounded-2xl shadow-lg border border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Prejuízos para Abater (Próximos Meses)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Ações/BDR/ETF</p>
                  <p className="text-lg font-bold text-red-400">R$ {prejuizos.geral.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">FIIs</p>
                  <p className="text-lg font-bold text-red-400">R$ {prejuizos.fii.toLocaleString('pt-BR')}</p>
                </div>
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
                <button 
                  onClick={limparDados}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} /> Limpar Tudo
                </button>
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
        )}

        <footer className="bg-white border-t border-slate-200 mt-auto py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400 font-bold">
                  <Calculator size={20} />
                  <span>TaxCalc Brasil</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                  Ferramenta Open Source para auxílio no cálculo de preço médio e estimativa de imposto de renda sobre ativos de renda variável.
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={14} /> Aviso de Isenção de Responsabilidade
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed italic">
                  Este é um <b>projeto estritamente educacional e de aprendizagem</b>. Os cálculos apresentados são simplificados e não substituem a consultoria de um contador profissional ou o uso de sistemas oficiais da Receita Federal. O desenvolvedor não se responsabiliza por erros de cálculo, emissões incorretas de DARF ou quaisquer prejuízos financeiros e fiscais decorrentes do uso desta ferramenta. <b>Confira sempre os dados antes de realizar qualquer pagamento.</b>
                </p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
              <p>© 2025 TaxCalc Brasil - Desenvolvido para fins de estudo.</p>
            </div>
          </div>
        </footer>
    </div>
  );
}