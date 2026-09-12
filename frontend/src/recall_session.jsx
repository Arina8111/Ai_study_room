import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Clock, Sparkles, ArrowLeft, CheckCircle2, RotateCcw, FileText, AlertCircle } from 'lucide-react';

export default function RecallSession() {
  const [text, setText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recallSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('active_recall_session'));
    } catch {
      return null;
    }
  });
  const [seconds, setSeconds] = useState(() => {
    const minutes = Number.parseInt(recallSession?.duration, 10);
    return Number.isFinite(minutes) ? minutes * 60 : 900;
  });

  // Timer countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  if (!recallSession) return <Navigate to="/choose-file-recall" replace />;

  // Format MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleGetResult = async () => {
    if (!text.trim()) {
      setErrorMessage('Write what you remember before requesting a result.');
      return;
    }
    setIsEvaluating(true);
    setErrorMessage('');
    setReport(null);
    try {
      const response = await fetch('http://localhost:3000/recall/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: recallSession.sessionId, recallText: text }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to evaluate your recall.');
      setReport(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 max-w-5xl mx-auto">
      <div className="relative flex flex-col items-center justify-center pt-2">
        <Link to="/active-recall" className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs md:text-sm text-[#948979] hover:text-[#DFD0B8] transition-colors bg-[#393E46]/40 px-3.5 py-2 rounded-xl border border-[#948979]/25">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Sessions</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#DFD0B8] tracking-tight font-['Outfit']">Active Recall Sessions</h1>
          <p className="mt-1 text-xs md:text-sm text-[#948979]">{recallSession.topic} · {recallSession.fileName}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#393E46]/50 p-4 md:p-5 rounded-2xl border border-[#948979]/20 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#222831] px-4 py-2.5 rounded-xl border border-[#948979]/30">
          <Clock className="w-4 h-4 text-[#DFD0B8] animate-pulse" />
          <div className="flex items-baseline gap-1.5"><span className="text-xs text-[#948979] uppercase font-semibold">Timer</span><span className="font-mono text-lg md:text-xl font-bold text-[#DFD0B8]">{formatTime(seconds)}</span></div>
        </div>
        <div className="flex items-center gap-3"><button type="button" onClick={handleGetResult} disabled={isEvaluating} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-all shadow-lg shadow-[#DFD0B8]/10 hover:scale-[1.02] disabled:opacity-60"><Sparkles className={`w-4 h-4 text-[#222831] ${isEvaluating ? 'animate-spin' : ''}`} /><span>{isEvaluating ? 'Checking Recall…' : 'Get Result'}</span></button></div>
      </div>

      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#948979]/20">
          <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#DFD0B8]" /><span className="text-sm font-semibold text-[#DFD0B8]">Recall Workspace: Write Everything You Remember</span></div>
          <div className="flex items-center gap-3 text-xs text-[#948979]"><span>Words: <strong className="text-[#DFD0B8]">{wordCount}</strong></span><span>•</span><span>Characters: <strong className="text-[#DFD0B8]">{charCount}</strong></span></div>
        </div>
        <div className="relative"><textarea value={text} onChange={(e) => { setText(e.target.value); setReport(null); }} rows={16} placeholder="This is a big text area. Begin typing your active recall notes, core concepts, formulas, definitions, and mental models here without consulting your study resources..." className="w-full bg-[#222831] text-[#DFD0B8] placeholder-[#948979]/60 rounded-2xl border border-[#948979]/30 focus:border-[#DFD0B8] focus:ring-2 focus:ring-[#DFD0B8]/20 focus:outline-none p-5 md:p-6 text-base md:text-lg leading-relaxed resize-y font-['Plus_Jakarta_Sans'] shadow-inner transition-all" /></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#948979]">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Spaced retrieval mode active • No references permitted</span></div>
          <button type="button" onClick={() => setText('')} className="flex items-center gap-1.5 text-xs text-[#948979] hover:text-[#DFD0B8] transition-colors"><RotateCcw className="w-3.5 h-3.5" /><span>Clear Textarea</span></button>
        </div>
      </div>

      {errorMessage && <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200 flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{errorMessage}</div>}

      {report && (
        <section className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#948979]/20 pb-4">
            <div><h2 className="text-xl font-extrabold text-[#DFD0B8]">Recall Report</h2><p className="text-sm text-[#948979] mt-1">{report.feedback}</p></div>
            <div className={`rounded-2xl px-5 py-3 text-center font-extrabold ${report.accuracyPercentage >= 70 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}><span className="block text-2xl">{report.accuracyPercentage}%</span><span className="text-xs uppercase tracking-wider">Accuracy</span></div>
          </div>
          <p className={`rounded-2xl p-4 text-sm font-semibold ${report.accuracyPercentage >= 70 ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-100'}`}>{report.recommendation}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <ReportList title="Missing topics" items={report.missingTopics} emptyMessage="No major topics were missed." />
            <ReportList title="Incorrect points" items={report.incorrectPoints} emptyMessage="No factual inaccuracies found." />
          </div>
          <ReportList title="What you remembered well" items={report.strengths} emptyMessage="Keep practicing to build stronger recall." />
        </section>
      )}
    </div>
  );
}

function ReportList({ title, items, emptyMessage }) {
  return <div className="rounded-2xl bg-[#222831]/70 border border-[#948979]/20 p-4"><h3 className="text-sm font-bold text-[#DFD0B8] mb-2">{title}</h3>{items?.length ? <ul className="space-y-2 text-sm text-[#DFD0B8]/80 list-disc pl-5">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul> : <p className="text-sm text-[#948979]">{emptyMessage}</p>}</div>;
}
