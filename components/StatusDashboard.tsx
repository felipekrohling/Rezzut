import React from 'react';
import { PurchaseRequest, RequestStatus } from '../types';
import { CheckBadgeIcon, XCircleIcon, ArrowPathIcon } from './Icons';

interface StatusDashboardProps {
  requests: PurchaseRequest[];
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onViewRequest: (request: PurchaseRequest) => void;
}

const StatusColumn: React.FC<{
  title: string;
  status: RequestStatus;
  requests: PurchaseRequest[];
  color: string;
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onViewRequest: (req: PurchaseRequest) => void;
}> = ({ title, status, requests, color, onStatusChange, onViewRequest }) => {
  
  const totalValue = requests.reduce((acc, req) => {
    // Estimate value based on lowest proposal or 0
    const lowest = req.proposals.length > 0 
        ? Math.min(...req.proposals.map(p => p.price)) 
        : 0;
    return acc + lowest;
  }, 0);

  return (
    <div className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 p-4">
      <div className={`flex items-center justify-between mb-4 pb-3 border-b border-${color}-200`}>
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full bg-${color}-500`}></span>
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <span className="bg-white text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-200">
                {requests.length}
            </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <h4 onClick={() => onViewRequest(req)} className="font-bold text-slate-800 mb-1 cursor-pointer hover:text-blue-600 line-clamp-2">
                {req.title}
            </h4>
            <div className="text-xs text-slate-500 mb-3 flex justify-between">
                <span>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>{req.proposals.length} propostas</span>
            </div>
            
            {/* Quick Actions based on status */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                {status !== RequestStatus.COMPLETED && status !== RequestStatus.CANCELLED && (
                    <button 
                        title="Cancelar"
                        onClick={() => onStatusChange(req.id, RequestStatus.CANCELLED)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
                
                {status === RequestStatus.QUOTED && req.selectedProposalId && (
                    <button 
                        title="Finalizar Compra"
                        onClick={() => onStatusChange(req.id, RequestStatus.COMPLETED)}
                        className="p-1 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded"
                    >
                        <CheckBadgeIcon className="w-5 h-5" />
                    </button>
                )}

                {status === RequestStatus.REQUESTED && req.proposals.length > 0 && (
                     <button 
                     title="Mover para Cotação"
                     onClick={() => onStatusChange(req.id, RequestStatus.QUOTED)}
                     className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                 >
                     <ArrowPathIcon className="w-5 h-5" />
                 </button>
                )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                Vazio
            </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Total Est.</span>
            <span>R$ {totalValue.toLocaleString('pt-BR', { notation: 'compact' })}</span>
        </div>
      </div>
    </div>
  );
};

const StatusDashboard: React.FC<StatusDashboardProps> = ({ requests, onStatusChange, onViewRequest }) => {
  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Status das Solicitações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 h-full overflow-hidden pb-4">
        <StatusColumn 
            title="Solicitado" 
            status={RequestStatus.REQUESTED} 
            color="blue"
            requests={requests.filter(r => r.status === RequestStatus.REQUESTED)} 
            onStatusChange={onStatusChange}
            onViewRequest={onViewRequest}
        />
        <StatusColumn 
            title="Cotada / Análise" 
            status={RequestStatus.QUOTED} 
            color="purple"
            requests={requests.filter(r => r.status === RequestStatus.QUOTED)} 
            onStatusChange={onStatusChange}
            onViewRequest={onViewRequest}
        />
        <StatusColumn 
            title="Finalizada" 
            status={RequestStatus.COMPLETED} 
            color="green"
            requests={requests.filter(r => r.status === RequestStatus.COMPLETED)} 
            onStatusChange={onStatusChange}
            onViewRequest={onViewRequest}
        />
        <StatusColumn 
            title="Cancelada" 
            status={RequestStatus.CANCELLED} 
            color="gray"
            requests={requests.filter(r => r.status === RequestStatus.CANCELLED)} 
            onStatusChange={onStatusChange}
            onViewRequest={onViewRequest}
        />
      </div>
    </div>
  );
};

export default StatusDashboard;