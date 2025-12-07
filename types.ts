// types.ts

export enum MemoryType {
  NOTE = "NOTE",
  TASK = "TASK",
  LOCATION = "LOCATION",
  EVENT = "EVENT",
  DOCUMENT = "DOCUMENT",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum PersonalityMode {
  FRIENDLY = "FRIENDLY", // Default, supportive
  STRICT = "STRICT", // High priority, no fluff, direct commands
  MENTOR = "MENTOR", // Educational, explains 'why'
  FUNNY = "FUNNY", // Jokes, lighthearted
  SILENT = "SILENT", // Minimal output, just facts
}

/**
 * Per-user customisable profile.
 * हर user अपनी अलग setting रख सकता है।
 */
export interface UserProfile {
  /**
   * Daily routine defaults
   */
  wakeTime: string;
  sleepTime: string;
  workStart: string;
  breakInterval: string;

  /**
   * Notification & voice behaviour
   */
  notificationLevel: "silent" | "medium" | "strict";
  voiceTone: "friendly" | "mentor" | "strict";
  offlineSyncInterval: string;

  /**
   * UI & language preferences (optional)
   */
  theme?: "light" | "dark" | "system";
  language?: "en" | "hi" | "auto";
}

/**
 * Single memory object stored by the second brain.
 */
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
    status?: "PENDING" | "DONE";
    priority?: Priority;
  };
}

/**
 * Basic chat message structure.
 */
export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

/**
 * Simple stats model for dashboard.
 */
export interface UserStats {
  memoriesCaptured: number;
  tasksCompleted: number;
  streakDays: number;
  productivityScore: number; // 0-100
  lastActive: string;
}

/**
 * Schedule output shape for a day.
 */
export interface DaySchedule {
  date: string;
  slots: {
    time: string;
    task: string;
    type: "work" | "break" | "personal";
  }[];
}
