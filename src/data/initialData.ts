import { User, Shift, ScheduledNotification, Survey } from '../types';

export const INITIAL_BOUTIQUES = [
  'Tsara Pâtisserie - Analakely',
  'Tsara Pâtisserie - Ankorondrano',
  'Tsara Pâtisserie - Tsaralalana',
  'Tsara Pâtisserie - Tanjombato'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    username: 'sarah',
    password: 'vendeuse123',
    fullName: 'Sarah Rasoanaivo',
    phone: '034 12 345 67 (MVola)',
    boutique: 'Tsara Pâtisserie - Analakely',
    hourlyRate: 500,
    role: 'vendeuse',
    createdAt: '2026-08-01'
  },
  {
    id: 'usr_2',
    username: 'aina',
    password: 'vendeuse456',
    fullName: 'Aina Rakoto',
    phone: '038 98 765 43 (MVola)',
    boutique: 'Tsara Pâtisserie - Tsaralalana',
    hourlyRate: 500,
    role: 'vendeuse',
    createdAt: '2026-08-02'
  },
  {
    id: 'usr_3',
    username: 'mialy',
    password: 'pass789',
    fullName: 'Mialy Randria',
    phone: '032 55 443 21 (MVola)',
    boutique: 'Tsara Pâtisserie - Ankorondrano',
    hourlyRate: 500,
    role: 'vendeuse',
    createdAt: '2026-08-03'
  }
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shf_101',
    userId: 'usr_1',
    username: 'sarah',
    userFullName: 'Sarah Rasoanaivo',
    boutique: 'Tsara Pâtisserie - Analakely',
    startTime: new Date(`${yesterday}T08:00:00`).getTime(),
    endTime: new Date(`${yesterday}T16:30:00`).getTime(),
    durationSeconds: 30600, // 8h 30m
    hourlyRate: 500,
    earnedSalary: 4250, // 8.5h * 500 = 4250 Ar
    status: 'COMPLETED',
    dateStr: yesterday,
    startFormatted: '08:00',
    endFormatted: '16:30',
    notes: 'Vitrine nettoyée le matin. Bon affluence l\'après-midi.'
  },
  {
    id: 'shf_102',
    userId: 'usr_2',
    username: 'aina',
    userFullName: 'Aina Rakoto',
    boutique: 'Tsara Pâtisserie - Tsaralalana',
    startTime: new Date(`${yesterday}T08:15:00`).getTime(),
    endTime: new Date(`${yesterday}T17:00:00`).getTime(),
    durationSeconds: 31500, // 8h 45m = 8.75h
    hourlyRate: 500,
    earnedSalary: 4375, // 8.75h * 500 = 4375 Ar
    status: 'COMPLETED',
    dateStr: yesterday,
    startFormatted: '08:15',
    endFormatted: '17:00',
    notes: 'Réception nouveaux gâteaux et viennoiseries à 14h.'
  },
  {
    id: 'shf_103',
    userId: 'usr_3',
    username: 'mialy',
    userFullName: 'Mialy Randria',
    boutique: 'Tsara Pâtisserie - Ankorondrano',
    startTime: new Date(`${today}T07:45:00`).getTime(),
    endTime: new Date(`${today}T12:00:00`).getTime(),
    durationSeconds: 15300, // 4h 15m = 4.25h
    hourlyRate: 500,
    earnedSalary: 2125, // 4.25h * 500 = 2125 Ar
    status: 'COMPLETED',
    dateStr: today,
    startFormatted: '07:45',
    endFormatted: '12:00',
    notes: 'Pointage de demi-journée.'
  }
];

export const INITIAL_NOTIFICATIONS: ScheduledNotification[] = [
  {
    id: 'notif_1',
    title: 'Rappel Nettoyage Vitrine',
    message: "N'oublie pas de nettoyer la vitrine !",
    scheduledTime: '13:00',
    isActive: true,
    createdAt: '2026-08-01'
  },
  {
    id: 'notif_2',
    title: 'Vérification de Caisse',
    message: 'Merci de compter le fond de caisse et de noter le solde intermédiaire.',
    scheduledTime: '16:30',
    isActive: true,
    createdAt: '2026-08-02'
  }
];

export const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'srv_1',
    title: 'Sondage de Mi-journée : Propreté & Ventes',
    description: 'Petite enquête rapide pour évaluer l\'état de la boutique à 13h00.',
    scheduledTime: '13:00',
    isActive: true,
    createdAt: '2026-08-01',
    questions: [
      {
        id: 'q1',
        questionText: 'Avez-vous nettoyé et dépoussiéré la vitrine aujourd\'hui ?',
        type: 'multiple_choice',
        options: ['Oui, parfaitement propre', 'En cours de nettoyage', 'Non, prévu plus tard']
      },
      {
        id: 'q2',
        questionText: 'Comment évaluez-vous l\'affluence des clients ce matin ?',
        type: 'rating'
      },
      {
        id: 'q3',
        questionText: 'Remarques ou besoins de réapprovisionnement de stock :',
        type: 'text'
      }
    ]
  }
];
