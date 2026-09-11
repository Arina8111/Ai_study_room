import { Link } from 'react-router-dom';
import { Mic2, Plus, FileText } from 'lucide-react';

export default function VivaSessions() {
  const sessions = [
    { id: 1, topic: 'Topic Name 1', score: '9.4' },
    { id: 2, topic: 'Topic Name 2', score: '8.8' },
    { id: 3, topic: 'Topic Name 3', score: '9.1' },
    { id: 4, topic: 'Topic Name 4', score: '8.5' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#393E46] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-md">
            <Mic2 className="w-5 h-5 text-[#DFD0B8]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#DFD0B8] tracking-tight">
            Start A New Session
          </h1>
        </div>

        {/* Action Button */}
        <Link
          to="/voice-session"
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#222831]" />
          <span>Start A New Session</span>
        </Link>
      </div>


      {/* Main Table */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#948979]/30 text-sm text-[#DFD0B8] font-medium">
                <th className="py-3 px-4">1. Topic Name</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 text-right">View Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#948979]/15 text-sm">
              {sessions.map((s, index) => (
                <tr key={s.id} className="hover:bg-[#222831]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#DFD0B8]">
                    {index + 1}. {s.topic}
                  </td>
                  <td className="py-4 px-4 text-[#DFD0B8]/90 font-medium">
                    {s.score}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#222831] text-[#DFD0B8] border border-[#948979]/40 text-xs font-semibold hover:border-[#DFD0B8]/60 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
