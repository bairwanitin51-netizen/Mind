import React from 'react';
import { UserStats, Memory, MemoryType, PersonalityMode, UserProfile } from '../types';
import { Icons, MOCK_USER } from '../constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

interface DashboardProps {
  stats: UserStats;
  memories: Memory[];
  onChangeView: (view: any) => void;
  onToggleTask: (id: string) => void;
  personality: PersonalityMode;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, memories, onChangeView, onToggleTask, personality, profile }) => {
  const recentTasks = memories
    .filter(m => m.type === MemoryType.TASK)
    .slice(0, 5);

  const pendingTasks = recentTasks.filter(m => m.metadata?.status === 'PENDING').length;

  const activityData = [
    { name: 'Mon', items: 2 },
    { name: 'Tue', items: 5 },
    { name: 'Wed', items: 8 },
    { name: 'Thu', items: 4 },
    { name: 'Fri', items: 10 },
    { name: 'Sat', items: 6 },
    { name: 'Sun', items: stats.memoriesCaptured > 10 ? stats.memoriesCaptured - 10 : 2 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Good Morning, {MOCK_USER}
          </h1>
          <p className="text-slate-400 mt-1">AI Mode: <span className="text-indigo-400 font-bold">{personality}</span> • Rhythm: <span className="text-emerald-400">{profile.voiceTone}</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Memories" value={stats.memoriesCaptured} icon={<Icons.Brain className="text-indigo-400" />} />
        <StatCard label="Tasks Done" value={stats.tasksCompleted} icon={<Icons.Check className="text-emerald-400" />} />
        <StatCard label="Streak" value={`${stats.streakDays} Days`} icon={<Icons.Clock className="text-orange-400" />} />
        <StatCard label="Productivity" value={`${stats.productivityScore}%`} icon={<Icons.Dashboard className="text-purple-400" />} />
      </div>

      {/* Bio-Rhythm / Defaults Bar */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-wrap gap-6 items-center overflow-x-auto text-sm">
         <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Bio-Rhythm:</span>
         <div className="flex items-center gap-2 text-slate-300">
           <Icons.Sun size={14} className="text-yellow-400" /> Wake {profile.wakeTime}
         </div>
         <div className="flex items-center gap-2 text-slate-300">
           <Icons.Zap size={14} className="text-blue-400" /> Work {profile.workStart}
         </div>
         <div className="flex items-center gap-2 text-slate-300">
           <Icons.Moon size={14} className="text-purple-400" /> Sleep {profile.sleepTime}
         </div>
         <div className="flex items-center gap-2 text-slate-300 ml-auto">
           <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">{profile.notificationLevel.toUpperCase()} NOTIFICATIONS</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icons.Check size={20} className="text-indigo-400" />
                Priority Tasks
              </h2>
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                {pendingTasks} PENDING
              </span>
            </div>

            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No tasks yet. Capture a memory to start.</p>
                </div>
              ) : (
                recentTasks.map(task => (
                  <div key={task.id} className="flex items-start group">
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        task.metadata?.status === 'DONE' 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-900' 
                        : 'border-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {task.metadata?.status === 'DONE' && <Icons.Check size={14} strokeWidth={3} />}
                    </button>
                    <div className="ml-4 flex-1">
                      <p className={`text-sm md:text-base transition-all ${
                        task.metadata?.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {task.content}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-6 h-64">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Focus Flow</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="items" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Suggestions / Locations */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl border border-indigo-500/20 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icons.Brain size={100} />
             </div>
             <h3 className="text-lg font-bold mb-2">AI Coach ({personality})</h3>
             <p className="text-sm text-indigo-200 mb-4 italic">
               "{personality === 'STRICT' ? 'You are slacking. Clear 3 tasks now.' : 'Great progress! Maybe take a short walk?'}"
             </p>
             <button onClick={() => onChangeView('CALENDAR')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 rounded-lg font-medium transition-colors">
               Optimize Schedule
             </button>
          </div>

          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icons.Location size={18} className="text-pink-400" />
              Item Finder
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm p-3 bg-slate-800 rounded-lg">
                <span className="text-slate-300">Car Keys</span>
                <span className="text-slate-500">Hallway Table</span>
              </div>
            </div>
             <button 
               onClick={() => onChangeView('MEMORIES')}
               className="w-full mt-4 text-xs text-indigo-400 hover:text-indigo-300 font-medium text-center"
             >
               View All Locations
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string, value: string | number, icon: React.ReactNode}> = ({ label, value, icon }) => (
  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between h-24 sm:h-32 hover:bg-slate-800/60 transition-colors">
    <div className="flex justify-between items-start">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <span className="text-2xl sm:text-3xl font-bold text-slate-100">{value}</span>
  </div>
);

export default Dashboard;