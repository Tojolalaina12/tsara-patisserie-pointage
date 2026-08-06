import React, { useState, useEffect } from 'react';
import { User, Shift, ScheduledNotification, Survey, SurveyResponse } from '../types';
import {
  getActiveShift,
  startActiveShift,
  stopActiveShift,
  getShifts,
  formatDuration,
  formatCurrency,
  getScheduledNotifications,
  getSurveys,
  getSurveyResponses,
  saveSurveyResponse,
  dismissNotif,
  getDismissedNotifs
} from '../utils/storage';
import { Play, Square, Clock, Calendar, AlertCircle, BellRing, ClipboardCheck, History, Store, CheckCircle, Phone, MessageSquare, Banknote, Cake } from 'lucide-react';
import { SurveyModal } from './SurveyModal';

interface VendeuseDashboardProps {
  currentUser: User;
  simulatedTimeStr: string; // e.g. "13:00"
}

export const VendeuseDashboard: React.FC<VendeuseDashboardProps> = ({ currentUser, simulatedTimeStr }) => {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [activeTab, setActiveTab] = useState<'clock' | 'history' | 'surveys'>('clock');

  // End Shift Modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [shiftNotes, setShiftNotes] = useState('');

  // Notifications & Surveys
  const [pendingNotifs, setPendingNotifs] = useState<ScheduledNotification[]>([]);
  const [activeSurveyToTake, setActiveSurveyToTake] = useState<Survey | null>(null);
  const [userResponses, setUserResponses] = useState<SurveyResponse[]>([]);

  const userRate = currentUser.hourlyRate || 500;

  // Reload local shift data
  const refreshData = () => {
    const shift = getActiveShift(currentUser.id);
    setActiveShift(shift);

    const allShifts = getShifts().filter(s => s.userId === currentUser.id);
    setShiftHistory(allShifts);

    const responses = getSurveyResponses().filter(r => r.userId === currentUser.id);
    setUserResponses(responses);
  };

  useEffect(() => {
    refreshData();
  }, [currentUser.id]);

  // Timer Ticker for Active Shift
  useEffect(() => {
    let interval: any = null;
    if (activeShift) {
      const calculateSeconds = () => {
        const diff = Math.floor((Date.now() - activeShift.startTime) / 1000);
        setElapsedSeconds(diff > 0 ? diff : 0);
      };
      calculateSeconds();
      interval = setInterval(calculateSeconds, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift]);

  // Check scheduled notifications matching simulated or real time (e.g., "13:00")
  useEffect(() => {
    const allNotifs = getScheduledNotifications();
    const dismissed = getDismissedNotifs();

    const matching = allNotifs.filter(n => {
      if (!n.isActive) return false;
      if (dismissed.includes(n.id)) return false;
      if (n.targetUserId && n.targetUserId !== 'all' && n.targetUserId !== currentUser.id) return false;

      const [notifHour, notifMin] = n.scheduledTime.split(':').map(Number);
      const [curHour, curMin] = simulatedTimeStr.split(':').map(Number);
      
      return (curHour > notifHour) || (curHour === notifHour && curMin >= notifMin);
    });

    setPendingNotifs(matching);
  }, [simulatedTimeStr, currentUser.id]);

  // Check pending surveys
  const surveys = getSurveys().filter(s => s.isActive);
  const pendingSurveys = surveys.filter(s => !userResponses.some(r => r.surveyId === s.id));

  // Handlers
  const handleStartShift = () => {
    const shift = startActiveShift(currentUser);
    setActiveShift(shift);
    refreshData();
  };

  const handleConfirmFinishShift = () => {
    stopActiveShift(currentUser.id, shiftNotes.trim());
    setActiveShift(null);
    setShowFinishModal(false);
    setShiftNotes('');
    refreshData();
  };

  const handleDismissNotif = (notifId: string) => {
    dismissNotif(notifId);
    setPendingNotifs(prev => prev.filter(n => n.id !== notifId));
  };

  const handleSurveySubmit = (surveyId: string, answers: Record<string, string | number>) => {
    saveSurveyResponse({
      surveyId,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      answers
    });
    setActiveSurveyToTake(null);
    refreshData();
  };

  // Calculate live salary for current shift
  const liveEarnedSalary = (elapsedSeconds / 3600) * userRate;

  // Calculate total earnings in history
  const totalEarnedHistory = shiftHistory.reduce((acc, s) => acc + (s.earnedSalary || Math.round(((s.durationSeconds || 0) / 3600) * (s.hourlyRate || userRate))), 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-20">
      {/* USER PROFILE CARD */}
      <div className="bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4.5 rounded-3xl shadow-xl border border-amber-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 font-black flex items-center justify-center text-xl shadow-md border border-amber-300">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-base tracking-tight text-white">{currentUser.fullName}</h2>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                Personnel
              </span>
            </div>
            <p className="text-xs text-amber-200/90 flex items-center gap-1 mt-0.5 font-medium">
              <Store className="w-3 h-3 text-amber-300 inline shrink-0" />
              {currentUser.boutique}
            </p>
            <p className="text-[11px] text-amber-300/90 flex items-center gap-1 mt-0.5 font-mono">
              <Phone className="w-3 h-3 text-emerald-400 inline shrink-0" />
              Tél / MVola : <strong className="text-emerald-300 font-bold">{currentUser.phone}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* SCHEDULED NOTIFICATIONS BANNER (e.g. 13h00 Nettoyage de Vitrine) */}
      {pendingNotifs.length > 0 && (
        <div className="space-y-2">
          {pendingNotifs.map(notif => (
            <div
              key={notif.id}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 rounded-3xl shadow-lg shadow-amber-900/20 border border-amber-400/40 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl text-white mt-0.5">
                  <BellRing className="w-5 h-5 text-amber-100 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider text-amber-100">
                      Rappel {notif.scheduledTime}
                    </span>
                    <span className="text-xs font-black text-amber-100">{notif.title}</span>
                  </div>
                  <p className="text-sm font-extrabold text-white mt-1 leading-snug">
                    "{notif.message}"
                  </p>
                  <p className="text-[11px] text-amber-100/90 mt-1">
                    Notification programmée par l'administration
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismissNotif(notif.id)}
                className="px-3 py-1.5 bg-white text-amber-950 hover:bg-amber-100 font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
              >
                Compris 👍
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PENDING SURVEY ALERT BANNER */}
      {pendingSurveys.length > 0 && (
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-4 rounded-3xl shadow-lg border border-amber-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <ClipboardCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sondage requis ({pendingSurveys.length})
              </span>
              <h4 className="font-bold text-xs text-white mt-1">{pendingSurveys[0].title}</h4>
            </div>
          </div>
          <button
            onClick={() => setActiveSurveyToTake(pendingSurveys[0])}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Répondre
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex bg-amber-100/70 p-1 rounded-2xl border border-amber-200">
        <button
          onClick={() => setActiveTab('clock')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'clock'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-800/80 hover:text-amber-950'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-700" />
          Pointage (GO)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-800/80 hover:text-amber-950'
          }`}
        >
          <History className="w-4 h-4 text-amber-700" />
          Historique ({shiftHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('surveys')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'surveys'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-800/80 hover:text-amber-950'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-amber-700" />
          Sondages
          {pendingSurveys.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-2"></span>
          )}
        </button>
      </div>

      {/* TAB 1: CLOCK IN / CLOCK OUT MAIN PAGE */}
      {activeTab === 'clock' && (
        <div className="space-y-4">
          {/* MAIN CLOCK CARD */}
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xl shadow-amber-900/5 text-center space-y-5">
            
            {/* Status Badge */}
            <div>
              {activeShift ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  EN SERVICE (Pointe à {activeShift.startFormatted})
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  HORS SERVICE (En attente de pointage)
                </div>
              )}
            </div>

            {/* Live Counter Display */}
            <div className="bg-amber-950 text-white p-6 rounded-3xl shadow-inner border border-amber-900 space-y-2">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-widest block">
                {activeShift ? 'Temps de travail en cours' : 'Chronomètre Prêt'}
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-amber-300 tracking-wider">
                {activeShift ? formatDuration(elapsedSeconds) : '00h 00m 00s'}
              </div>
              
              {/* Salary Accumulator */}
              {activeShift && (
                <div className="pt-2 border-t border-amber-800/80 flex items-center justify-between text-xs px-2">
                  <span className="text-amber-200/80 font-medium flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Gains accumulés :
                  </span>
                  <span className="font-extrabold text-emerald-300 text-sm font-mono">
                    {formatCurrency(liveEarnedSalary)}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-amber-200/60 pt-1">
                {activeShift
                  ? `Commencé le ${activeShift.dateStr} à ${activeShift.startFormatted}`
                  : `Taux horaire configuré : ${formatCurrency(userRate)}/heure`}
              </p>
            </div>

            {/* GIANT GO / FIN BUTTON */}
            <div className="pt-2 flex justify-center">
              {!activeShift ? (
                <button
                  onClick={handleStartShift}
                  className="w-44 h-44 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-3xl shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-emerald-200/50 group cursor-pointer"
                >
                  <Play className="w-12 h-12 text-white fill-white mb-1 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider">GO</span>
                  <span className="text-[10px] font-semibold text-emerald-100 uppercase mt-0.5">Arrivée</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowFinishModal(true)}
                  className="w-44 h-44 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 hover:from-rose-700 hover:to-red-700 text-white font-black text-3xl shadow-2xl shadow-rose-600/40 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-rose-200/50 group cursor-pointer"
                >
                  <Square className="w-10 h-10 text-white fill-white mb-1 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider">FIN</span>
                  <span className="text-[10px] font-semibold text-rose-100 uppercase mt-0.5">Départ</span>
                </button>
              )}
            </div>

            <p className="text-xs text-amber-900/70 italic max-w-xs mx-auto font-medium">
              {activeShift
                ? 'L\'application tourne sans arrêt même fermée jusqu\'à ce que vous fassiez "FIN".'
                : 'Appuyez sur GO à votre arrivée en pâtisserie pour commencer votre journée.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: MY SHIFT HISTORY & EARNINGS */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* Summary Box */}
          <div className="bg-amber-900 text-white p-4 rounded-2xl border border-amber-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-amber-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300">Total Salaire Gagné</span>
                <div className="text-xl font-black text-emerald-300 font-mono">
                  {formatCurrency(totalEarnedHistory)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-300">Sessions</span>
                <div className="text-sm font-bold text-white">
                  {shiftHistory.length} jours
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-amber-950/80 p-2 rounded-xl border border-amber-800">
                <span className="text-[10px] text-amber-300/80 uppercase font-bold block">À Recevoir (Non Payé)</span>
                <span className="text-sm font-extrabold text-amber-300 font-mono">
                  {formatCurrency(shiftHistory.filter(s => !s.isPaid).reduce((acc, s) => acc + (s.earnedSalary || Math.round(((s.durationSeconds || 0) / 3600) * (s.hourlyRate || userRate))), 0))}
                </span>
              </div>
              <div className="bg-emerald-950/80 p-2 rounded-xl border border-emerald-800">
                <span className="text-[10px] text-emerald-300/80 uppercase font-bold block">Déjà Payé</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(shiftHistory.filter(s => s.isPaid).reduce((acc, s) => acc + (s.earnedSalary || Math.round(((s.durationSeconds || 0) / 3600) * (s.hourlyRate || userRate))), 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-1 pt-1">
            <h3 className="font-extrabold text-amber-950 text-sm">Historique de vos pointages</h3>
          </div>

          {shiftHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-amber-100 text-amber-900/50">
              <Clock className="w-10 h-10 mx-auto text-amber-300 mb-2" />
              <p className="text-xs font-semibold">Aucun pointage enregistré pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shiftHistory.map((shift) => {
                const shiftRate = shift.hourlyRate || userRate;
                const earned = shift.earnedSalary || Math.round(((shift.durationSeconds || 0) / 3600) * shiftRate);
                return (
                  <div
                    key={shift.id}
                    className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span className="font-extrabold text-xs text-amber-950">{shift.dateStr}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-semibold">
                          {shift.boutique}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Arrivée : <strong className="text-slate-800">{shift.startFormatted}</strong>
                        {shift.endFormatted && (
                          <> • Départ : <strong className="text-slate-800">{shift.endFormatted}</strong></>
                        )}
                      </p>
                      {shift.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/60 mt-1">
                          "{shift.notes}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-sm text-amber-900 font-mono">
                        {shift.durationSeconds ? formatDuration(shift.durationSeconds) : 'En cours'}
                      </span>
                      <span className="block text-xs font-extrabold text-emerald-600 font-mono mt-0.5">
                        +{formatCurrency(earned)}
                      </span>
                      {shift.isPaid ? (
                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                          ✓ Payé le {shift.paidAtDate || 'Récent'}
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mt-1">
                          ⏳ Non Payé
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SURVEYS LIST */}
      {activeTab === 'surveys' && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-amber-950 text-sm px-1">Sondages & Enquêtes programmés</h3>

          {surveys.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-amber-100 text-amber-900/50">
              <ClipboardCheck className="w-10 h-10 mx-auto text-amber-300 mb-2" />
              <p className="text-xs font-semibold">Aucun sondage disponible actuellement.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {surveys.map((survey) => {
                const isAnswered = userResponses.some(r => r.surveyId === survey.id);
                return (
                  <div
                    key={survey.id}
                    className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Programmé à {survey.scheduledTime}
                        </span>
                        <h4 className="font-extrabold text-sm text-amber-950 mt-1">{survey.title}</h4>
                        <p className="text-xs text-slate-500">{survey.description}</p>
                      </div>
                      {isAnswered ? (
                        <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Répondu
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveSurveyToTake(survey)}
                          className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Répondre
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FINISH SHIFT MODAL */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-amber-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Square className="w-6 h-6 fill-rose-600" />
            </div>
            <h3 className="text-lg font-black text-amber-950 text-center">Pointage de Départ (FIN)</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-2">
              Voulez-vous terminer votre journée chez Tsara Pâtisserie ?
            </p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1 mb-4">
              <span className="text-[10px] text-amber-800 uppercase font-bold">Durée travaillée : {formatDuration(elapsedSeconds)}</span>
              <div className="text-lg font-black text-emerald-700 font-mono">
                Salaire gagné : {formatCurrency(liveEarnedSalary)}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Remarques / Ventes du jour (optionnel) :
                </label>
                <textarea
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Ex: Vitrine nettoyée à 13h, bons retours sur les tartes..."
                  rows={3}
                  className="w-full p-3 text-xs border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Continuer
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinishShift}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  Confirmer FIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAKE SURVEY MODAL */}
      {activeSurveyToTake && (
        <SurveyModal
          survey={activeSurveyToTake}
          onClose={() => setActiveSurveyToTake(null)}
          onSubmit={handleSurveySubmit}
        />
      )}
    </div>
  );
};
