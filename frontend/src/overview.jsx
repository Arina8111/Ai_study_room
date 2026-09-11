import { Link } from 'react-router-dom';
import { 
  Mic2, 
  Brain, 
  BarChart3, 
  Clock, 
  Calendar, 
  Plus, 
  BookOpen 
} from 'lucide-react';


export default function Overview() {
  const vivaSessions = [
    { id: 1, topic: 'Topic 1', duration: '10 Min', date: '11/9/26', score: 'Score' },
    { id: 2, topic: 'Topic 2', duration: '15 Min', date: '10/9/26', score: '9.2' },
    { id: 3, topic: 'Topic 3', duration: '12 Min', date: '08/9/26', score: '8.8' },
  ];

  const recallSessions = [
    { id: 1, topic: 'Topic Name 1', accuracy: '92%', duration: '15 Min' },
    { id: 2, topic: 'Topic Name 2', accuracy: '85%', duration: '20 Min' },
    { id: 3, topic: 'Topic Name 3', accuracy: '78%', duration: '10 Min' },
  ];

  const notesList = [
    { id: 1, topic: 'Topic Name 1', duration: '8 Min Read', date: 'Yesterday' },
    { id: 2, topic: 'Topic Name 2', duration: '12 Min Read', date: '3 Days Ago' },
    { id: 3, topic: 'Topic Name 3', duration: '5 Min Read', date: 'Last Week' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs md:text-sm font-semibold tracking-wider text-[#948979]">
            Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#DFD0B8] tracking-tight mt-0.5">
            Good Evening, Arina
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/voice-session"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#393E46] text-[#DFD0B8] border border-[#948979]/40 font-medium text-sm hover:border-[#DFD0B8]/60 transition-colors"
          >
            <Mic2 className="w-4 h-4 text-[#DFD0B8]" />
            <span>Start Viva Sessions +</span>
          </Link>

          <Link
            to="/recall-session"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-colors"
          >
            <Brain className="w-4 h-4 text-[#222831]" />
            <span>Start Active Recall +</span>
          </Link>
        </div>
      </div>


      {/* Row 1: Graph Card (Left) & Last Viva Sessions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Graph Card */}
        <div className="lg:col-span-7 bg-[#393E46] rounded-3xl p-6 border border-[#948979]/30 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#DFD0B8]" />
              <h2 className="text-base md:text-lg font-bold text-[#DFD0B8] tracking-wide">
                Performance Analytics
              </h2>
            </div>
            <span className="text-xs text-[#948979]">Weekly Overview</span>
          </div>

          {/* Graphical Representation matching Image 1 */}
          <div className="relative bg-[#222831] rounded-2xl p-6 border border-[#948979]/20 overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 grid-rows-4 divide-x divide-y divide-[#DFD0B8]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} />
              ))}
            </div>

            {/* Custom SVG line + bar graph visual */}
            <div className="relative z-10">
              <svg viewBox="0 0 500 160" className="w-full h-40 overflow-visible">
                {/* SVG Bars */}

                {/* SVG Trend Line */}
                <path
                  d="M 30 110 Q 100 40, 180 80 T 320 50 T 440 30"
                  fill="none"
                  stroke="#DFD0B8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Nodes on trend line */}
                <circle cx="30" cy="110" r="5" fill="#DFD0B8" />
                <circle cx="120" cy="65" r="5" fill="#948979" />
                <circle cx="180" cy="80" r="5" fill="#DFD0B8" />
                <circle cx="260" cy="55" r="5" fill="#DFD0B8" />
                <circle cx="330" cy="50" r="6" fill="#DFD0B8" stroke="#222831" strokeWidth="2" />
                <circle cx="440" cy="30" r="6" fill="#DFD0B8" stroke="#222831" strokeWidth="2" />
              </svg>

            </div>
          </div>
        </div>

        {/* Right Card: Last Viva Sessions */}
        <div className="lg:col-span-5 bg-[#393E46] rounded-3xl p-6 border border-[#948979]/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-[#DFD0B8]" />
                <h2 className="text-base md:text-lg font-bold text-[#DFD0B8]">
                  Last Viva Sessions
                </h2>
              </div>
              <Link
                to="/voice-session"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222831] text-[#DFD0B8] border border-[#948979]/40 text-xs font-semibold hover:border-[#DFD0B8]/60 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </Link>
            </div>


            <div className="space-y-3">
              {vivaSessions.map((s, index) => (
                <div
                  key={s.id}
                  className="bg-[#222831] p-4 rounded-2xl border border-[#948979]/25 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#DFD0B8] font-medium">
                      {index + 1}. {s.topic}
                    </span>
                    <span className="flex items-center gap-1 text-[#948979] text-xs">
                      <Clock className="w-3 h-3 text-[#948979]" />
                      {s.duration}
                    </span>
                    <span className="flex items-center gap-1 text-[#948979] text-xs">
                      <Calendar className="w-3 h-3 text-[#948979]" />
                      {s.date}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#393E46] text-[#DFD0B8] border border-[#948979]/30">
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Active Recall Sessions */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-[#DFD0B8]" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#DFD0B8]">
                Recent Active Recall Sessions
              </h2>
              <p className="text-xs md:text-sm text-[#948979]">
                Show Past Sessions With Accuracy
              </p>
            </div>
          </div>
          <Link
            to="/recall-session"
            className="flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-xs hover:bg-[#b3a898] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#222831]" />
            <span>New Session</span>
          </Link>
        </div>

        <div className="space-y-3">
          {recallSessions.map((r, index) => (
            <div
              key={r.id}
              className="bg-[#222831] p-4 rounded-2xl border border-[#948979]/25 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#DFD0B8]">
                  {index + 1}. {r.topic}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#948979]">
                  <Clock className="w-3 h-3 text-[#948979]" />
                  {r.duration}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#393E46] text-[#DFD0B8] border border-[#948979]/30">
                {r.accuracy} Accuracy
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Review Your Notes */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#DFD0B8]" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#DFD0B8]">
                Review Your Notes
              </h2>
              <p className="text-xs md:text-sm text-[#948979]">
                Show Old Notes
              </p>
            </div>
          </div>
          <Link
            to="/notes"
            className="flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-xs hover:bg-[#b3a898] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#222831]" />
            <span>New Session</span>
          </Link>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notesList.map((n, index) => (
            <div
              key={n.id}
              className="bg-[#222831] p-4 rounded-2xl border border-[#948979]/25 space-y-2"
            >
              <p className="text-sm font-semibold text-[#DFD0B8]">
                {index + 1}. {n.topic}
              </p>
              <div className="flex items-center justify-between text-xs text-[#948979]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#948979]" />
                  {n.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#948979]" />
                  {n.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
