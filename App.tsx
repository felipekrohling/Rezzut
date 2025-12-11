import React, { useState } from 'react';
import { PurchaseRequest, RequestStatus, Proposal, User, Supplier, UserRole, CostCenter, RolePermissions, PermissionKey } from './types';
import { PlusIcon, DocumentTextIcon, ChevronLeftIcon, SparklesIcon, Squares2X2Icon, Cog6ToothIcon, CheckBadgeIcon, BuildingStorefrontIcon, BanknotesIcon, ArrowPathIcon, ArrowDownTrayIcon, PencilSquareIcon, XCircleIcon, ClockIcon } from './components/Icons';
import ProposalForm from './components/ProposalForm';
import EqualizationTable from './components/EqualizationTable';
import AnalysisResult from './components/AnalysisResult';
import StatusDashboard from './components/StatusDashboard';
import Settings from './components/Settings';
import AuthScreen from './components/AuthScreen';
import Logo from './components/Logo';
import { analyzeProposals } from './services/geminiService';

const MOCK_COST_CENTERS: CostCenter[] = [
    { id: 'cc1', code: '1001', name: 'Tecnologia da Informação' },
    { id: 'cc2', code: '2005', name: 'Recursos Humanos' },
    { id: 'cc3', code: '3010', name: 'Marketing e Vendas' },
];

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Ana Silva', email: 'ana.silva@optibuy.com', role: UserRole.ADMIN },
    { id: 'u2', name: 'Carlos Souza', email: 'carlos.s@optibuy.com', role: UserRole.BUYER },
    { id: 'u3', name: 'Beatriz Costa', email: 'bia.costa@optibuy.com', role: UserRole.REQUESTER },
];

const MOCK_REQUESTS: PurchaseRequest[] = [
  {
    id: '1',
    title: 'Notebooks Alta Performance',
    description: 'Aquisição de notebooks para time de desenvolvimento.',
    createdAt: new Date().toISOString(),
    requiredQuantity: 10,
    unit: 'Unidade',
    purpose: 'Consumo',
    targetSpecs: 'Processador i9/Ryzen 9, 32GB RAM, 1TB SSD NVMe, Tela IPS 16pol 144hz, Garantia ProSupport.',
    status: RequestStatus.QUOTED,
    costCenterId: 'cc1',
    selectedProposalId: 'p2', // Pre-selected for demo
    history: [
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), action: 'Criado', userId: 'u3', userName: 'Beatriz Costa', userRole: UserRole.REQUESTER },
        { date: new Date(Date.now() - 86400000 * 1).toISOString(), action: 'Aprovado para Cotação', userId: 'u1', userName: 'Ana Silva', userRole: UserRole.ADMIN }
    ],
    proposals: [
      {
        id: 'p1',
        supplierName: 'TechSolutions Ltda',
        price: 85000,
        currency: 'BRL',
        deliveryDays: 45,
        deliveryDate: '2025-02-15',
        paymentTerms: '50% sinal, 50% entrega',
        technicalSpecs: 'Dell Precision 3000, i7 (gen ant), 32GB RAM, 512GB SSD. Garantia padrão.',
        validityDate: '2024-12-30'
      },
      {
        id: 'p2',
        supplierName: 'MegaInfo Corporate',
        price: 92000,
        currency: 'BRL',
        deliveryDays: 15,
        deliveryDate: '2025-01-20',
        paymentTerms: '30 dias',
        technicalSpecs: 'Lenovo ThinkPad P16, i9, 32GB, 1TB SSD. Garantia On-site 3 anos.',
        validityDate: '2024-12-30'
      },
      {
        id: 'p3',
        supplierName: 'FastBytes Distribuidora',
        price: 82000,
        currency: 'BRL',
        deliveryDays: 7,
        deliveryDate: '2025-01-12',
        paymentTerms: 'A vista',
        technicalSpecs: 'Avell HighPerf, i9, 64GB RAM, 1TB SSD. Garantia balcão.',
        validityDate: '2024-12-30'
      }
    ]
  },
  {
    id: '2',
    title: 'Cadeiras Ergonômicas',
    description: 'Substituição cadeiras do setor financeiro.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    requiredQuantity: 5,
    unit: 'Unidade',
    purpose: 'Consumo',
    targetSpecs: 'Herman Miller Aeron ou similar, ajuste lombar.',
    status: RequestStatus.REQUESTED,
    costCenterId: 'cc2',
    history: [
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), action: 'Criado', userId: 'u2', userName: 'Carlos Souza', userRole: UserRole.BUYER }
    ],
    proposals: []
  },
  {
    id: '3',
    title: 'Licença Software ERP',
    description: 'Renovação anual.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    requiredQuantity: 1,
    unit: 'Verba',
    purpose: 'Consumo',
    targetSpecs: 'Módulo Fiscal e Contábil.',
    status: RequestStatus.COMPLETED,
    costCenterId: 'cc1',
    history: [
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), action: 'Criado', userId: 'u1', userName: 'Ana Silva', userRole: UserRole.ADMIN },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), action: 'Aprovado para Cotação', userId: 'u1', userName: 'Ana Silva', userRole: UserRole.ADMIN },
        { date: new Date(Date.now() - 86400000 * 1).toISOString(), action: 'Compra Finalizada', userId: 'u1', userName: 'Ana Silva', userRole: UserRole.ADMIN }
    ],
    proposals: []
  }
];

