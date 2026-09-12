import { FolderKanban, Plus, School, Layers, User } from 'lucide-react';

export default function Materials() {
  const materials = [
    { id: 1, topic: 'Linked List', pages: '42 Pages', author: 'Author 1' },
    { id: 2, topic: 'Singly Linked List', pages: '180 Pages', author: 'Author 2' },
    { id: 3, topic: 'Doubly Linked List', pages: '312 Pages', author: 'Author 3' },
    { id: 4, topic: 'Circular Linked List', pages: '64 Pages', author: 'Author 4' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#393E46] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-md">
            <FolderKanban className="w-5 h-5 text-[#DFD0B8]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#DFD0B8] tracking-tight">
            My Materials
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#393E46] text-[#DFD0B8] border border-[#948979]/40 font-medium text-sm hover:border-[#DFD0B8]/60 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#DFD0B8]" />
            <span>Add Material</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#DFD0B8] text-[#222831] font-bold text-sm hover:bg-[#b3a898] transition-colors"
          >
            <School className="w-4 h-4 text-[#222831]" />
            <span>Connect To Google Classrooms</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#948979]/30 text-sm text-[#DFD0B8] font-medium">
                <th className="py-3 px-4">Topics</th>
                <th className="py-3 px-4">No. of Pages</th>
                <th className="py-3 px-4 text-right sm:text-left">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#948979]/15 text-sm">
              {materials.map((m, index) => (
                <tr key={m.id} className="hover:bg-[#222831]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#DFD0B8]">
                    {index + 1}. {m.topic}
                  </td>
                  <td className="py-4 px-4 text-[#DFD0B8]/90">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#948979]" />
                      {m.pages}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#948979] text-right sm:text-left">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#948979]" />
                      Unknown
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
