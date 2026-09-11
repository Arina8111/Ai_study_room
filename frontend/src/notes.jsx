import { BookOpen, Plus, Clock } from 'lucide-react';

export default function Notes() {
  const notes = [
    { id: 1, topic: 'Topic Name 1', accuracy: '90%', duration: '8 Min' },
    { id: 2, topic: 'Topic Name 2', accuracy: '85%', duration: '12 Min' },
    { id: 3, topic: 'Topic Name 3', accuracy: '94%', duration: '6 Min' },
    { id: 4, topic: 'Topic Name 4', accuracy: '88%', duration: '15 Min' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#393E46] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-md">
            <BookOpen className="w-5 h-5 text-[#DFD0B8]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#DFD0B8] tracking-tight">
            Notes
          </h1>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#222831]" />
          <span>Create New Notes</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#948979]/30 text-sm text-[#DFD0B8] font-medium">
                <th className="py-3 px-4">1. Topic Name</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4 text-right sm:text-left">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#948979]/15 text-sm">
              {notes.map((n, index) => (
                <tr key={n.id} className="hover:bg-[#222831]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#DFD0B8]">
                    {index + 1}. {n.topic}
                  </td>
                  <td className="py-4 px-4 text-[#DFD0B8]/90">
                    {n.accuracy}
                  </td>
                  <td className="py-4 px-4 text-[#948979] text-right sm:text-left">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#948979]" />
                      {n.duration}
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
