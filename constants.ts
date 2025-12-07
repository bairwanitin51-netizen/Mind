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
  Sun
} from "lucide-react";
import { UserProfile } from "./types";

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
  Sun
};

export const APP_NAME = "MindBackup";
export const MOCK_USER = "Alex";

export const DEFAULT_USER_PROFILE: UserProfile = {
  wakeTime: "06:30",
  sleepTime: "23:30",
  workStart: "09:00",
  breakInterval: "45 minutes",
  notificationLevel: "medium",
  voiceTone: "friendly",
  offlineSyncInterval: "8 hours"
};