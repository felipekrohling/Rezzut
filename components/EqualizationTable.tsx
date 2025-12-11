import React from 'react';
import { Proposal, PurchaseRequest, RequestStatus } from '../types';
import { CheckBadgeIcon, PencilSquareIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface EqualizationTableProps {
  request: PurchaseRequest;
  onSelectProposal?: (proposalId: string) => void;
  onEditProposal?: (proposal: Proposal) => void;
  readOnly?: boolean;
}

const EqualizationTable: React.FC<EqualizationTableProps> = ({ request, onSelectProposal, onEditProposal, readOnly = false }) => {
  if (request.proposals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-gray-500">Nenhuma proposta registrada ainda.</p>
      </div>
    );
  }

  const aiRecommendedId = request.aiAnalysis?.recommendedSupplierId;
  const userSelectedId = request.selectedProposalId;

  // Prepare data for chart
  const chartData = request.proposals.map(p => ({
    name: p.supplierName,
    price: p.price,
    days: p.deliveryDays,
    id: p.id
  }));

  // Find min/max for highlighting
  const minPrice = Math.min(...request.proposals.map(p => p.price));
  const minDays = Math.min(...request.proposals.map(p => p.deliveryDays));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparativo de Preço</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="price" radius={[4, 4, 0, 0]} name="Preço Total">
                {chartData.map((entry, index) => {
                   // Green if it's the user choice, otherwise Blue (or Green if AI recommended and no user choice yet)
                   let color = '#3b82f6';
                   if (userSelectedId) {
                     color = entry.id === userSelectedId ? '#16a34a' : '#cbd5e1';
                   } else if (entry.id === aiRecommendedId) {
                     color = '#22c55e';
                   }
                   return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold min-w-[150px]">Critério</th>
              {request.proposals.map(p => {
                const isSelected = p.id === userSelectedId;
                const isAiRecommended = p.id === aiRecommendedId;
                return (
                  <th key={p.id} className={`px-6 py-4 min-w-[200px] transition-colors ${isSelected ? 'bg-green-50 border-t-4 border-t-green-600' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-base ${isSelected ? 'text-green-800 font-bold' : ''}`}>{p.supplierName}</span>
                            {isSelected && <CheckBadgeIcon className="w-5 h-5 text-green-600" />}
                        </div>
                        {!readOnly && onEditProposal && (
                            <button 
                                onClick={() => onEditProposal(p)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                title="Editar Proposta"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                      {isAiRecommended && !isSelected && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full w-fit">Recomendação IA</span>
                      )}
                      {isSelected && (
                          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full w-fit">Vencedor Selecionado</span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {/* Price Row */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50/50">Preço Total</td>
              {request.proposals.map(p => (
                <td key={p.id} className={`px-6 py-4 ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                  <span className={`font-semibold text-lg ${p.price === minPrice ? 'text-green-600' : 'text-gray-900'}`}>
                    {p.currency} {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {p.price === minPrice && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Melhor Preço</span>}
                </td>
              ))}
            </tr>

            {/* Delivery Row */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50/50">Prazo de Entrega</td>
              {request.proposals.map(p => (
                <td key={p.id} className={`px-6 py-4 ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                  <div className="flex flex-col">
                      <span className={`${p.deliveryDays === minDays ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                        {p.deliveryDays} dias
                      </span>
                      {p.deliveryDate && (
                          <span className="text-xs text-gray-500">
                              até {new Date(p.deliveryDate).toLocaleDateString('pt-BR')}
                          </span>
                      )}
                  </div>
                </td>
              ))}
            </tr>

             {/* Payment Terms Row */}
             <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50/50">Condição Pagto.</td>
              {request.proposals.map(p => (
                <td key={p.id} className={`px-6 py-4 text-gray-600 ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                  {p.paymentTerms}
                </td>
              ))}
            </tr>

            {/* Technical Specs Row */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50/50 align-top">Especificação</td>
              {request.proposals.map(p => (
                <td key={p.id} className={`px-6 py-4 text-gray-600 align-top ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                  <p className="line-clamp-4 hover:line-clamp-none transition-all duration-200">
                    {p.technicalSpecs}
                  </p>
                </td>
              ))}
            </tr>

            {/* Validity Row */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50/50">Validade</td>
              {request.proposals.map(p => (
                <td key={p.id} className={`px-6 py-4 text-gray-500 text-xs ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                   {new Date(p.validityDate).toLocaleDateString('pt-BR')}
                </td>
              ))}
            </tr>

            {/* AI Score Row */}
             {request.aiAnalysis && (
              <tr className="bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-blue-900 bg-blue-50">Nota IA (0-10)</td>
                {request.proposals.map(p => {
                  const score = request.aiAnalysis?.scores.find(s => s.supplierId === p.id);
                  return (
                    <td key={p.id} className={`px-6 py-4 ${p.id === userSelectedId ? 'bg-green-50/30' : ''}`}>
                      {score ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-blue-800 text-lg">{score.totalScore.toFixed(1)}</span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-200">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${score.totalScore * 10}%` }}></div>
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Manual Selection Row */}
            {!readOnly && (
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="px-6 py-6 font-bold text-gray-900 align-middle">
                      Seleção Final
                      <p className="text-xs font-normal text-gray-500 mt-1">Selecione o vencedor antes de finalizar.</p>
                    </td>
                    {request.proposals.map(p => (
                        <td key={p.id} className={`px-6 py-6 text-center align-middle ${p.id === userSelectedId ? 'bg-green-100' : ''}`}>
                             <button
                                onClick={() => onSelectProposal && onSelectProposal(p.id)}
                                className={`w-full py-3 px-4 rounded-lg border font-bold transition-all duration-200 flex items-center justify-center gap-2
                                    ${p.id === userSelectedId 
                                        ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600'}`}
                             >
                                 {p.id === userSelectedId ? (
                                    <>
                                        <CheckBadgeIcon className="w-5 h-5" /> Selecionado
                                    </>
                                 ) : (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                                        Escolher
                                    </>
                                 )}
                             </button>
                        </td>
                    ))}
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EqualizationTable;