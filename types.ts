export enum MemoryType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT',
  DOCUMENT = 'DOCUMENT'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum PersonalityMode {
  FRIENDLY = 'FRIENDLY', // Default, supportive
  STRICT = 'STRICT',     // High priority, no fluff, direct commands
  MENTOR = 'MENTOR',     // Educational, explains 'why'
  FUNNY = 'FUNNY',       // Jokes, lighthearted
  SILENT = 'SILENT'      // Minimal output, just facts
}

export interface UserProfile {
  wakeTime: string;
  sleepTime: string;
  workStart: string;
  breakInterval: string;
  notificationLevel: 'silent' | 'medium' | 'strict';
  voiceTone: 'friendly' | 'mentor' | 'strict';
  offlineSyncInterval: string;
}

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  tags: string[];
  createdAt: string; // ISO String
  embeddingContext?: string; // Simplified vector context
  metadata?: {
    location?: string; // e.g., "Kitchen drawer"
    deadline?: string;
    documentUrl?: string; // Base64 or URL
    status?: 'PENDING' | 'DONE';
    priority?: Priority;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface UserStats {
  memoriesCaptured: number;
  tasksCompleted: number;
  streakDays: number;
  productivityScore: number; // 0-100
  lastActive: string;
}

export interface DaySchedule {
  date: string;
  slots: {
    time: string;
    task: string;
    type: 'work' | 'break' | 'personal';
  }[];
}