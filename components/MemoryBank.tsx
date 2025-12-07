import React, { useState } from 'react';
import { Memory, MemoryType } from '../types';
import { Icons } from '../constants';

interface MemoryBankProps {
  memories: Memory[];
  onDelete: (id: string) => void;
}

const MemoryBank: React.FC<MemoryBankProps> = ({ memories, onDelete }) => {
  const [filter, setFilter] = useState<'ALL' | MemoryType>('ALL');
  const [search, setSearch] = useState('');

  const filteredMemories = memories.filter(m => {
    const matchesFilter = filter === 'ALL' || m.type === filter;
    const matchesSearch = m.content.toLowerCase().includes(search.toLowerCase()) || 
                          m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: MemoryType) => {
    switch (type) {
      case MemoryType.TASK: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case MemoryType.LOCATION: return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      case MemoryType.EVENT: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Memory Bank</h1>
          <p className="text-slate-400">Search and manage your stored information.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search memories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {['ALL', MemoryType.NOTE, MemoryType.TASK, MemoryType.LOCATION, MemoryType.EVENT].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              filter === f 
              ? 'bg-slate-100 text-slate-900 border-slate-100' 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            {f === 'ALL' ? 'All Memories' : f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
            <Icons.Brain className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-500">No memories found.</p>
          </div>
        ) : (
          filteredMemories.map(memory => (
            <div key={memory.id} className="bg-slate-800/40 backdrop-blur border border-slate-700/50 p-5 rounded-xl hover:border-indigo-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(memory.type)}`}>
                  {memory.type}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-3">
                {memory.content}
              </p>

              {memory.metadata && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                  {memory.metadata.location && (
                    <span className="flex items-center gap-1">
                      <Icons.Location size={12} /> {memory.metadata.location}
                    </span>
                  )}
                  {memory.metadata.deadline && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <Icons.Clock size={12} /> {new Date(memory.metadata.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-1">
                <div className="flex gap-2">
                  {memory.tags.map(tag => (
                    <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                  ))}
                </div>
                <button 
                  onClick={() => onDelete(memory.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icons.Delete size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryBank;