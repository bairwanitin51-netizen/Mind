import React, { useState } from 'react';
import { Memory, MemoryType, DaySchedule, Priority, UserProfile } from '../types';
import { Icons } from '../constants';
import { generateDailySchedule } from '../services/geminiService';
import toast from 'react-hot-toast';

interface CalendarViewProps {
  memories: Memory[];
  profile: UserProfile;
}

const CalendarView: React.FC<CalendarViewProps> = ({ memories, profile }) => {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const tasks = memories.filter(m => m.type === MemoryType.TASK && m.metadata?.status === 'PENDING');

  const handleGenerate = async () => {
    if (tasks.length === 0) {
      toast.error("No pending tasks to schedule!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const generated = await generateDailySchedule(memories, profile);
      if (generated) {
        setSchedule(generated);
        toast.success("Schedule optimized by AI");
      } else {
        toast.error("Could not generate schedule");
      }
    } catch (e) {
      toast.error("AI Service unavailable");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (p?: Priority) => {
    if (p === Priority.CRITICAL) return 'bg-red-500';
    if (p === Priority.HIGH) return 'bg-orange-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Smart Scheduler</h1>
          <p className="text-slate-400 mt-2">AI-optimized time blocking based on your {profile.workStart} start time.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
        >
          {isGenerating ? <Icons.Loader className="animate-spin" /> : <Icons.Brain />}
          {schedule ? 'Regenerate Plan' : 'Generate Daily Plan'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1">
        {/* Pending Tasks Sidebar */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Unscheduled Tasks ({tasks.length})</h3>
           <div className="space-y-3">
             {tasks.map(task => (
               <div key={task.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-3">
                 <div className={`w-1 self-stretch rounded-full ${getPriorityColor(task.metadata?.priority)}`}></div>
                 <div>
                   <p className="text-sm text-slate-200 font-medium">{task.content}</p>
                   {task.metadata?.deadline && (
                     <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                       <Icons.Clock size={12} />
                       {new Date(task.metadata.deadline).toLocaleDateString()}
                     </div>
                   )}
                 </div>
               </div>
             ))}
             {tasks.length === 0 && (
                <div className="text-center py-10 text-slate-600">
                  <Icons.Check className="mx-auto mb-2" size={32} />
                  <p>All clear! No pending tasks.</p>
                </div>
             )}
           </div>
        </div>

        {/* Schedule View */}
        <div className="lg:col-span-2">
          {schedule ? (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-6 text-indigo-400">
                <Icons.Calendar size={20} />
                <span className="font-bold">{new Date().toDateString()}</span>
              </div>

              <div className="space-y-4 relative z-10">
                {schedule.slots.map((slot, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-20 text-right text-sm font-mono text-slate-500 py-3">{slot.time}</div>
                    <div className={`flex-1 p-3 rounded-xl border transition-all ${
                      slot.type === 'break' 
                      ? 'bg-slate-800/50 border-slate-700 border-dashed opacity-75' 
                      : slot.type === 'personal'
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                      : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100 hover:bg-indigo-600/30'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{slot.task}</span>
                        {slot.type === 'break' && <Icons.Clock size={16} className="text-slate-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Icons.Calendar className="text-indigo-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Plan?</h3>
              <p className="text-slate-400 max-w-md">
                The AI analyzes your tasks, priorities, and habits to create the perfect schedule starting from {profile.workStart}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;