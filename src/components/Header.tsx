import React from 'react';
import { User } from '../types';
import { LogOut, ShieldCheck, Clock, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  isMobileFrame: boolean;
  toggleFrameMode: () => void;
  currentTimeStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdminLoggedIn,
  onLogout,
  isMobileFrame,
  toggleFrameMode,
  currentTimeStr
}) => {
  return (
    <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white shadow-md sticky top-0 z-30">
      {/* Top Status Bar Decoration for Mobile aesthetic */}
      <div className="bg-black/30 px-4 py-1 text-[11px] font-mono flex justify-between items-center text-amber-100">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          TSARA PÂTISSERIE • EN LIGNE
        </span>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-semibold text-amber-200 tracking-wider">{currentTimeStr}</span>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center shadow-lg font-black text-xl border border-amber-300/40">
            🥐
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none text-white flex items-center gap-1.5">
              Tsara Pâtisserie
              <span className="text-[10px] bg-amber-400/30 text-amber-200 border border-amber-300/40 px-1.5 py-0.5 rounded-full font-medium">
                Pointage
              </span>
            </h1>
            <p className="text-xs text-amber-200/90 mt-0.5 font-medium">
              {isAdminLoggedIn ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline" /> Admin (PIN Sécurisé)
                </span>
              ) : currentUser ? (
                <span>{currentUser.fullName} • {currentUser.boutique}</span>
              ) : (
                'Système de Pointage Arrivée/Départ'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Screen Mode (Mobile Frame vs Full Screen) */}
          <button
            onClick={toggleFrameMode}
            title={isMobileFrame ? "Passer en Mode Plein Écran" : "Passer en Vue Smartphone"}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors border border-white/15 flex items-center gap-1"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-indigo-200" />
                <span className="hidden sm:inline text-xs font-medium">Plein écran</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline text-xs font-medium">Cadre Mobile</span>
              </>
            )}
          </button>

          {(currentUser || isAdminLoggedIn) && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-medium transition-colors flex items-center gap-1"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
