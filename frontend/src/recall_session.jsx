import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw,
  FileText
} from 'lucide-react';

export default function RecallSession() {
  const [text, setText] = useState('');
  const [seconds, setSeconds] = useState(900); // 15:00 countdown

  // Timer countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);


  // Format MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-6 md:space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Top Navigation & Center Title matching Wireframe: Active recall sessions */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <Link
          to="/active-recall"
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs md:text-sm text-[#948979] hover:text-[#DFD0B8] transition-colors bg-[#393E46]/40 px-3.5 py-2 rounded-xl border border-[#948979]/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Sessions</span>
        </Link>

        <h1 className="text-2xl md:text-4xl font-extrabold text-[#DFD0B8] tracking-tight font-['Outfit'] text-center">
          Active Recall Sessions
        </h1>
      </div>

      {/* Action Bar matching Wireframe: Left "timer" | Right "get result" */}
      <div className="flex items-center justify-between gap-4 bg-[#393E46]/50 p-4 md:p-5 rounded-2xl border border-[#948979]/20 shadow-md">
        {/* Left: Timer */}
        <div className="flex items-center gap-2.5 bg-[#222831] px-4 py-2.5 rounded-xl border border-[#948979]/30">
          <Clock className="w-4 h-4 text-[#DFD0B8] animate-pulse" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#948979] uppercase font-semibold">Timer</span>
            <span className="font-mono text-lg md:text-xl font-bold text-[#DFD0B8]">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Right: Get Result Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-all shadow-lg shadow-[#DFD0B8]/10 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#222831]" />
            <span>Get Result</span>
          </button>
        </div>
      </div>

      {/* Main Container matching Wireframe: "this is a big text area" */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-2xl space-y-4">
        {/* Header Prompt details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#948979]/20">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#DFD0B8]" />
            <span className="text-sm font-semibold text-[#DFD0B8]">
              Recall Workspace: Write Everything You Remember
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#948979]">
            <span>Words: <strong className="text-[#DFD0B8]">{wordCount}</strong></span>
            <span>•</span>
            <span>Characters: <strong className="text-[#DFD0B8]">{charCount}</strong></span>
          </div>
        </div>

        {/* Big Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            placeholder="This is a big text area. Begin typing your active recall notes, core concepts, formulas, definitions, and mental models here without consulting your study resources..."
            className="w-full bg-[#222831] text-[#DFD0B8] placeholder-[#948979]/60 rounded-2xl border border-[#948979]/30 focus:border-[#DFD0B8] focus:ring-2 focus:ring-[#DFD0B8]/20 focus:outline-none p-5 md:p-6 text-base md:text-lg leading-relaxed resize-y font-['Plus_Jakarta_Sans'] shadow-inner transition-all"
          />
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#948979]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spaced retrieval mode active • No references permitted</span>
          </div>

          <button
            type="button"
            onClick={() => setText('')}
            className="flex items-center gap-1.5 text-xs text-[#948979] hover:text-[#DFD0B8] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Textarea</span>
          </button>
        </div>
      </div>
    </div>
  );
}
