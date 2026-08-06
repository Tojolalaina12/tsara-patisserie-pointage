import { User, Shift, ScheduledNotification, Survey, SurveyResponse } from '../types';
import { INITIAL_USERS, INITIAL_SHIFTS, INITIAL_NOTIFICATIONS, INITIAL_SURVEYS, INITIAL_BOUTIQUES } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'pointage_app_users_v2',
  SHIFTS: 'pointage_app_shifts_v2',
  ACTIVE_SHIFTS: 'pointage_app_active_shifts_v2',
  NOTIFICATIONS: 'pointage_app_notifs_v2',
  SURVEYS: 'pointage_app_surveys_v2',
  SURVEY_RESPONSES: 'pointage_app_responses_v2',
  CURRENT_USER: 'pointage_app_current_user_v2',
  DISMISSED_NOTIFS: 'pointage_app_dismissed_notifs_v2',
  BOUTIQUES: 'pointage_app_boutiques_v2',
  ADMIN_PIN: 'pointage_app_admin_pin_v2',
};

// Initialize default storage if empty
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SURVEYS)) {
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(INITIAL_SURVEYS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFTS)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFTS, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SURVEY_RESPONSES)) {
    localStorage.setItem(STORAGE_KEYS.SURVEY_RESPONSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOUTIQUES)) {
    localStorage.setItem(STORAGE_KEYS.BOUTIQUES, JSON.stringify(INITIAL_BOUTIQUES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '1005');
  }
};

// Admin PIN Security
export const getAdminPin = (): string => {
  initStorage();
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1005';
};

export const saveAdminPin = (newPin: string): void => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
};

// Boutiques / Shops Management
export const getBoutiques = (): string[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOUTIQUES) || '[]');
  } catch {
    return INITIAL_BOUTIQUES;
  }
};

export const addBoutique = (name: string): string[] => {
  const list = getBoutiques();
  const trimmed = name.trim();
  if (trimmed && !list.includes(trimmed)) {
    list.push(trimmed);
    localStorage.setItem(STORAGE_KEYS.BOUTIQUES, JSON.stringify(list));
  }
  return list;
};

export const deleteBoutique = (name: string): string[] => {
  const target = name.trim().toLowerCase();
  const list = getBoutiques().filter(b => b.trim().toLowerCase() !== target);
  localStorage.setItem(STORAGE_KEYS.BOUTIQUES, JSON.stringify(list));
  return list;
};

// Users
export const getUsers = (): User[] => {
  initStorage();
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    // Ensure default hourlyRate is present
    return list.map((u: User) => ({
      ...u,
      hourlyRate: u.hourlyRate || 500
    }));
  } catch {
    return INITIAL_USERS;
  }
};

