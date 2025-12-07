import React, { useState, useEffect } from 'react';
import { Icons, APP_NAME, DEFAULT_USER_PROFILE } from './constants';
import { Memory, MemoryType, UserStats, PersonalityMode, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import MemoryBank from './components/MemoryBank';
import ChatAssistant from './components/ChatAssistant';
import CaptureModal from './components/CaptureModal';
import CalendarView from './components/CalendarView';
import DocumentScanner from './components/DocumentScanner';
import { Toaster, toast } from 'react-hot-toast';

type View = 'DASHBOARD' | 'MEMORIES' | 'CHAT' | 'CALENDAR' | 'SCANNER';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // App State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [stats, setStats] = useState<UserStats>({
    memoriesCaptured: 0,
    tasksCompleted: 0,
    streakDays: 4,
    productivityScore: 85,
    lastActive: new Date().toISOString()
  });

  // Calculate Personality based on stats
  const getPersonality = (): PersonalityMode => {
    if (stats.productivityScore < 40) return PersonalityMode.STRICT;
    if (stats.tasksCompleted > 10) return PersonalityMode.FUNNY;
    return PersonalityMode.FRIENDLY;
  };

  const personality = getPersonality();

  // Load from local storage on mount
  useEffect(() => {
    const savedMemories = localStorage.getItem('mindbackup_memories');
    if (savedMemories) setMemories(JSON.parse(savedMemories));

    const savedProfile = localStorage.getItem('mindbackup_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    // Offline detection
    const handleOnline = () => { setIsOnline(true); toast.success("MindBackup Online"); };
    const handleOffline = () => { setIsOnline(false); toast.error("Offline Mode: Local Brain Active"); };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mindbackup_memories', JSON.stringify(memories));
    localStorage.setItem('mindbackup_profile', JSON.stringify(profile));
    
    // Update stats logic
    const completed = memories.filter(m => m.type === MemoryType.TASK && m.metadata?.status === 'DONE').length;
    setStats(prev => ({
      ...prev,
      memoriesCaptured: memories.length,
      tasksCompleted: completed,
      productivityScore: Math.min(100, Math.max(20, (completed * 5) + 50)) 
    }));
  }, [memories, profile]);

  const addMemory = (memory: Memory) => {
    setMemories(prev => [memory, ...prev]);
    toast.success("Saved to Brain");
  };

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    toast.success("Memory removed");
  };

  // Render Content Switcher
  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard 
          stats={stats} 
          memories={memories} 
          onChangeView={setCurrentView} 
          onToggleTask={(id) => {
             const mem = memories.find(m => m.id === id);
             if (mem && mem.metadata) {
                 updateMemory(id, { metadata: { ...mem.metadata, status: mem.metadata.status === 'PENDING' ? 'DONE' : 'PENDING' }});
             }
        }} 
        personality={personality}
        profile={profile}
        />;
      case 'MEMORIES':
        return <MemoryBank memories={memories} onDelete={deleteMemory} />;
      case 'CHAT':
        return <ChatAssistant memories={memories} personality={personality} profile={profile} />;
      case 'CALENDAR':
        return <CalendarView memories={memories} profile={profile} />;
      case 'SCANNER':
        return <DocumentScanner onSave={addMemory} />;
      default:
        return <div className="p-8 text-center text-slate-400">Feature coming soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#334155',
            color: '#fff',
          },
        }}
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Icons.Brain className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavButton 
            active={currentView === 'DASHBOARD'} 
            onClick={() => setCurrentView('DASHBOARD')} 
            icon={<Icons.Dashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={currentView === 'CHAT'} 
            onClick={() => setCurrentView('CHAT')} 
            icon={<Icons.Chat size={20} />} 
            label="AI Assistant" 
          />
          <NavButton 
            active={currentView === 'MEMORIES'} 
            onClick={() => setCurrentView('MEMORIES')} 
            icon={<Icons.Documents size={20} />} 
            label="Memory Bank" 
          />
           <NavButton 
            active={currentView === 'CALENDAR'} 
            onClick={() => setCurrentView('CALENDAR')} 
            icon={<Icons.Calendar size={20} />} 
            label="Scheduler" 
          />
           <NavButton 
            active={currentView === 'SCANNER'} 
            onClick={() => setCurrentView('SCANNER')} 
            icon={<Icons.Camera size={20} />} 
            label="Doc Scanner" 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className={`text-xs px-3 py-2 rounded-lg mb-2 flex items-center justify-between ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
             <span className="font-semibold">{isOnline ? 'System Online' : 'Offline Mode'}</span>
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           </div>
           <button className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
            <Icons.Settings size={20} />
            <span>Core Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-20">
          <div className="flex items-center space-x-2">
            <Icons.Brain className="text-indigo-500 w-6 h-6" />
            <span className="font-bold text-lg">{APP_NAME}</span>
          </div>
           <button onClick={() => setCurrentView('CHAT')} className="p-2 text-slate-300">
            <Icons.Chat />
          </button>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsCaptureOpen(true)}
          className="absolute bottom-20 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 group"
        >
          <Icons.Plus size={28} />
          <span className="absolute right-full mr-3 bg-slate-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            New Memory
          </span>
        </button>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-30 pb-safe">
           <MobileNavIcon active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} icon={<Icons.Dashboard />} />
           <MobileNavIcon active={currentView === 'MEMORIES'} onClick={() => setCurrentView('MEMORIES')} icon={<Icons.Documents />} />
           <MobileNavIcon active={currentView === 'CALENDAR'} onClick={() => setCurrentView('CALENDAR')} icon={<Icons.Calendar />} />
           <MobileNavIcon active={currentView === 'SCANNER'} onClick={() => setCurrentView('SCANNER')} icon={<Icons.Camera />} />
        </div>
      </main>

      {/* Modals */}
      {isCaptureOpen && (
        <CaptureModal onClose={() => setIsCaptureOpen(false)} onSave={addMemory} />
      )}
    </div>
  );
};

// Helper Components
const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavIcon: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode}> = ({ active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-lg ${active ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-500'}`}
  >
    {icon}
  </button>
);

export default App;