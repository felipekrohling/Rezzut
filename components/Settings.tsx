import React, { useState } from 'react';
import { User, Supplier, UserRole, CostCenter, RolePermissions, PermissionKey } from '../types';
import { UserGroupIcon, BuildingStorefrontIcon, PlusIcon, BanknotesIcon, ShieldCheckIcon, PencilSquareIcon } from './Icons';

interface SettingsProps {
  users: User[];
  setUsers: (users: User[]) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  costCenters: CostCenter[];
  setCostCenters: (ccs: CostCenter[]) => void;
  rolePermissions: RolePermissions[];
  setRolePermissions: (perms: RolePermissions[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  users, setUsers, 
  suppliers, setSuppliers, 
  costCenters, setCostCenters,
  rolePermissions, setRolePermissions
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'suppliers' | 'costCenters' | 'permissions'>('users');

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({ name: '', email: '', role: UserRole.REQUESTER });
  
  // Supplier Form State
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ name: '', category: '', contactEmail: '' });

  // Cost Center Form State
  const [newCC, setNewCC] = useState<Partial<CostCenter>>({ name: '', code: '' });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    if (editingUserId) {
        // Edit existing user
        const updatedUsers = users.map(u => 
            u.id === editingUserId 
            ? { ...u, name: userForm.name!, email: userForm.email!, role: userForm.role as UserRole } 
            : u
        );
        setUsers(updatedUsers);
        setEditingUserId(null);
    } else {
        // Add new user
        const user: User = {
            id: crypto.randomUUID(),
            name: userForm.name!,
            email: userForm.email!,
            role: userForm.role as UserRole
        };
        setUsers([...users, user]);
    }
    setUserForm({ name: '', email: '', role: UserRole.REQUESTER });
  };

  const handleEditUserStart = (user: User) => {
      setEditingUserId(user.id);
      setUserForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleCancelEditUser = () => {
      setEditingUserId(null);
      setUserForm({ name: '', email: '', role: UserRole.REQUESTER });
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    const supplier: Supplier = {
      id: crypto.randomUUID(),
      name: newSupplier.name!,
      category: newSupplier.category || 'Geral',
      contactEmail: newSupplier.contactEmail || ''
    };
    setSuppliers([...suppliers, supplier]);
    setNewSupplier({ name: '', category: '', contactEmail: '' });
  };

  const handleAddCostCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCC.name || !newCC.code) return;
    const cc: CostCenter = {
        id: crypto.randomUUID(),
        name: newCC.name,
        code: newCC.code
    };
    setCostCenters([...costCenters, cc]);
    setNewCC({ name: '', code: '' });
  }

  const deleteUser = (id: string) => {
    if(confirm('Tem certeza que deseja remover este usuário?')) {
        setUsers(users.filter(u => u.id !== id));
        if (editingUserId === id) handleCancelEditUser();
    }
  };

  const deleteSupplier = (id: string) => {
    if(confirm('Tem certeza que deseja remover este fornecedor?')) {
        setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const deleteCostCenter = (id: string) => {
    if(confirm('Tem certeza que deseja remover este Centro de Custo?')) {
        setCostCenters(costCenters.filter(c => c.id !== id));
    }
  };

  const togglePermission = (role: UserRole, permission: PermissionKey) => {
    const updatedPermissions = rolePermissions.map(rp => {
      if (rp.role === role) {
        const hasPerm = rp.permissions.includes(permission);
        return {
          ...rp,
          permissions: hasPerm 
            ? rp.permissions.filter(p => p !== permission) 
            : [...rp.permissions, permission]
        };
      }
      return rp;
    });
    setRolePermissions(updatedPermissions);
  };

  const getPermissionLabel = (key: PermissionKey): string => {
      const labels: Record<PermissionKey, string> = {
          'dashboard_view': 'Visualizar Dashboard',
          'request_view': 'Visualizar Solicitações',
          'request_create': 'Criar Solicitações',
          'request_edit': 'Editar/Cancelar Solicitações',
          'request_approve': 'Aprovar Solicitações (P/ Cotação)',
          'quotation_view': 'Visualizar Cotações',
          'quotation_edit_proposals': 'Gerenciar Propostas (Adicionar/Editar)',
          'quotation_finalize': 'Aprovar Compra (Finalizar)',
          'completed_view': 'Visualizar Finalizadas',
          'completed_export': 'Exportar Relatórios',
          'settings_view': 'Visualizar Configurações',
          'settings_edit': 'Editar Configurações (Cadastros)'
      };
      return labels[key] || key;
  };

  const permissionGroups = [
      { title: 'Dashboard', keys: ['dashboard_view'] as PermissionKey[] },
      { title: 'Solicitações', keys: ['request_view', 'request_create', 'request_edit', 'request_approve'] as PermissionKey[] },
      { title: 'Cotações', keys: ['quotation_view', 'quotation_edit_proposals', 'quotation_finalize'] as PermissionKey[] },
      { title: 'Finalizadas', keys: ['completed_view', 'completed_export'] as PermissionKey[] },
      { title: 'Administração', keys: ['settings_view', 'settings_edit'] as PermissionKey[] }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2 whitespace-nowrap`}
          >
            <UserGroupIcon className={activeTab === 'users' ? 'text-blue-500' : 'text-slate-400'} />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`${
              activeTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2 whitespace-nowrap`}
          >
            <BuildingStorefrontIcon className={activeTab === 'suppliers' ? 'text-blue-500' : 'text-slate-400'} />
            Fornecedores
          </button>
          <button
            onClick={() => setActiveTab('costCenters')}
            className={`${
              activeTab === 'costCenters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2 whitespace-nowrap`}
          >
            <BanknotesIcon className={activeTab === 'costCenters' ? 'text-blue-500' : 'text-slate-400'} />
            Centros de Custo
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2 whitespace-nowrap`}
          >
            <ShieldCheckIcon className={activeTab === 'permissions' ? 'text-blue-500' : 'text-slate-400'} />
            Perfis de Acesso
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                  <input required type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nível de Acesso</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}>
                    {Object.values(UserRole).map(role => (<option key={role} value={role}>{role}</option>))}
                  </select>
                </div>
                <div className="flex gap-2">
                    {editingUserId && (
                        <button type="button" onClick={handleCancelEditUser} className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
                            Cancelar
                        </button>
                    )}
                    <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                        {editingUserId ? 'Salvar Alterações' : (
                            <>
                                <PlusIcon /> Adicionar Usuário
                            </>
                        )}
                    </button>
                </div>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Função</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum usuário cadastrado.</td></tr>) : (
                    users.map(user => (
                      <tr key={user.id} className={`hover:bg-slate-50 ${editingUserId === user.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : user.role === UserRole.BUYER ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span></td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleEditUserStart(user)} 
                                className="text-slate-400 hover:text-blue-600 font-medium p-1 rounded-full hover:bg-blue-50 transition-colors"
                                title="Editar"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Remover</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Novo Fornecedor</h3>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Papelaria Silva" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria Principal</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: TI, Escritório, Serviços" value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de Contato</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newSupplier.contactEmail} onChange={e => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })} />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                  <PlusIcon /> Adicionar Fornecedor
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Fornecedor</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Contato</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.length === 0 ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum fornecedor cadastrado.</td></tr>) : (
                    suppliers.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                        <td className="px-6 py-4 text-slate-600"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{s.category}</span></td>
                        <td className="px-6 py-4 text-slate-600">{s.contactEmail || '-'}</td>
                        <td className="px-6 py-4 text-right"><button onClick={() => deleteSupplier(s.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Remover</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'costCenters' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
               <h3 className="text-lg font-semibold text-slate-800 mb-4">Novo Centro de Custo</h3>
               <form onSubmit={handleAddCostCenter} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                   <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     placeholder="Ex: CC-001" value={newCC.code} onChange={e => setNewCC({ ...newCC, code: e.target.value })} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Departamento</label>
                   <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     placeholder="Ex: Tecnologia da Informação" value={newCC.name} onChange={e => setNewCC({ ...newCC, name: e.target.value })} />
                 </div>
                 <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                   <PlusIcon /> Adicionar Centro de Custo
                 </button>
               </form>
             </div>
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3">Código</th>
                     <th className="px-6 py-3">Departamento</th>
                     <th className="px-6 py-3 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {costCenters.length === 0 ? (<tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhum centro de custo cadastrado.</td></tr>) : (
                     costCenters.map(c => (
                       <tr key={c.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-mono font-medium text-slate-900">{c.code}</td>
                         <td className="px-6 py-4 text-slate-600">{c.name}</td>
                         <td className="px-6 py-4 text-right"><button onClick={() => deleteCostCenter(c.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Remover</button></td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'permissions' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                 <div className="p-6 border-b border-slate-200 bg-slate-50">
                     <h3 className="text-lg font-semibold text-slate-800">Matriz de Permissões</h3>
                     <p className="text-sm text-slate-500">Configure o que cada perfil pode visualizar ou editar.</p>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 border-r border-slate-200 w-1/3">Ação / Permissão</th>
                                <th className="px-6 py-4 text-center border-r border-slate-200 w-1/5 bg-purple-50 text-purple-900">Administrador</th>
                                <th className="px-6 py-4 text-center border-r border-slate-200 w-1/5 text-blue-900">Comprador</th>
                                <th className="px-6 py-4 text-center w-1/5 text-slate-900">Solicitante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {permissionGroups.map((group, groupIdx) => (
                                <React.Fragment key={groupIdx}>
                                    <tr className="bg-slate-50">
                                        <td colSpan={4} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{group.title}</td>
                                    </tr>
                                    {group.keys.map(permKey => (
                                        <tr key={permKey} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 border-r border-slate-100 font-medium text-slate-700">
                                                {getPermissionLabel(permKey)}
                                            </td>
                                            {/* Admin - Always Checked & Disabled */}
                                            <td className="px-6 py-3 border-r border-slate-100 text-center bg-purple-50/30">
                                                <input type="checkbox" checked disabled className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 opacity-50 cursor-not-allowed" />
                                            </td>
                                            {/* Buyer */}
                                            <td className="px-6 py-3 border-r border-slate-100 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={rolePermissions.find(rp => rp.role === UserRole.BUYER)?.permissions.includes(permKey) || false}
                                                    onChange={() => togglePermission(UserRole.BUYER, permKey)}
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                                                />
                                            </td>
                                            {/* Requester */}
                                            <td className="px-6 py-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={rolePermissions.find(rp => rp.role === UserRole.REQUESTER)?.permissions.includes(permKey) || false}
                                                    onChange={() => togglePermission(UserRole.REQUESTER, permKey)}
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default Settings;