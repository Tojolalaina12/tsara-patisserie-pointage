import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, addUser, getBoutiques, getAdminPin } from '../utils/storage';
import { ShieldCheck, UserPlus, LogIn, Store, Phone, Lock, User as UserIcon, CheckCircle2, AlertCircle, Cake } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onAdminLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onAdminLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBoutique, setRegBoutique] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  // Boutiques list
  const [boutiqueList, setBoutiqueList] = useState<string[]>([]);

  // Admin PIN Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    const list = getBoutiques();
    setBoutiqueList(list);
    if (list.length > 0) {
      setRegBoutique(list[0]);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password.trim()) {
      setLoginError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }

    const users = getUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setLoginError('Identifiant ou mot de passe incorrect.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');
    setRegSuccessMsg('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword.trim() || !regPhone.trim()) {
      setRegErrorMsg('Tous les champs sont obligatoires.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
      setRegErrorMsg('Ce nom d\'utilisateur est déjà utilisé.');
      return;
    }

    const created = addUser({
      fullName: regFullName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      phone: regPhone.trim().includes('MVola') ? regPhone.trim() : `${regPhone.trim()} (MVola)`,
      boutique: regBoutique || (boutiqueList[0] || 'Tsara Pâtisserie - Main'),
      hourlyRate: 500, // 500 Ar/heure par défaut
      role: 'vendeuse'
    });

    setRegSuccessMsg(`Compte créé avec succès ! Bienvenue chez Tsara Pâtisserie, ${created.fullName}.`);
    setTimeout(() => {
      onLoginSuccess(created);
    }, 1200);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const currentPin = getAdminPin();
    if (adminPinInput.trim() === currentPin) {
      setShowAdminModal(false);
      onAdminLoginSuccess();
    } else {
      setAdminError('Code PIN Admin incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      {/* Mobile App Header Card */}
      <div className="text-center my-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-amber-50 shadow-xl shadow-amber-900/20 mb-3 border border-amber-300/30">
          <Cake className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-amber-950 tracking-tight">Tsara Pâtisserie</h2>
        <p className="text-xs text-amber-800/80 mt-1 font-semibold">Système de Pointage & Gestion du Personnel</p>
      </div>

      {/* Tabs Switch */}
      <div className="flex bg-amber-100/60 p-1 rounded-2xl border border-amber-200/80 mb-5">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setLoginError(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'login'
              ? 'bg-white text-amber-900 shadow-sm border border-amber-200/50'
              : 'text-amber-800/70 hover:text-amber-900'
          }`}
        >
          <LogIn className="w-4 h-4 text-amber-700" />
          Se Connecter
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('register'); setRegErrorMsg(''); setBoutiqueList(getBoutiques()); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'register'
              ? 'bg-white text-amber-900 shadow-sm border border-amber-200/50'
              : 'text-amber-800/70 hover:text-amber-900'
          }`}
        >
          <UserPlus className="w-4 h-4 text-amber-700" />
          Nouveau Compte
        </button>
      </div>

      {/* LOGIN TAB */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-amber-100 shadow-xl shadow-amber-900/5">
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-amber-600" /> Identifiant utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: sarah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrer sur Mon Espace
          </button>
        </form>
      )}

      {/* REGISTER TAB */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5 bg-white p-5 rounded-3xl border border-amber-100 shadow-xl shadow-amber-900/5">
          {regErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{regErrorMsg}</span>
            </div>
          )}

          {regSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-amber-600" /> Nom complet
            </label>
            <input
              type="text"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="Ex: Sarah Rasoanaivo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Identifiant</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="ex: sarah"
                className="w-full px-3 py-2 rounded-xl border border-amber-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Mot de passe</label>
              <input
                type="text"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="motdepasse"
                className="w-full px-3 py-2 rounded-xl border border-amber-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> Téléphone (ex: MVola / Mobile Money)
            </label>
            <input
              type="text"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="Ex: 034 12 345 67 (MVola)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-amber-600" /> Boutique d'affectation
            </label>
            <select
              value={regBoutique}
              onChange={(e) => setRegBoutique(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 bg-white font-medium"
            >
              {boutiqueList.map((b, idx) => (
                <option key={idx} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            Créer mon compte
          </button>
        </form>
      )}

      {/* ADMIN BUTTON OPTION */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => { setShowAdminModal(true); setAdminError(''); setAdminPinInput(''); }}
          className="w-full py-3 px-4 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-2xl text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 group"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          Espace Administrateur (Code PIN)
        </button>
      </div>

      {/* ADMIN PIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-amber-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-300/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-amber-950 text-center">Espace Administration</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-4">
              Veuillez saisir le code confidentiel administrateur.
            </p>

            <form onSubmit={handleAdminAuth} className="space-y-3">
              {adminError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 text-center">Code PIN Administrateur</label>
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="Code PIN"
                  maxLength={10}
                  autoFocus
                  className="w-full text-center tracking-widest text-xl font-bold py-3 px-4 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-950"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-200 font-bold text-xs shadow-md"
                >
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
