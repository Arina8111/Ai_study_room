import { Link } from 'react-router-dom';
import { Brain, Plus, Clock } from 'lucide-react';

export default function ActiveRecall() {
  const sessions = [
    { id: 1, topic: 'Linked List', accuracy: '58%', duration: '15 Min' },
    { id: 2, topic: 'Singly Linked List', accuracy: '84%', duration: '20 Min' },
    { id: 3, topic: 'Doubly Linked List', accuracy: '68%', duration: '10 Min' },
    { id: 4, topic: 'Circular Linked List', accuracy: '94%', duration: '25 Min' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#393E46] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-md">
            <Brain className="w-5 h-5 text-[#DFD0B8]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#DFD0B8] tracking-tight">
            Active Recall Sessions
          </h1>
        </div>

        {/* Action Button */}
        <Link
          to="/choose-file-recall"
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
                <th className="py-3 px-4">Topics</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4 text-right sm:text-left">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#948979]/15 text-sm">
              {sessions.map((s, index) => (
                <tr key={s.id} className="hover:bg-[#222831]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#DFD0B8]">
                    {index + 1}. {s.topic}
                  </td>
                  <td className="py-4 px-4 text-[#DFD0B8]/90">
                    {s.accuracy}
                  </td>
                  <td className="py-4 px-4 text-[#948979] text-right sm:text-left">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#948979]" />
                      {s.duration}
                    </span>
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