export const addUser = (newUser: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const created: User = {
    ...newUser,
    hourlyRate: newUser.hourlyRate || 500,
    id: `usr_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  users.push(created);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return created;
};

export const updateUserHourlyRate = (userId: string, newRate: number): User[] => {
  const users = getUsers().map(u => {
    if (u.id === userId) {
      return { ...u, hourlyRate: newRate };
    }
    return u;
  });
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users;
};

export const updateUserSalary = updateUserHourlyRate;

export const deleteUser = (userId: string): User[] => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users;
};

// Current Session
export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return {
      ...user,
      hourlyRate: user.hourlyRate || 500
    };
  } catch {
    return null;
  }
};

export const setCurrentUserSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Active Shift (Crucial requirement: App running in background until FIN & logout)
export const getActiveShift = (userId: string): Shift | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFTS);
    const map = raw ? JSON.parse(raw) : {};
    return map[userId] || null;
  } catch {
    return null;
  }
};

export const startActiveShift = (user: User): Shift => {
  const now = Date.now();
  const dateObj = new Date(now);
  const dateStr = dateObj.toISOString().split('T')[0];
  const startFormatted = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const newShift: Shift = {
    id: `shf_${now}`,
    userId: user.id,
    username: user.username,
    userFullName: user.fullName,
    boutique: user.boutique,
    hourlyRate: user.hourlyRate || 500,
    startTime: now,
    status: 'ACTIVE',
    dateStr,
    startFormatted
  };

  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFTS);
  const map = raw ? JSON.parse(raw) : {};
  map[user.id] = newShift;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFTS, JSON.stringify(map));
  return newShift;
};

export const stopActiveShift = (userId: string, notes: string = ''): Shift | null => {
  const activeShift = getActiveShift(userId);
  if (!activeShift) return null;

  const now = Date.now();
  const dateObj = new Date(now);
  const endFormatted = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const durationSeconds = Math.max(1, Math.floor((now - activeShift.startTime) / 1000));
  const hourlyRate = activeShift.hourlyRate || 500;
  const earnedSalary = Math.round((durationSeconds / 3600) * hourlyRate);

  const completedShift: Shift = {
    ...activeShift,
    endTime: now,
    durationSeconds,
    hourlyRate,
    earnedSalary,
    status: 'COMPLETED',
    endFormatted,
    notes
  };

  // 1. Clear active shift map for this user
  const rawMap = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFTS);
  const map = rawMap ? JSON.parse(rawMap) : {};
  delete map[userId];
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFTS, JSON.stringify(map));

  // 2. Add to shift history
  const shifts = getShifts();
  shifts.unshift(completedShift);
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));

  return completedShift;
};

// Shift History & Admin Edit
export const getShifts = (): Shift[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS) || '[]');
  } catch {
    return INITIAL_SHIFTS;
  }
};

export const updateShiftByAdmin = (
  shiftOrId: Shift | string,
  durationSeconds?: number,
  hourlyRate?: number,
  notes?: string
): Shift[] => {
  const shifts = getShifts().map(s => {
    const isTarget = typeof shiftOrId === 'string' ? s.id === shiftOrId : s.id === shiftOrId.id;
    if (isTarget) {
      if (typeof shiftOrId === 'object') {
        const rate = shiftOrId.hourlyRate || 500;
        const duration = shiftOrId.durationSeconds || 0;
        const earned = Math.round((duration / 3600) * rate);
        return {
          ...shiftOrId,
          hourlyRate: rate,
          earnedSalary: earned
        };
      } else {
        const rate = hourlyRate ?? (s.hourlyRate || 500);
        const duration = durationSeconds ?? (s.durationSeconds || 0);
        const earned = Math.round((duration / 3600) * rate);
        return {
          ...s,
          durationSeconds: duration,
          hourlyRate: rate,
          earnedSalary: earned,
          notes: notes !== undefined ? notes : s.notes
        };
      }
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  return shifts;
};

export const toggleShiftPayment = (shiftId: string, isPaid: boolean, paidDateStr?: string): Shift[] => {
  const dateToSave = paidDateStr || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const shifts = getShifts().map(s => {
    if (s.id === shiftId) {
      return {
        ...s,
        isPaid,
        paidAtDate: isPaid ? dateToSave : undefined
      };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  return shifts;
};

// Notifications
export const getScheduledNotifications = (): ScheduledNotification[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveScheduledNotification = (notif: Omit<ScheduledNotification, 'id' | 'createdAt'>): ScheduledNotification => {
  const notifs = getScheduledNotifications();
  const created: ScheduledNotification = {
    ...notif,
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  notifs.unshift(created);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  return created;
};

export const deleteNotification = (id: string) => {
  const notifs = getScheduledNotifications().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};

// Dismissed notifications tracking
export const getDismissedNotifs = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DISMISSED_NOTIFS) || '[]');
  } catch {
    return [];
  }
};

export const dismissNotif = (notifId: string) => {
  const list = getDismissedNotifs();
  if (!list.includes(notifId)) {
    list.push(notifId);
    localStorage.setItem(STORAGE_KEYS.DISMISSED_NOTIFS, JSON.stringify(list));
  }
};

// Surveys
export const getSurveys = (): Survey[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEYS) || '[]');
  } catch {
    return INITIAL_SURVEYS;
  }
};

export const saveSurvey = (survey: Omit<Survey, 'id' | 'createdAt'>): Survey => {
  const surveys = getSurveys();
  const created: Survey = {
    ...survey,
    id: `srv_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  surveys.unshift(created);
  localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
  return created;
};

export const deleteSurvey = (id: string) => {
  const surveys = getSurveys().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
};

// Survey Responses
export const getSurveyResponses = (): SurveyResponse[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEY_RESPONSES) || '[]');
  } catch {
    return [];
  }
};

export const saveSurveyResponse = (resp: Omit<SurveyResponse, 'id' | 'submittedAt'>): SurveyResponse => {
  const list = getSurveyResponses();
  const created: SurveyResponse = {
    ...resp,
    id: `rsp_${Date.now()}`,
    submittedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
  };
  list.unshift(created);
  localStorage.setItem(STORAGE_KEYS.SURVEY_RESPONSES, JSON.stringify(list));
  return created;
};

// Helper to format duration in seconds into "XXh YYm ZZs"
export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(minutes)}m ${pad(seconds)}s`;
};

// Helper to format currency in Malagasy Ariary (Ar)
export const formatCurrency = (amountInAriary: number): string => {
  return `${Math.round(amountInAriary).toLocaleString('fr-FR')} Ar`;
};
