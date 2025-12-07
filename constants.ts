// constants.ts
import {
  Brain,
  Mic,
  Send,
  LayoutDashboard,
  Calendar,
  MapPin,
  FileText,
  Settings,
  Plus,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Camera,
  X,
  Loader2,
  Activity,
  Zap,
  Moon,
  Sun,
} from "lucide-react";

import { UserProfile } from "./types";

/**
 * Central icon map used across the app.
 */
export const Icons = {
  Brain,
  Mic,
  Send,
  Dashboard: LayoutDashboard,
  Calendar,
  Location: MapPin,
  Documents: FileText,
  Settings,
  Plus,
  Search,
  Chat: MessageSquare,
  Check: CheckCircle,
  Clock,
  Delete: Trash2,
  Camera,
  Close: X,
  Loader: Loader2,
  Activity,
  Zap,
  Moon,
  Sun,
};

export const APP_NAME = "MindBackup";
export const APP_TAGLINE = "AI Second Brain Organizer";
export const APP_VERSION = "1.0.0";

/**
 * Storage prefix – important for versioning and multi-user separation.
 */
export const STORAGE_PREFIX = "mindbackup_v1";

/**
 * Default mock user (can be changed from UI later).
 */
export const MOCK_USER = "Guest";

/**
 * GLOBAL DEFAULTS:
 * Manufacturer-level defaults (base) – हमेशा मौजूद रहेंगे।
 */
export const GLOBAL_DEFAULT_USER_PROFILE: UserProfile = {
  wakeTime: "06:30",
  sleepTime: "23:30",
  workStart: "09:00",
  breakInterval: "45 minutes",
  notificationLevel: "medium",
  voiceTone: "friendly",
  offlineSyncInterval: "8 hours",
  theme: "system",
  language: "auto",
};

/**
 * DEFAULT_USER_PROFILE:
 * This is what a new user actually gets initially.
 * (Global defaults की copy – future में अलग भी रख सकते हैं)
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  ...GLOBAL_DEFAULT_USER_PROFILE,
};

/**
 * Helper to build localStorage keys per-user & per-resource.
 */
export const storageKey = (userId: string, suffix: string) =>
  `${STORAGE_PREFIX}_${suffix}_${userId}`;
