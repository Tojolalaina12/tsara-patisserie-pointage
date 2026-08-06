export type Role = 'vendeuse' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string; // Stored for admin review as requested
  fullName: string;
  phone: string; // e.g., MVola number
  boutique: string;
  hourlyRate: number; // Ariary per hour (e.g. 500)
  role: Role;
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  boutique: string;
  startTime: number; // Timestamp in ms
  endTime?: number; // Timestamp in ms if finished
  durationSeconds?: number;
  hourlyRate?: number; // Rate applied for this shift
  earnedSalary?: number; // Calculated earned amount in Ariary
  status: 'ACTIVE' | 'COMPLETED';
  dateStr: string; // YYYY-MM-DD for easy daily grouping
  startFormatted: string; // HH:mm
  endFormatted?: string; // HH:mm
  notes?: string;
  isPaid?: boolean; // Paid status
  paidAtDate?: string; // Date payment was executed (e.g. DD/MM/YYYY or YYYY-MM-DD)
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledTime: string; // HH:mm e.g. "13:00"
  scheduledDate?: string; // YYYY-MM-DD or empty for daily recurring
  targetUserId?: string; // 'all' or specific userId
  isActive: boolean;
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'rating' | 'text';
  options?: string[]; // For multiple_choice
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  scheduledTime: string; // HH:mm
  scheduledDate?: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userFullName: string;
  answers: Record<string, string | number>; // questionId -> answer
  submittedAt: string;
}