const MOCK_SUPPLIERS: Supplier[] = [
    { id: 's1', name: 'TechSolutions Ltda', category: 'Hardware', contactEmail: 'vendas@tech.com' },
    { id: 's2', name: 'Kalunga Empresas', category: 'Escritório', contactEmail: 'b2b@kalunga.com' },
];

// Initial Permissions Configuration
const INITIAL_PERMISSIONS: RolePermissions[] = [
  {
    role: UserRole.ADMIN,
    permissions: [
      'dashboard_view', 'request_view', 'request_create', 'request_edit', 'request_approve',
      'quotation_view', 'quotation_edit_proposals', 'quotation_finalize',
      'completed_view', 'completed_export',
      'settings_view', 'settings_edit'
    ]
  },
  {
    role: UserRole.BUYER,
    permissions: [
      'dashboard_view', 'request_view', 'request_approve',
      'quotation_view', 'quotation_edit_proposals', 'quotation_finalize',
      'completed_view', 'completed_export'
    ]
  },
  {
    role: UserRole.REQUESTER,
    permissions: [
      'dashboard_view', 'request_view', 'request_create', 'request_edit',
      'quotation_view',
      'completed_view'
    ]
  }
];

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [view, setView] = useState<'dashboard' | 'requests' | 'quotations' | 'completed' | 'settings' | 'create' | 'detail'>('dashboard');
  const [lastView, setLastView] = useState<'dashboard' | 'requests' | 'quotations' | 'completed'>('dashboard');

  const [requests, setRequests] = useState<PurchaseRequest[]>(MOCK_REQUESTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(MOCK_COST_CENTERS);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(INITIAL_PERMISSIONS);
  
  const [activeRequest, setActiveRequest] = useState<PurchaseRequest | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>(undefined);
  const [analyzing, setAnalyzing] = useState(false);

  // New/Edit Request Form State
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [newReq, setNewReq] = useState({ 
      title: '', 
      description: '', 
      qty: 1, 
      unit: 'Unidade',
      purpose: 'Consumo' as 'Consumo' | 'Revenda',
      specs: '', 
      costCenterId: '' 
  });

  // Permission Check Helper
  const hasPermission = (permission: PermissionKey): boolean => {
      if (!currentUser) return false;
      
      // Admin always has full access (implicit override)
      if (currentUser.role === UserRole.ADMIN) return true;

      const roleConfig = rolePermissions.find(rp => rp.role === currentUser.role);
      return roleConfig ? roleConfig.permissions.includes(permission) : false;
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleRegister = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        role
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRequest(null);
  };

  const navigateTo = (newView: typeof view) => {
    if (newView === 'requests' || newView === 'quotations' || newView === 'completed' || newView === 'dashboard') {
        setLastView(newView);
    }
    setView(newView);
  };

  const handleStartCreateRequest = () => {
      setEditingRequestId(null);
      setNewReq({ title: '', description: '', qty: 1, unit: 'Unidade', purpose: 'Consumo', specs: '', costCenterId: '' });
      setView('create');
  };

  const handleEditRequestStart = (req: PurchaseRequest, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingRequestId(req.id);
      setNewReq({ 
          title: req.title, 
          description: req.description, 
          qty: req.requiredQuantity, 
          unit: req.unit,
          purpose: req.purpose, 
          specs: req.targetSpecs, 
          costCenterId: req.costCenterId || '' 
      });
      setView('create');
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.costCenterId) {
        alert("Selecione um Centro de Custo.");
        return;
    }
    if (!currentUser) return;

    if (editingRequestId) {
        // UPDATE Existing Request
        const updatedRequests = requests.map(r => {
            if (r.id === editingRequestId) {
                return {
                    ...r,
                    title: newReq.title,
                    description: newReq.description,
                    requiredQuantity: newReq.qty,
                    unit: newReq.unit,
                    purpose: newReq.purpose,
                    targetSpecs: newReq.specs,
                    costCenterId: newReq.costCenterId
                };
            }
            return r;
        });
        setRequests(updatedRequests);
        
        // If we were editing from detail view, update active request too
        if (activeRequest && activeRequest.id === editingRequestId) {
             const updated = updatedRequests.find(r => r.id === editingRequestId) || null;
             setActiveRequest(updated);
             setView('detail');
        } else {
             navigateTo('requests');
        }
    } else {
        // CREATE New Request
        const req: PurchaseRequest = {
            id: crypto.randomUUID(),
            title: newReq.title,
            description: newReq.description,
            requiredQuantity: newReq.qty,
            unit: newReq.unit,
            purpose: newReq.purpose,
            targetSpecs: newReq.specs,
            costCenterId: newReq.costCenterId,
            createdAt: new Date().toISOString(),
            status: RequestStatus.REQUESTED,
            proposals: [],
            history: [{
                date: new Date().toISOString(),
                action: 'Criado',
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role
            }]
        };
        setRequests([req, ...requests]);
        navigateTo('requests');
    }
    
    // Reset form
    setNewReq({ title: '', description: '', qty: 1, unit: 'Unidade', purpose: 'Consumo', specs: '', costCenterId: '' });
    setEditingRequestId(null);
  };

  const handleCancelRequest = (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!confirm("Tem certeza que deseja cancelar esta solicitação?")) return;
      if (!currentUser) return;
      
      const updatedRequests = requests.map(r => {
        if (r.id === id) {
            return { 
                ...r, 
                status: RequestStatus.CANCELLED,
                history: [...r.history, {
                    date: new Date().toISOString(),
                    action: 'Cancelado',
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userRole: currentUser.role
                }]
            };
        }
        return r;
      });
      setRequests(updatedRequests);
      
      if (activeRequest && activeRequest.id === id) {
          setActiveRequest(null);
          navigateTo('requests');
      }
  };

  const handleAddProposal = (proposal: Proposal) => {
    if (!activeRequest) return;
    
    let updatedProposals = [...activeRequest.proposals];
    
    if (editingProposal) {
        // Update existing
        updatedProposals = updatedProposals.map(p => p.id === proposal.id ? proposal : p);
    } else {
        // Add new
        updatedProposals.push(proposal);
    }

    const updatedRequest = {
      ...activeRequest,
      proposals: updatedProposals,
    };
    
    updateRequestInState(updatedRequest);
    setShowProposalForm(false);
    setEditingProposal(undefined);
  };

  const handleEditProposal = (proposal: Proposal) => {
      setEditingProposal(proposal);
      setShowProposalForm(true);
  };

  const updateRequestInState = (updated: PurchaseRequest) => {
    // Update main list
    setRequests(prevRequests => prevRequests.map(r => r.id === updated.id ? updated : r));
    // Update active view
    setActiveRequest(updated);
  };

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    if(!currentUser) return;
    // Check perms for quick actions
    if (newStatus === RequestStatus.QUOTED && !hasPermission('request_approve')) return alert("Sem permissão para aprovar.");
    if (newStatus === RequestStatus.COMPLETED && !hasPermission('quotation_finalize')) return alert("Sem permissão para finalizar.");
    if (newStatus === RequestStatus.CANCELLED && !hasPermission('request_edit')) return alert("Sem permissão para cancelar.");

    const updated = requests.map(r => {
        if (r.id === id) {
            const action = newStatus === RequestStatus.COMPLETED ? 'Compra Finalizada' : 
                           newStatus === RequestStatus.CANCELLED ? 'Cancelado' : 
                           newStatus === RequestStatus.QUOTED ? 'Aprovado para Cotação' : 'Status Alterado';
            
            return { 
                ...r, 
                status: newStatus,
                history: [...r.history, {
                    date: new Date().toISOString(),
                    action: action,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userRole: currentUser.role
                }]
            };
        }
        return r;
    });
    setRequests(updated);
  };

  const handleApproveRequest = () => {
    if (!activeRequest) return;
    if (activeRequest.status !== RequestStatus.REQUESTED) return;
    if (!currentUser) return;

    const updated: PurchaseRequest = { 
        ...activeRequest, 
        status: RequestStatus.QUOTED,
        history: [...activeRequest.history, {
            date: new Date().toISOString(),
            action: 'Aprovado para Cotação',
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role
        }]
    };
    updateRequestInState(updated);
    alert("Solicitação aprovada! Agora está disponível em 'Cotações' para inserção de propostas.");
    
    // Clear active request and navigate to Quotations tab
    setActiveRequest(null);
    navigateTo('quotations');
  };

  const handleSelectProposal = (proposalId: string) => {
      if(!activeRequest) return;
      const updated = { ...activeRequest, selectedProposalId: proposalId };
      // Explicitly update both active and main state to ensure button enables immediately
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setActiveRequest(updated);
  };

  const handleFinalizeRequest = () => {
      if(!activeRequest) return;
      if (!currentUser) return;
      
      // Get the most up-to-date version of the request from the list
      const currentReq = requests.find(r => r.id === activeRequest.id) || activeRequest;
      
      if(!currentReq.selectedProposalId) {
          alert("Por favor, selecione uma proposta vencedora na tabela antes de finalizar.");
          return;
      }

      // Finalize immediately without confirm dialog for better UX flow
      const updated: PurchaseRequest = { 
          ...currentReq, 
          status: RequestStatus.COMPLETED,
          history: [...currentReq.history, {
            date: new Date().toISOString(),
            action: 'Compra Finalizada',
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role
        }]
      };
      
      // Update list
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      
      // Clear active request to exit detail view
      setActiveRequest(null);
      
      // Navigate to Completed tab immediately
      navigateTo('completed');
  };

  const runAnalysis = async () => {
    if (!activeRequest) return;
    setAnalyzing(true);
    try {
      const result = await analyzeProposals(activeRequest);
      // Auto-select the AI recommendation if none selected yet
      const updated = { 
          ...activeRequest, 
          aiAnalysis: result,
      };
      updateRequestInState(updated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const exportToExcel = () => {
    const completedRequests = requests.filter(r => r.status === RequestStatus.COMPLETED);
    if (completedRequests.length === 0) {
        alert("Não há solicitações finalizadas para exportar.");
        return;
    }

    const headers = [
        "ID",
        "Data Solicitação",
        "Título",
        "Centro de Custo",
        "Criado Por",
        "Status",
        "Fornecedor Vencedor",
        "Valor Final",
        "Data Entrega Prevista",
        "Aprovado Cotação Por",
        "Finalizado Por"
    ];

    const rows = completedRequests.map(r => {
        const costCenter = costCenters.find(c => c.id === r.costCenterId);
        const winner = r.proposals.find(p => p.id === r.selectedProposalId);
        
        // Find specific history events
        const creator = r.history.find(h => h.action === 'Criado')?.userName || 'Desconhecido';
        const approver = r.history.find(h => h.action === 'Aprovado para Cotação')?.userName || '-';
        const finalizer = r.history.find(h => h.action === 'Compra Finalizada')?.userName || '-';

        return [
            r.id,
            new Date(r.createdAt).toLocaleDateString('pt-BR'),
            `"${r.title}"`, 
            costCenter ? `${costCenter.code} - ${costCenter.name}` : '',
            creator,
            r.status,
            winner ? `"${winner.supplierName}"` : '',
            winner ? winner.price.toFixed(2).replace('.', ',') : '',
            winner?.deliveryDate ? new Date(winner.deliveryDate).toLocaleDateString('pt-BR') : '',
            approver,
            finalizer
        ].join(';'); 
    });

    const csvContent = "data:text/csv;charset=utf-8," + "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `optibuy_finalizadas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredRequests = () => {
    switch (view) {
        case 'requests': return requests.filter(r => r.status === RequestStatus.REQUESTED);
        case 'quotations': return requests.filter(r => r.status === RequestStatus.QUOTED);
        case 'completed': return requests.filter(r => r.status === RequestStatus.COMPLETED || r.status === RequestStatus.CANCELLED);
        default: return requests;
    }
  };

  const getTitleForView = () => {
    switch (view) {
        case 'requests': return 'Solicitações Pendentes';
        case 'quotations': return 'Cotações em Andamento';
        case 'completed': return 'Histórico Finalizado';
        default: return 'Solicitações';
    }
  };

  if (!currentUser) {
      return (
        <AuthScreen 
            users={users} 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
        />
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
                <Logo className="w-8 h-8" />
            </div>

            <nav className="hidden md:flex items-center space-x-1">
                <button 
                    onClick={() => navigateTo('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-2">
                     <Squares2X2Icon className="w-5 h-5"/> Dashboard
                   </div>
                </button>
                <button 
                    onClick={() => navigateTo('requests')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'requests' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-2">
                     <DocumentTextIcon className="w-5 h-5"/> Solicitações
                   </div>
                </button>
                <button 
                    onClick={() => navigateTo('quotations')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'quotations' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-2">
                     <BuildingStorefrontIcon className="w-5 h-5"/> Cotações
                   </div>
                </button>
                <button 
                    onClick={() => navigateTo('completed')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'completed' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-2">
                     <CheckBadgeIcon className="w-5 h-5"/> Finalizadas
                   </div>
                </button>
                {hasPermission('settings_view') && (
                    <button 
                        onClick={() => navigateTo('settings')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'settings' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                    <div className="flex items-center gap-2">
                        <Cog6ToothIcon className="w-5 h-5"/> Configurações
                    </div>
                    </button>
                )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                     <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
                     <p className="text-xs text-slate-500">{currentUser.role}</p>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                 </div>
             </div>
             <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                 </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Dashboard View */}
        {view === 'dashboard' && (
            <StatusDashboard 
                requests={requests} 
                onStatusChange={handleStatusChange} 
                onViewRequest={(req) => { setActiveRequest(req); setLastView('dashboard'); setView('detail'); }}
            />
        )}

        {/* Settings View */}
        {view === 'settings' && hasPermission('settings_view') && (
            <Settings 
                users={users} 
                setUsers={setUsers} 
                suppliers={suppliers} 
                setSuppliers={setSuppliers}
                costCenters={costCenters}
                setCostCenters={setCostCenters}
                rolePermissions={rolePermissions}
                setRolePermissions={setRolePermissions}
            />
        )}

        {/* List Views (Shared Layout for Requests, Quotations, Completed) */}
        {(view === 'requests' || view === 'quotations' || view === 'completed') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">{getTitleForView()}</h2>
              
              {view === 'requests' && hasPermission('request_create') && (
                  <button 
                    onClick={handleStartCreateRequest}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <PlusIcon /> Nova Solicitação
                  </button>
              )}

              {view === 'completed' && hasPermission('completed_export') && (
                   <button 
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <ArrowDownTrayIcon /> Exportar Excel
                  </button>
              )}
            </div>

            <div className="grid gap-4">
              {getFilteredRequests().length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-slate-300">
                  <p className="text-slate-500">Nenhum item encontrado nesta etapa.</p>
                </div>
              ) : (
                getFilteredRequests().map(req => {
                    const costCenter = costCenters.find(c => c.id === req.costCenterId);
                    return (
                        <div 
                            key={req.id} 
                            onClick={() => { setActiveRequest(req); setView('detail'); }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{req.title}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${req.status === RequestStatus.REQUESTED ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                        req.status === RequestStatus.QUOTED ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                        req.status === RequestStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {req.status}
                                    </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{req.description}</p>
                                    <div className="flex items-center gap-6 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        📦 Qtd: {req.requiredQuantity} {req.unit}
                                    </span>
                                    <span className="flex items-center gap-1 text-slate-500">
                                        🏷️ {req.purpose}
                                    </span>
                                    {costCenter && (
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                                            <BanknotesIcon className="w-3 h-3"/> {costCenter.code} - {costCenter.name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        📅 {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {req.status === RequestStatus.REQUESTED && hasPermission('request_edit') && (
                                        <>
                                            <button 
                                                onClick={(e) => handleEditRequestStart(req, e)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Editar Solicitação"
                                            >
                                                <PencilSquareIcon className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={(e) => handleCancelRequest(req.id, e)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Cancelar Solicitação"
                                            >
                                                <XCircleIcon className="w-5 h-5"/>
                                            </button>
                                        </>
                                    )}
                                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors ml-2">
                                        <ChevronLeftIcon />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Request View */}
        {view === 'create' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <button onClick={() => navigateTo('requests')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
              <div className="rotate-180 transform mr-1"><ChevronLeftIcon /></div> Voltar
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                    {editingRequestId ? 'Editar Solicitação' : 'Nova Solicitação de Compra'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Preencha os detalhes da necessidade.</p>
              </div>
              
              <form onSubmit={handleSaveRequest} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título do Item</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Ex: Projetor 4K para Sala de Reunião"
                    value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                    <input required type="number" min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                      value={newReq.qty} onChange={e => setNewReq({...newReq, qty: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                    <select 
                        required 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        value={newReq.unit} 
                        onChange={e => setNewReq({...newReq, unit: e.target.value})}
                    >
                        <option value="Unidade">Unidade</option>
                        <option value="Caixa">Caixa</option>
                        <option value="Metro">Metro</option>
                        <option value="Kg">Kg</option>
                        <option value="Litro">Litro</option>
                        <option value="Conjunto">Conjunto</option>
                        <option value="Verba">Verba</option>
                        <option value="Serviço">Serviço</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Centro de Custo</label>
                        <select 
                            required 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            value={newReq.costCenterId} 
                            onChange={e => setNewReq({...newReq, costCenterId: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                            ))}
                        </select>
                   </div>
                   <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Finalidade</label>
                        <select 
                            required 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            value={newReq.purpose} 
                            onChange={e => setNewReq({...newReq, purpose: e.target.value as 'Consumo' | 'Revenda'})}
                        >
                            <option value="Consumo">Uso e Consumo</option>
                            <option value="Revenda">Revenda / Industrialização</option>
                        </select>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Justificativa</label>
                  <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2}
                    placeholder="Para que será usado?"
                    value={newReq.description} onChange={e => setNewReq({...newReq, description: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Especificações Técnicas Alvo (Target)</label>
                  <textarea required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={4}
                    placeholder="Ex: Resolução 3840x2160, Brilho 3000 lumens, Conexão HDMI e Wireless..."
                    value={newReq.specs} onChange={e => setNewReq({...newReq, specs: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">A IA usará isso para comparar com as ofertas dos fornecedores.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                   <button type="button" onClick={() => navigateTo('requests')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancelar</button>
                   <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md">
                       {editingRequestId ? 'Salvar Alterações' : 'Criar Solicitação'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && activeRequest && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button onClick={() => setView(lastView)} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors w-fit">
                  <div className="rotate-180 transform mr-1"><ChevronLeftIcon /></div> Voltar
                </button>
                <div className="flex gap-3">
                   {/* Approve Button & Edit/Cancel - Only for REQUESTED status */}
                   {activeRequest.status === RequestStatus.REQUESTED && (
                       <>
                           {hasPermission('request_edit') && (
                               <>
                                <button
                                    onClick={(e) => handleEditRequestStart(activeRequest, e)}
                                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                                >
                                    <PencilSquareIcon /> Editar
                                </button>
                                <button
                                    onClick={(e) => handleCancelRequest(activeRequest.id, e)}
                                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                                >
                                    <XCircleIcon /> Cancelar
                                </button>
                               </>
                           )}
                           {hasPermission('request_approve') && (
                               <button
                               onClick={handleApproveRequest}
                               className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all"
                               >
                               <CheckBadgeIcon /> Aprovar para Cotação
                               </button>
                           )}
                       </>
                   )}

                   {/* Add Proposal & Equalize & Finalize - Only for QUOTED status */}
                   {activeRequest.status === RequestStatus.QUOTED && (
                        <>
                            {activeRequest.proposals.length >= 2 && !activeRequest.aiAnalysis && (
                                <button 
                                    onClick={runAnalysis} 
                                    disabled={analyzing}
                                    className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all ${analyzing ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {analyzing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analisando com IA...
                                    </>
                                    ) : (
                                    <>
                                        <SparklesIcon /> Equalizar Propostas
                                    </>
                                    )}
                                </button>
                            )}
                            
                            {/* Finalize Purchase Button - requires a selected proposal */}
                            {hasPermission('quotation_finalize') && (
                                <button
                                    onClick={handleFinalizeRequest}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-md transition-all
                                        ${activeRequest.selectedProposalId 
                                            ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse-slow' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                    title={activeRequest.selectedProposalId ? "Aprovar e Finalizar Compra" : "Selecione um vencedor na tabela para finalizar"}
                                >
                                    <CheckBadgeIcon /> Aprovar e Finalizar
                                </button>
                            )}

                            {hasPermission('quotation_edit_proposals') && (
                                <button 
                                onClick={() => { setEditingProposal(undefined); setShowProposalForm(true); }}
                                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                                >
                                <PlusIcon /> Adicionar Proposta
                                </button>
                            )}
                        </>
                   )}
                </div>
             </div>

             {/* Request Info */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{activeRequest.title}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${activeRequest.status === RequestStatus.REQUESTED ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              activeRequest.status === RequestStatus.QUOTED ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                              activeRequest.status === RequestStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {activeRequest.status}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">{activeRequest.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-slate-500">Quantidade Solicitada</span>
                    <span className="text-xl font-bold text-slate-800">{activeRequest.requiredQuantity} <span className="text-sm font-normal text-slate-500">{activeRequest.unit}</span></span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Técnico</span>
                        <p className="text-slate-700 mt-1">{activeRequest.targetSpecs}</p>
                    </div>
                    <div className="space-y-4">
                        {activeRequest.costCenterId && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                    <BanknotesIcon className="w-4 h-4" /> Centro de Custo
                                </span>
                                {(() => {
                                    const cc = costCenters.find(c => c.id === activeRequest.costCenterId);
                                    return cc ? (
                                        <p className="text-slate-700 mt-1 font-medium">{cc.code} - {cc.name}</p>
                                    ) : <p className="text-slate-400 mt-1">Não encontrado</p>
                                })()}
                            </div>
                        )}
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                    🏷️ Tipo de Compra
                                </span>
                                <p className="text-slate-700 mt-1 font-medium">{activeRequest.purpose}</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Workflow History Section */}
             {activeRequest.history.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-slate-500" />
                        Histórico do Processo
                    </h3>
                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                        {activeRequest.history.map((h, index) => (
                            <div key={index} className="mb-6 ml-6 relative">
                                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                                </span>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{h.action}</p>
                                        <p className="text-xs text-slate-500">Por: <span className="font-medium text-slate-700">{h.userName}</span> ({h.userRole})</p>
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 sm:mt-0 font-mono">
                                        {new Date(h.date).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             )}

             {/* AI Analysis Result */}
             {activeRequest.aiAnalysis && (
               <AnalysisResult request={activeRequest} analysis={activeRequest.aiAnalysis} />
             )}

             {/* Proposals Section */}
             {activeRequest.status === RequestStatus.REQUESTED ? (
                 <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <ArrowPathIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                        Esta solicitação precisa ser aprovada antes de receber cotações.
                    </p>
                 </div>
             ) : (
                <>
                    {showProposalForm ? (
                        <ProposalForm 
                        requestId={activeRequest.id} 
                        suppliers={suppliers}
                        onAdd={handleAddProposal} 
                        onCancel={() => { setShowProposalForm(false); setEditingProposal(undefined); }} 
                        initialData={editingProposal}
                        />
                    ) : (
                        <EqualizationTable 
                            request={activeRequest} 
                            onSelectProposal={handleSelectProposal} 
                            onEditProposal={hasPermission('quotation_edit_proposals') ? handleEditProposal : undefined}
                            readOnly={activeRequest.status === RequestStatus.COMPLETED || activeRequest.status === RequestStatus.CANCELLED}
                        />
                    )}
                </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;