import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  PhoneCall,
  BarChart3,
  Receipt
} from 'lucide-react';

import { useLaundry } from '../context/LaundryContext';

export const AdminLoginView: React.FC = () => {
  const { login } = useLaundry();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Email ou mot de passe incorrect.');
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-100/60 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-200/40 blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <img
            src="/assets/aistudio/logo.png"
            alt="S.L Ndiaye Pressing"
            className="mx-auto h-44 w-56 object-contain animate-in fade-in zoom-in duration-300"
          />
          <p className="text-xs text-slate-500">
            Espace administration
          </p>
        </div>

        {/* Card Login */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Connexion Espace Gérant
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Identifiez-vous pour gérer les commandes, la facturation et le suivi en temps réel.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username field */}
            <div>
              <label 
                htmlFor="admin-login-email" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Identifiant ou Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-email"
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="slndiaye@pressing.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label 
                htmlFor="admin-login-password" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-400 accent-sky-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Se souvenir de moi sur ce poste
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="btn-admin-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à l'Espace Gérant</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Highlights Bar */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-2xs">
            <Receipt className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">Facturation</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-2xs">
            <PhoneCall className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">SMS Direct</div>
            <div className="text-[10px] text-slate-700">Suivi temps réel</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-2xs">
            <BarChart3 className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">Revenus</div>
            <div className="text-[10px] text-slate-700">Tableau de bord</div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-700 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Accès gérant chiffré et sécurisé</span>
        </div>

      </div>

    </div>
  );
};
