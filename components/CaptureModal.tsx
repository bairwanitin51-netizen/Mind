import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { Memory, MemoryType } from '../types';
import { processInputToMemory } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface CaptureModalProps {
  onClose: () => void;
  onSave: (memory: Memory) => void;
}

const CaptureModal: React.FC<CaptureModalProps> = ({ onClose, onSave }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSave = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    try {
      const processed = await processInputToMemory(input);
      
      const newMemory: Memory = {
        id: uuidv4(),
        content: processed.content || input,
        type: processed.type || MemoryType.NOTE,
        tags: processed.tags || [],
        createdAt: new Date().toISOString(),
        metadata: processed.metadata
      };

      onSave(newMemory);
      setInput('');
      onClose();
    } catch (error) {
      toast.error("Failed to process memory.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    // Simple Web Speech API Implementation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Microphone error");
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.start();
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Icons.Brain className="text-indigo-400" size={20} />
            Quick Capture
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a thought, task, or location..."
            className="w-full h-32 bg-slate-800 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            autoFocus
          />
          
          <div className="flex gap-2 justify-end">
             <button 
              onClick={toggleListening}
              className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title="Voice Input"
             >
               <Icons.Mic size={20} />
             </button>
             <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white" title="Upload Image (Simulated)">
               <Icons.Camera size={20} />
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isProcessing || !input.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isProcessing ? (
              <>
                <Icons.Loader className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                Save to Brain
                <Icons.Send size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;