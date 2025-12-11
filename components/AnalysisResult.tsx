import React from 'react';
import { PurchaseRequest, AIAnalysisResult } from '../types';
import { SparklesIcon, CheckBadgeIcon } from './Icons';

interface AnalysisResultProps {
  request: PurchaseRequest;
  analysis: AIAnalysisResult;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ request, analysis }) => {
  const winner = request.proposals.find(p => p.id === analysis.recommendedSupplierId);
  if (!winner) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100 shadow-sm mb-8 animate-fade-in-up">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
          <SparklesIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Recomendação da IA</h2>
          <p className="text-gray-600">Análise baseada em custo total, prazo e aderência técnica.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Vencedor Sugerido:</h3>
            <span className="text-xl font-bold text-green-700 flex items-center gap-2">
                {winner.supplierName}
                <CheckBadgeIcon className="w-6 h-6" />
            </span>
        </div>
        <p className="text-gray-700 leading-relaxed text-lg">
            {analysis.reasoning}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis.scores.map(score => {
            const supplier = request.proposals.find(p => p.id === score.supplierId);
            const isWinner = score.supplierId === analysis.recommendedSupplierId;
            if(!supplier) return null;

            return (
                <div key={score.supplierId} className={`p-5 rounded-lg border ${isWinner ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-800 truncate">{supplier.supplierName}</span>
                        <span className={`px-2 py-1 rounded text-sm font-bold ${isWinner ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            Nota: {score.totalScore}
                        </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Comercial</span>
                            <span className="font-medium text-gray-900">{score.commercialScore}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Técnico</span>
                            <span className="font-medium text-gray-900">{score.technicalScore}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">Entrega</span>
                            <span className="font-medium text-gray-900">{score.deliveryScore}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-semibold text-green-700 uppercase">Pontos Fortes</span>
                            <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                {score.pros.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-red-700 uppercase">Pontos Fracos</span>
                            <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                {score.cons.slice(0, 2).map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default AnalysisResult;
