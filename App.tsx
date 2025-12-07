// App.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  APP_NAME,
  DEFAULT_USER_PROFILE,
  MOCK_USER,
  Icons,
  storageKey,
} from "./constants";
import {
  Memory,
  MemoryType,
  PersonalityMode,
  UserProfile,
  UserStats,
} from "./types";

import Dashboard from "./components/Dashboard";
import MemoryBank from "./components/MemoryBank";
import ChatAssistant from "./components/ChatAssistant";
import CaptureModal from "./components/CaptureModal";
import CalendarView from "./components/CalendarView";
import DocumentScanner from "./components/DocumentScanner";

import { Toaster, toast } from "react-hot-toast";

type View = "DASHBOARD" | "MEMORIES" | "CHAT" | "CALENDAR" | "SCANNER";

const createInitialStats = (): UserStats => ({
  memoriesCaptured: 0,
  tasksCompleted: 0,
  streakDays: 1,
  productivityScore: 60,
  lastActive: new Date().toISOString(),
});

/**
 * Merge raw stored profile with app defaults,
 * so new fields आने पर भी crash न हो।
 */
const mergeProfileWithDefaults = (raw: unknown): UserProfile => {
  if (!raw || typeof raw !== "object") return DEFAULT_USER_PROFILE;
  return {
    ...DEFAULT_USER_PROFILE,
    ...(raw as Partial<UserProfile>),
  };
};

/**
 * Load profile for a specific userId from localStorage.
 */
const loadProfile = (userId: string): UserProfile => {
  try {
    const saved = localStorage.getItem(storageKey(userId, "profile"));
    if (!saved) return DEFAULT_USER_PROFILE;
    return mergeProfileWithDefaults(JSON.parse(saved));
  } catch {
    return DEFAULT_USER_PROFILE;
  }
};

/**
 * Load memories for userId from localStorage.
 */
const loadMemories = (userId: string): Memory[] => {
  try {
    const saved = localStorage.getItem(storageKey(userId, "memories"));
    if (!saved) return [];
    return JSON.parse(saved) as Memory[];
  } catch {
    return [];
  }
};

