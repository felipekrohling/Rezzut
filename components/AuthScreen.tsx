import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Logo from './Logo';

interface AuthScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (name: string, email: string, role: UserRole) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Mock password field
    role: UserRole.REQUESTER
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Simple mock login: check if email exists
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (user) {
        onLogin(user);
      } else {
        setError('Usuário não encontrado. Verifique o e-mail ou cadastre-se.');
      }
    } else {
      // Registration
      if (!formData.name || !formData.email || !formData.password) {
        setError('Preencha todos os campos.');
        return;
      }
      const exists = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (exists) {
        setError('Este e-mail já está cadastrado.');
        return;
      }
      onRegister(formData.name, formData.email, formData.role);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 blur-3xl"></div>
            <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-purple-100/40 to-blue-100/40 blur-3xl"></div>
        </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-white/50 w-full max-w-md z-10 backdrop-blur-sm relative">
        <div className="flex justify-center mb-8">
            <Logo className="w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          {isLogin 
            ? 'Acesse o sistema de gestão de compras inteligente.' 
            : 'Comece a otimizar suas compras hoje mesmo.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Seu nome"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu.email@empresa.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          {!isLogin && (
             <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                    <option value={UserRole.REQUESTER}>Solicitante</option>
                    <option value={UserRole.BUYER}>Comprador</option>
                    <option value={UserRole.ADMIN}>Administrador</option>
                </select>
             </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
          >
            {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {isLogin ? 'Não tem uma conta?' : 'Já tem cadastro?'}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>
        </div>
        
        {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                    Usuários de teste disponíveis:<br/>
                    ana.silva@optibuy.com<br/>
                    carlos.s@optibuy.com
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;