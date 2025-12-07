import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { analyzeImage } from '../services/geminiService';
import { Memory, MemoryType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface DocumentScannerProps {
  onSave: (memory: Memory) => void;
  onClose?: () => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onSave, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{text: string, tags: string[]} | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeImage(preview);
      setResult(data);
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMemory = () => {
    if (!result || !preview) return;
    
    const newMemory: Memory = {
      id: uuidv4(),
      type: MemoryType.DOCUMENT,
      content: result.text,
      tags: [...result.tags, 'scanned-doc'],
      createdAt: new Date().toISOString(),
      metadata: {
        documentUrl: preview, // Storing base64 in localstorage is heavy, but fine for prototype
        status: 'DONE'
      }
    };
    
    onSave(newMemory);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full flex flex-col">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Icons.Camera className="text-pink-500" />
          Neural Scanner
        </h1>
        <p className="text-slate-400 mt-2">Digitize physical documents, business cards, or objects into your second brain.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 flex-1">
        {/* Left: Input Area */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl h-64 md:h-96 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
              preview ? 'border-indigo-500/50' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-black/50" />
            ) : (
              <>
                <Icons.Camera size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">Tap to Scan</p>
                <p className="text-slate-600 text-xs mt-2">Supports JPG, PNG</p>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleFileSelect}
            />
          </div>

          {preview && !result && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {isAnalyzing ? <Icons.Loader className="animate-spin" /> : <Icons.Brain />}
              {isAnalyzing ? "AI Processing..." : "Analyze with Vision AI"}
            </button>
          )}
        </div>

        {/* Right: Results Area */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.Documents size={20} className="text-indigo-400" />
            Extraction Result
          </h3>
          
          {result ? (
            <div className="flex-1 flex flex-col space-y-4">
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex-1 overflow-y-auto max-h-[400px]">
                 <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.text}</p>
               </div>
               
               <div className="flex flex-wrap gap-2">
                 {result.tags.map(t => (
                   <span key={t} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-md">#{t}</span>
                 ))}
               </div>

               <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                 <button 
                   onClick={() => { setPreview(null); setResult(null); }}
                   className="flex-1 py-3 text-slate-400 hover:text-white font-medium"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handleSaveMemory}
                   className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                 >
                   Save Memory
                 </button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center p-8">
              <Icons.Search size={40} className="mb-4 opacity-50" />
              <p>Upload or snap a photo to extract text, identify objects, and auto-tag content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;