const App: React.FC = () => {
  const [userId, setUserId] = useState<string>(MOCK_USER);
  const [currentView, setCurrentView] = useState<View>("DASHBOARD");
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [profile, setProfile] = useState<UserProfile>(() =>
    typeof window === "undefined" ? DEFAULT_USER_PROFILE : loadProfile(MOCK_USER)
  );

  const [memories, setMemories] = useState<Memory[]>(() =>
    typeof window === "undefined" ? [] : loadMemories(MOCK_USER)
  );

  const [stats, setStats] = useState<UserStats>(() => createInitialStats());

  // Personality auto calculation — discipline + fun logic
  const personality: PersonalityMode = useMemo(() => {
    if (stats.productivityScore < 40) return PersonalityMode.STRICT;
    if (stats.tasksCompleted > 10) return PersonalityMode.FUNNY;
    return PersonalityMode.FRIENDLY;
  }, [stats]);

  // Re-load data when userId changes (multi-user support)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile(loadProfile(userId));
    setMemories(loadMemories(userId));
  }, [userId]);

  // Online/offline detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("MindBackup Online – Cloud sync enabled");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Offline Mode: Local Brain Active");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save memories & profile whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      storageKey(userId, "memories"),
      JSON.stringify(memories)
    );
    localStorage.setItem(
      storageKey(userId, "profile"),
      JSON.stringify(profile)
    );

    // update stats
    const completed = memories.filter(
      (m) => m.type === MemoryType.TASK && m.metadata?.status === "DONE"
    ).length;

    setStats((prev) => ({
      ...prev,
      memoriesCaptured: memories.length,
      tasksCompleted: completed,
      productivityScore: Math.min(
        100,
        Math.max(20, completed * 5 + 50)
      ),
      lastActive: new Date().toISOString(),
    }));
  }, [memories, profile, userId]);

  // ------ Memory CRUD helpers ------

  const addMemory = (memory: Memory) => {
    setMemories((prev) => [memory, ...prev]);
    toast.success("Saved to Brain");
  };

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const toggleTaskStatus = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (!m.metadata) return m;
        const status = m.metadata.status === "DONE" ? "PENDING" : "DONE";
        return {
          ...m,
          metadata: {
            ...m.metadata,
            status,
          },
        };
      })
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success("Memory removed");
  };

  // ------ Profile update (customisation) ------

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  // ------ Render view switcher ------

  const renderContent = () => {
    switch (currentView) {
      case "DASHBOARD":
        return (
          <Dashboard
            memories={memories}
            stats={stats}
            profile={profile}
            personality={personality}
            onToggleTaskStatus={toggleTaskStatus}
          />
        );
      case "MEMORIES":
        return (
          <MemoryBank
            memories={memories}
            onUpdate={updateMemory}
            onDelete={deleteMemory}
          />
        );
      case "CHAT":
        return (
          <ChatAssistant
            memories={memories}
            onAddMemory={addMemory}
            personality={personality}
            profile={profile}
          />
        );
      case "CALENDAR":
        return <CalendarView memories={memories} profile={profile} />;
      case "SCANNER":
        return <DocumentScanner onAddMemory={addMemory} />;
      default:
        return <div className="text-slate-400">Feature coming soon…</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Toaster position="top-right" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 gap-6">
        <div className="flex items-center gap-2">
          <Icons.Brain className="w-7 h-7 text-indigo-400" />
          <div>
            <div className="font-semibold">{APP_NAME}</div>
            <div className="text-xs text-slate-400">
              Second Brain for {userId}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <NavButton
            active={currentView === "DASHBOARD"}
            onClick={() => setCurrentView("DASHBOARD")}
            icon={<Icons.Dashboard className="w-4 h-4" />}
            label="Dashboard"
          />
          <NavButton
            active={currentView === "CHAT"}
            onClick={() => setCurrentView("CHAT")}
            icon={<Icons.Chat className="w-4 h-4" />}
            label="AI Assistant"
          />
          <NavButton
            active={currentView === "MEMORIES"}
            onClick={() => setCurrentView("MEMORIES")}
            icon={<Icons.Documents className="w-4 h-4" />}
            label="Memory Bank"
          />
          <NavButton
            active={currentView === "CALENDAR"}
            onClick={() => setCurrentView("CALENDAR")}
            icon={<Icons.Calendar className="w-4 h-4" />}
            label="Scheduler"
          />
          <NavButton
            active={currentView === "SCANNER"}
            onClick={() => setCurrentView("SCANNER")}
            icon={<Icons.Camera className="w-4 h-4" />}
            label="Doc Scanner"
          />
        </div>

        {/* Status + Core Settings */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">System status</span>
            <span
              className={`flex items-center gap-1 ${
                isOnline ? "text-emerald-400" : "text-amber-300"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <SettingsPanel
            userId={userId}
            onUserIdChange={setUserId}
            profile={profile}
            onProfileChange={updateProfile}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <Icons.Brain className="w-6 h-6 text-indigo-400" />
            <div>
              <div className="text-sm font-semibold">{APP_NAME}</div>
              <div className="text-[11px] text-slate-400">
                {isOnline ? "Online" : "Offline mode"}
              </div>
            </div>
          </div>

          <button
            className="p-2 rounded-full border border-slate-700 text-xs"
            onClick={() =>
              toast("Settings panel is available on desktop sidebar.")
            }
          >
            <Icons.Settings className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}

          {/* Floating Action Button */}
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="absolute bottom-20 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 group"
          >
            <Icons.Plus className="w-5 h-5" />
            <span className="sr-only">New Memory</span>
          </button>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950 border-t border-slate-800 flex justify-around py-2">
          <MobileNavIcon
            active={currentView === "DASHBOARD"}
            onClick={() => setCurrentView("DASHBOARD")}
            icon={<Icons.Dashboard className="w-5 h-5" />}
          />
          <MobileNavIcon
            active={currentView === "MEMORIES"}
            onClick={() => setCurrentView("MEMORIES")}
            icon={<Icons.Documents className="w-5 h-5" />}
          />
          <MobileNavIcon
            active={currentView === "CALENDAR"}
            onClick={() => setCurrentView("CALENDAR")}
            icon={<Icons.Calendar className="w-5 h-5" />}
          />
          <MobileNavIcon
            active={currentView === "SCANNER"}
            onClick={() => setCurrentView("SCANNER")}
            icon={<Icons.Camera className="w-5 h-5" />}
          />
        </nav>
      </main>

      {/* Capture Modal */}
      {isCaptureOpen && (
        <CaptureModal
          onClose={() => setIsCaptureOpen(false)}
          onSave={addMemory}
        />
      )}
    </div>
  );
};

/**
 * Desktop sidebar nav button.
 */
const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
      ${
        active
          ? "bg-indigo-600/20 text-indigo-300"
          : "text-slate-300 hover:bg-slate-800/60"
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Mobile bottom nav icon.
 */
const MobileNavIcon: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full ${
      active ? "bg-indigo-600/30 text-indigo-300" : "text-slate-400"
    }`}
  >
    {icon}
  </button>
);

/**
 * Settings panel inside sidebar –
 * यहीं से har user अपना default customise कर सकता है।
 */
const SettingsPanel: React.FC<{
  userId: string;
  onUserIdChange: (id: string) => void;
  profile: UserProfile;
  onProfileChange: (patch: Partial<UserProfile>) => void;
}> = ({ userId, onUserIdChange, profile, onProfileChange }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-200 mb-1">
        <Icons.Settings className="w-3 h-3" />
        <span>Core Settings</span>
      </div>

      {/* User ID (multi-user simulation) */}
      <div className="space-y-1">
        <label className="text-[11px] text-slate-400">Profile name</label>
        <input
          className="w-full bg-slate-950/60 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
          value={userId}
          onChange={(e) => onUserIdChange(e.target.value || MOCK_USER)}
          placeholder="User ID (e.g. Alex, Mom, Work)"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <label className="space-y-1">
          <span className="text-slate-400">Wake time</span>
          <input
            type="time"
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.wakeTime}
            onChange={(e) =>
              onProfileChange({ wakeTime: e.target.value || "06:30" })
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-slate-400">Sleep time</span>
          <input
            type="time"
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.sleepTime}
            onChange={(e) =>
              onProfileChange({ sleepTime: e.target.value || "23:30" })
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-slate-400">Work start</span>
          <input
            type="time"
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.workStart}
            onChange={(e) =>
              onProfileChange({ workStart: e.target.value || "09:00" })
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-slate-400">Break interval</span>
          <input
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.breakInterval}
            onChange={(e) =>
              onProfileChange({
                breakInterval: e.target.value || "45 minutes",
              })
            }
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <label className="space-y-1">
          <span className="text-slate-400">Notification level</span>
          <select
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.notificationLevel}
            onChange={(e) =>
              onProfileChange({
                notificationLevel: e.target
                  .value as UserProfile["notificationLevel"],
              })
            }
          >
            <option value="silent">Silent</option>
            <option value="medium">Medium</option>
            <option value="strict">Strict</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-slate-400">Voice tone</span>
          <select
            className="w-full bg-slate-950/60 border border-slate-700 rounded px-1 py-1 text-[11px]"
            value={profile.voiceTone}
            onChange={(e) =>
              onProfileChange({
                voiceTone: e.target.value as UserProfile["voiceTone"],
              })
            }
          >
            <option value="friendly">Friendly</option>
            <option value="mentor">Mentor</option>
            <option value="strict">Strict</option>
          </select>
        </label>
      </div>

      <p className="text-[10px] text-slate-500 pt-1">
        Ye sab defaults har new task, schedule & AI plan mein use honge.
      </p>
    </div>
  );
};

export default App;
