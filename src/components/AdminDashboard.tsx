import React, { useState, useEffect } from 'react';
import { User, Shift, ScheduledNotification, Survey, SurveyResponse } from '../types';
import {
  getUsers,
  addUser,
  updateUserSalary,
  getShifts,
  updateShiftByAdmin,
  getScheduledNotifications,
  saveScheduledNotification,
  deleteNotification,
  getSurveys,
  saveSurvey,
  deleteSurvey,
  getSurveyResponses,
  formatDuration,
  getAdminPin,
  saveAdminPin,
  getBoutiques,
  addBoutique,
  deleteBoutique,
  formatCurrency,
  deleteUser,
  toggleShiftPayment
} from '../utils/storage';
import {
  Users,
  Clock,
  Bell,
  ClipboardList,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  Store,
  Send,
  MessageSquare,
  Sparkles,
  Download,
  KeyRound,
  Banknote,
  Edit3,
  Settings,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  onLogoutAdmin: () => void;
  onSetSimulatedTime: (timeStr: string) => void;
  simulatedTimeStr: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogoutAdmin, onSetSimulatedTime, simulatedTimeStr }) => {
  const [adminTab, setAdminTab] = useState<'timeline' | 'users' | 'boutiques' | 'notifications' | 'surveys' | 'settings'>('timeline');

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [boutiquesList, setBoutiquesList] = useState<string[]>([]);
  const [currentAdminPin, setCurrentAdminPin] = useState('1005');

  // Show/Hide passwords toggle
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Filter Date for Timeline
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [userSearch, setUserSearch] = useState('');
  const [selectedBoutiqueFilter, setSelectedBoutiqueFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Add User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBoutique, setNewBoutique] = useState('');
  const [newSalaryRate, setNewSalaryRate] = useState<number>(500);

  // Edit User Salary Rate State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<number>(500);

  // Edit Shift State
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editShiftHours, setEditShiftHours] = useState<number>(0);
  const [editShiftMinutes, setEditShiftMinutes] = useState<number>(0);
  const [editShiftRate, setEditShiftRate] = useState<number>(500);
  const [editShiftNotes, setEditShiftNotes] = useState<string>('');

  // Add Boutique State
  const [newBoutiqueName, setNewBoutiqueName] = useState('');

  // Admin PIN Edit State
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Add Notification Form State
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('Rappel Nettoyage Vitrine');
  const [notifMessage, setNotifMessage] = useState("N'oublie pas de nettoyer la vitrine !");
  const [notifTime, setNotifTime] = useState('13:00');

  // Add Survey Form State
  const [showAddSurvey, setShowAddSurvey] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('Sondage Qualité & Vitrine');
  const [surveyDesc, setSurveyDesc] = useState('Évaluation de la boutique à 13h00');
  const [surveyTime, setSurveyTime] = useState('13:00');
  const [surveyQ1, setSurveyQ1] = useState('Avez-vous nettoyé la vitrine ?');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Reload data
  const loadAdminData = () => {
    setUsers(getUsers());
    setShifts(getShifts());
    setNotifications(getScheduledNotifications());
    setSurveys(getSurveys());
    setSurveyResponses(getSurveyResponses());
    
    const bList = getBoutiques();
    setBoutiquesList(bList);
    if (!newBoutique && bList.length > 0) {
      setNewBoutique(bList[0]);
    }
    setCurrentAdminPin(getAdminPin());
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered shifts for selected date, boutique, user, and payment status
  const filteredShifts = shifts.filter(s => {
    const matchesDate = !selectedDate || s.dateStr === selectedDate;
    const matchesUser = !userSearch ||
      s.userFullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchesBoutique = selectedBoutiqueFilter === 'all' || s.boutique === selectedBoutiqueFilter;
    const matchesPayment = paymentFilter === 'all' ||
      (paymentFilter === 'unpaid' && !s.isPaid) ||
      (paymentFilter === 'paid' && Boolean(s.isPaid));
    return matchesDate && matchesUser && matchesBoutique && matchesPayment;
  });

  // Calculate Salaries for filtered shifts
  const getEarned = (shift: Shift) => {
    if (shift.earnedSalary !== undefined) return shift.earnedSalary;
    const rate = shift.hourlyRate || 500;
    return Math.round(((shift.durationSeconds || 0) / 3600) * rate);
  };

  const totalSalaryFiltered = filteredShifts.reduce((acc, shift) => acc + getEarned(shift), 0);
  const unpaidSalaryFiltered = filteredShifts.filter(s => !s.isPaid).reduce((acc, shift) => acc + getEarned(shift), 0);
  const paidSalaryFiltered = filteredShifts.filter(s => s.isPaid).reduce((acc, shift) => acc + getEarned(shift), 0);

  // Toggle Password View for user
  const toggleShowPassword = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleDeleteUser = (userId: string, fullName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer le compte de l'utilisateur",
      message: `Voulez-vous vraiment supprimer définitivement "${fullName}" de la liste des vendeuses ?`,
      onConfirm: () => {
        deleteUser(userId);
        loadAdminData();
        setConfirmModal(null);
      }
    });
  };

  const handleTogglePayment = (shiftId: string, currentIsPaid: boolean) => {
    const todayStr = simulatedTimeStr || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    toggleShiftPayment(shiftId, !currentIsPaid, todayStr);
    loadAdminData();
  };

  // Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername || !newPassword || !newPhone) return;

    addUser({
      fullName: newFullName.trim(),
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      phone: newPhone.trim().includes('MVola') ? newPhone.trim() : `${newPhone.trim()} (MVola)`,
      boutique: newBoutique || boutiquesList[0] || 'Boutique Analakely',
      role: 'vendeuse',
      hourlyRate: Number(newSalaryRate) || 500
    });

    setNewFullName('');
    setNewUsername('');
    setNewPassword('');
    setNewPhone('');
    setNewSalaryRate(500);
    setShowAddUser(false);
    loadAdminData();
  };

  const handleUpdateUserSalary = (userId: string) => {
    updateUserSalary(userId, Number(editingRate) || 500);
    setEditingUserId(null);
    loadAdminData();
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    const totalSecs = shift.durationSeconds || 0;
    setEditShiftHours(Math.floor(totalSecs / 3600));
    setEditShiftMinutes(Math.floor((totalSecs % 3600) / 60));
    setEditShiftRate(shift.hourlyRate || 500);
    setEditShiftNotes(shift.notes || '');
  };

  const handleSaveShiftEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    const newDurationSecs = (Number(editShiftHours) * 3600) + (Number(editShiftMinutes) * 60);
    updateShiftByAdmin(editingShift.id, newDurationSecs, Number(editShiftRate), editShiftNotes.trim());

    setEditingShift(null);
    loadAdminData();
  };

  const handleAddBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoutiqueName.trim()) return;
    addBoutique(newBoutiqueName.trim());
    setNewBoutiqueName('');
    loadAdminData();
  };

  const handleDeleteBoutique = (name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer la boutique",
      message: `Voulez-vous vraiment supprimer la boutique "${name}" ?`,
      onConfirm: () => {
        deleteBoutique(name);
        loadAdminData();
        setConfirmModal(null);
      }
    });
  };

  const handleSaveAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.length < 3) return;
    saveAdminPin(newPinInput.trim());
    setCurrentAdminPin(newPinInput.trim());
    setNewPinInput('');
    setPinSuccessMsg('Code PIN Administrateur mis à jour avec succès !');
    setTimeout(() => setPinSuccessMsg(''), 3000);
  };

  const handleCreateNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage || !notifTime) return;

    saveScheduledNotification({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      scheduledTime: notifTime,
      isActive: true,
      targetUserId: 'all'
    });

    setShowAddNotif(false);
    loadAdminData();
  };

  const handleDeleteNotif = (id: string) => {
    deleteNotification(id);
    loadAdminData();
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyTitle || !surveyQ1 || !surveyTime) return;

    saveSurvey({
      title: surveyTitle.trim(),
      description: surveyDesc.trim(),
      scheduledTime: surveyTime,
      isActive: true,
      questions: [
        {
          id: 'q1',
          questionText: surveyQ1.trim(),
          type: 'multiple_choice',
          options: ['Oui, vitrine propre', 'En cours de nettoyage', 'Non']
        },
        {
          id: 'q2',
          questionText: 'Remarques additionnelles de la vendeuse :',
          type: 'text'
        }
      ]
    });

    setShowAddSurvey(false);
    loadAdminData();
  };

  const handleDeleteSurvey = (id: string) => {
    deleteSurvey(id);
    loadAdminData();
  };

  const handleApplyPreset13h = () => {
    setNotifTitle('Nettoyage de la Vitrine');
    setNotifMessage("N'oublie pas de nettoyer la vitrine !");
    setNotifTime('13:00');
    setShowAddNotif(true);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4 pb-20">
      {/* ADMIN BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-5 rounded-3xl shadow-xl border border-amber-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shadow-md border border-amber-300">
            {currentAdminPin}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Panneau Administration
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                PIN: {currentAdminPin}
              </span>
            </h2>
            <p className="text-xs text-amber-200/80 mt-0.5">Tsara Pâtisserie • Suivi, Salaires & Boutiques</p>
          </div>
        </div>
        <button
          onClick={onLogoutAdmin}
          className="px-3.5 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold text-xs rounded-xl border border-amber-700/60 transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-amber-100/80 p-1.5 rounded-2xl border border-amber-200">
        <button
          onClick={() => setAdminTab('timeline')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'timeline'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Timeline
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'users'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-700" />
          Personnel ({users.length})
        </button>
        <button
          onClick={() => setAdminTab('boutiques')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'boutiques'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-amber-700" />
          Boutiques ({boutiquesList.length})
        </button>
        <button
          onClick={() => setAdminTab('notifications')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'notifications'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-700" />
          Rappels 13h
        </button>
        <button
          onClick={() => setAdminTab('surveys')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'surveys'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
          Sondages
        </button>
        <button
          onClick={() => setAdminTab('settings')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            adminTab === 'settings'
              ? 'bg-white text-amber-950 shadow-sm border border-amber-200/50'
              : 'text-amber-900/70 hover:text-amber-950'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
          Code PIN
        </button>
      </div>

      {/* TAB 1: DAILY TIMELINE & PAYROLL */}
      {adminTab === 'timeline' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-3xl border border-amber-100 shadow-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Filtrer par Date :</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs font-extrabold text-slate-800 bg-amber-50/50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Boutique :</label>
                <select
                  value={selectedBoutiqueFilter}
                  onChange={(e) => setSelectedBoutiqueFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 bg-amber-50/50"
                >
                  <option value="all">Toutes les boutiques</option>
                  {boutiquesList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Statut Paiement :</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'unpaid' | 'paid')}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 bg-amber-50/50"
                >
                  <option value="all">Tous les salaires</option>
                  <option value="unpaid">⏳ Non Payés uniquement</option>
                  <option value="paid">✓ Payés uniquement</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Recherche Vendeuse :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Nom..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800 bg-amber-50/50"
                  />
                  <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Payroll Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-100">
              <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Pointages</span>
                <span className="block text-lg font-black text-amber-950">{filteredShifts.length} sessions</span>
              </div>
              <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Heures Totales</span>
                <span className="block text-lg font-black text-amber-950 font-mono">
                  {formatDuration(filteredShifts.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0))}
                </span>
              </div>
              <div className="bg-amber-900 text-white p-2.5 rounded-2xl border border-amber-800">
                <span className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1">
                  <Banknote className="w-3 h-3 text-amber-400" /> Non Payé (A Payer)
                </span>
                <span className="block text-lg font-black text-amber-300 font-mono">
                  {formatCurrency(unpaidSalaryFiltered)}
                </span>
              </div>
              <div className="bg-emerald-900 text-white p-2.5 rounded-2xl border border-emerald-800">
                <span className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Déjà Payé
                </span>
                <span className="block text-lg font-black text-emerald-300 font-mono">
                  {formatCurrency(paidSalaryFiltered)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline List */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-amber-950 text-sm px-1">Ligne du Temps & Calcul de Salaire</h3>

            {filteredShifts.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-amber-100 text-amber-900/50">
                <Calendar className="w-10 h-10 mx-auto text-amber-300 mb-2" />
                <p className="text-xs font-semibold">Aucun pointage trouvé pour ces filtres.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredShifts.map((shift) => {
                  const shiftRate = shift.hourlyRate || 500;
                  const shiftEarned = shift.earnedSalary !== undefined
                    ? shift.earnedSalary
                    : Math.round(((shift.durationSeconds || 0) / 3600) * shiftRate);

                  return (
                    <div
                      key={shift.id}
                      className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-amber-950">{shift.userFullName}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              @{shift.username}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            <Store className="w-3.5 h-3.5 text-amber-600 inline" /> {shift.boutique}
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-xs font-black font-mono text-amber-950 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                            {shift.durationSeconds ? formatDuration(shift.durationSeconds) : 'En cours'}
                          </span>
                          <span className="text-xs font-black text-emerald-700 font-mono">
                            {formatCurrency(shiftEarned)} ({shiftRate} Ar/h)
                          </span>
                        </div>
                      </div>

                      {/* Timeline Graphical Bar */}
                      <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Arrivée: <strong>{shift.startFormatted}</strong></span>
                        </div>

                        <div className="flex-1 mx-3 h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-600 rounded-full w-full"></div>
                        </div>

                        <div className="flex items-center gap-1.5 text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span>Départ: <strong>{shift.endFormatted || 'En cours'}</strong></span>
                        </div>
                      </div>

                      {shift.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-amber-50/80 p-2 rounded-xl border border-amber-200/50">
                          📝 Remarque: "{shift.notes}"
                        </p>
                      )}

                      {/* Admin Action: Pay Salary & Edit Shift */}
                      <div className="pt-2 border-t border-amber-100/80 flex items-center justify-between gap-2">
                        <div>
                          {shift.isPaid ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                PAYÉ le {shift.paidAtDate || 'Aujourd\'hui'}
                              </span>
                              <button
                                onClick={() => handleTogglePayment(shift.id, true)}
                                className="text-[10px] text-slate-500 underline hover:text-slate-800 font-medium px-1 cursor-pointer"
                                title="Annuler le statut payé"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleTogglePayment(shift.id, false)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <Banknote className="w-4 h-4" />
                              Payer ({formatCurrency(shiftEarned)})
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenEditShift(shift)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Modifier
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT SHIFT BY ADMIN */}
      {editingShift && (
        <div className="fixed inset-0 z-50 bg-amber-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveShiftEdit} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <h3 className="font-extrabold text-sm text-amber-950">Ajustement du Pointage</h3>
              <button type="button" onClick={() => setEditingShift(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Vendeuse : <strong className="text-amber-950">{editingShift.userFullName}</strong> ({editingShift.dateStr})
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Heures (h)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={editShiftHours}
                  onChange={(e) => setEditShiftHours(Number(e.target.value))}
                  className="w-full p-2 border border-amber-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Minutes (m)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editShiftMinutes}
                  onChange={(e) => setEditShiftMinutes(Number(e.target.value))}
                  className="w-full p-2 border border-amber-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Taux Horaire (Ar/heure)</label>
              <input
                type="number"
                step="50"
                value={editShiftRate}
                onChange={(e) => setEditShiftRate(Number(e.target.value))}
                className="w-full p-2 border border-amber-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900/80 mb-1">Remarques Administrateur</label>
              <input
                type="text"
                value={editShiftNotes}
                onChange={(e) => setEditShiftNotes(e.target.value)}
                placeholder="Ex: Rectification oubli du pointage"
                className="w-full p-2 border border-amber-200 rounded-xl text-xs"
              />
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl text-center font-mono font-black text-emerald-800 text-xs">
              Nouveau salaire calculé : {formatCurrency(Math.round((((editShiftHours * 3600) + (editShiftMinutes * 60)) / 3600) * editShiftRate))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: UTILISATEURS & SALAIRES */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">Gestion du Personnel & Salaires</h3>
              <p className="text-xs text-slate-500">Définissez les taux horaires et consultez les accès</p>
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Nouvelle Vendeuse
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <form onSubmit={handleCreateUser} className="bg-white p-4 rounded-3xl border border-amber-200 shadow-md space-y-3">
              <h4 className="font-extrabold text-xs text-amber-900 uppercase">Créer un Compte Vendeuse</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Marie Razafy"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Identifiant (ID)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="marie"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mot de passe (MDP)</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="pass123"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Téléphone (MVola)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="034 56 789 01"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Boutique d'affectation</label>
                  <select
                    value={newBoutique}
                    onChange={(e) => setNewBoutique(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    {boutiquesList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Salaire Horaire (Ar/heure)</label>
                  <input
                    type="number"
                    step="50"
                    value={newSalaryRate}
                    onChange={(e) => setNewSalaryRate(Number(e.target.value))}
                    placeholder="500"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-md hover:bg-amber-900"
                >
                  Enregistrer Vendeuse
                </button>
              </div>
            </form>
          )}

          {/* Users List Cards */}
          <div className="space-y-2.5">
            {users.map((u) => {
              const rate = u.hourlyRate || 500;
              const isEditing = editingUserId === u.id;

              return (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-amber-950">{u.fullName}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                          ID: {u.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                        <Store className="w-3.5 h-3.5 text-amber-600 inline" /> {u.boutique}
                      </p>
                    </div>

                    {/* Hourly Salary Badge */}
                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
                          <input
                            type="number"
                            value={editingRate}
                            onChange={(e) => setEditingRate(Number(e.target.value))}
                            className="w-20 p-1 text-xs font-mono font-bold border rounded-lg bg-white"
                          />
                          <button
                            onClick={() => handleUpdateUserSalary(u.id)}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingUserId(u.id); setEditingRate(rate); }}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold font-mono hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          {formatCurrency(rate)}/h <Edit3 className="w-3 h-3 text-emerald-600 ml-0.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100 text-xs">
                    <div className="bg-amber-50/50 p-2.5 rounded-2xl border border-amber-100">
                      <span className="text-[10px] text-amber-900/60 font-bold uppercase block">Identifiant :</span>
                      <span className="font-bold text-slate-800">{u.username}</span>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-2xl border border-amber-100 relative">
                      <span className="text-[10px] text-amber-900/60 font-bold uppercase block">Mot de passe :</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-900">
                          {showPasswords[u.id] ? u.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleShowPassword(u.id)}
                          className="text-amber-700 hover:text-amber-950 p-0.5"
                        >
                          {showPasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Téléphone / MVola :</span>
                      <strong className="font-mono">{u.phone}</strong>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 rounded-xl transition-colors flex items-center gap-1 font-bold text-[11px] bg-rose-50 border border-rose-200 cursor-pointer"
                      title="Supprimer cet utilisateur"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BOUTIQUES D'AFFECTATION */}
      {adminTab === 'boutiques' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-amber-950 text-sm">Gestion des Boutiques Tsara Pâtisserie</h3>
            <p className="text-xs text-slate-500">
              Ces boutiques apparaissent dans la liste déroulante du formulaire d'inscription des nouvelles vendeuses.
            </p>

            <form onSubmit={handleAddBoutique} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newBoutiqueName}
                onChange={(e) => setNewBoutiqueName(e.target.value)}
                placeholder="Ex: Tsara Pâtisserie - Ivato"
                className="flex-1 px-3 py-2 border border-amber-200 rounded-xl text-xs font-medium"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs text-amber-900 px-1">Liste des Boutiques Enregistrées</h4>
            {boutiquesList.map(boutiqueName => (
              <div
                key={boutiqueName}
                className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span className="font-extrabold text-xs text-amber-950">{boutiqueName}</span>
                </div>
                <button
                  onClick={() => handleDeleteBoutique(boutiqueName)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Supprimer la boutique"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROGRAMMATION DES RAPPELS (13h00) */}
      {adminTab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4.5 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-200 animate-bounce" />
              <h3 className="font-black text-sm text-white">Programmation des Textes Automatiques</h3>
            </div>
            <p className="text-xs text-amber-100">
              Configurez des rappels pour l'équipe (ex: "À 13h00 : N'oublie pas de nettoyer la vitrine").
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={handleApplyPreset13h}
                className="px-3 py-1.5 bg-white text-amber-950 font-bold text-xs rounded-xl shadow-md hover:bg-amber-100 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Installer Rappel 13h00 (Vitrine)
              </button>
              <button
                onClick={() => setShowAddNotif(!showAddNotif)}
                className="px-3 py-1.5 bg-amber-950 text-amber-300 font-bold text-xs rounded-xl shadow-md hover:bg-amber-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Créer
              </button>
            </div>
          </div>

          {/* Form to add notification */}
          {showAddNotif && (
            <form onSubmit={handleCreateNotif} className="bg-white p-4 rounded-3xl border border-amber-200 shadow-md space-y-3">
              <h4 className="font-extrabold text-xs text-amber-900 uppercase">Nouveau Rappel Automatique</h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Titre de la notification</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Ex: Nettoyage Vitrine"
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Heure de déclenchement (ex: 13:00)</label>
                <input
                  type="time"
                  value={notifTime}
                  onChange={(e) => setNotifTime(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Message affiché à la vendeuse</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="N'oublie pas de nettoyer la vitrine..."
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddNotif(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md hover:bg-amber-700"
                >
                  Programmer Le Rappel
                </button>
              </div>
            </form>
          )}

          {/* Active Notifications List */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-amber-950 px-1">Notifications actives ({notifications.length})</h4>

            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm flex items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      ⏰ {n.scheduledTime}
                    </span>
                    <h5 className="font-extrabold text-sm text-amber-950">{n.title}</h5>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold italic bg-amber-50/50 p-2 rounded-xl border border-amber-100/60">
                    "{n.message}"
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteNotif(n.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ONGLET SONDAGES */}
      {adminTab === 'surveys' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">Onglet Sondages</h3>
              <p className="text-xs text-slate-500">Programmez des questionnaires et recevez les réponses</p>
            </div>
            <button
              onClick={() => setShowAddSurvey(!showAddSurvey)}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Nouveau Sondage
            </button>
          </div>

          {/* Add Survey Form */}
          {showAddSurvey && (
            <form onSubmit={handleCreateSurvey} className="bg-white p-4 rounded-3xl border border-amber-200 shadow-md space-y-3">
              <h4 className="font-extrabold text-xs text-amber-900 uppercase">Programmer un Sondage</h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Titre du Sondage</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="Sondage de 13h00"
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={surveyDesc}
                    onChange={(e) => setSurveyDesc(e.target.value)}
                    placeholder="Bref descriptif"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Heure de diffusion</label>
                  <input
                    type="time"
                    value={surveyTime}
                    onChange={(e) => setSurveyTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Question Principale</label>
                <input
                  type="text"
                  value={surveyQ1}
                  onChange={(e) => setSurveyQ1(e.target.value)}
                  placeholder="Ex: Avez-vous nettoyé la vitrine ?"
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSurvey(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-md hover:bg-amber-900"
                >
                  Publier Sondage
                </button>
              </div>
            </form>
          )}

          {/* Surveys List & Responses */}
          <div className="space-y-3">
            {surveys.map((srv) => {
              const responses = surveyResponses.filter(r => r.surveyId === srv.id);
              return (
                <div key={srv.id} className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Diffusion à {srv.scheduledTime}
                      </span>
                      <h4 className="font-extrabold text-sm text-amber-950 mt-1">{srv.title}</h4>
                      <p className="text-xs text-slate-500">{srv.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteSurvey(srv.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Responses Table */}
                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 space-y-2">
                    <h5 className="font-bold text-xs text-amber-950 flex items-center justify-between">
                      <span>Réponses reçues ({responses.length})</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold">Synchro Live</span>
                    </h5>

                    {responses.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">En attente de réponses des vendeuses...</p>
                    ) : (
                      <div className="space-y-2">
                        {responses.map((resp) => (
                          <div key={resp.id} className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                            <div className="flex justify-between text-slate-800 font-bold">
                              <span>👤 {resp.userFullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{resp.submittedAt}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 space-y-0.5 pl-2 border-l-2 border-amber-500">
                              {Object.entries(resp.answers).map(([qKey, ans]) => (
                                <p key={qKey}>• {String(ans)}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: PARAMÈTRES / SÉCURITÉ ADMIN PIN */}
      {adminTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-4">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-800">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-amber-950 text-base">Sécurisation du Mode Admin</h3>
                <p className="text-xs text-slate-500">Modifier le code secret d'accès administrateur</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Code PIN actuel :</span>
              <span className="font-mono font-black text-amber-950 text-base bg-white px-3 py-1 rounded-xl border border-amber-300">
                {currentAdminPin}
              </span>
            </div>

            {pinSuccessMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {pinSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveAdminPin} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">Nouveau Code PIN Admin :</label>
                <input
                  type="text"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Ex: 2025 ou 1005"
                  className="w-full p-3 border border-amber-200 rounded-2xl text-sm font-mono font-bold text-amber-950"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
              >
                Mettre à jour le Code PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-amber-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-extrabold text-amber-950 text-base">{confirmModal.title}</h3>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmModal.onConfirm()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-colors cursor-pointer"
              >
                Confirmer Suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
