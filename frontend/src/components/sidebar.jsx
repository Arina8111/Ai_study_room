import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Brain, 
  Mic2, 
  BookOpen, 
  FolderKanban, 
  Sparkles,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ onCloseMobile }) {
  const navItems = [
    { path: '/overview', label: 'Overview', icon: LayoutDashboard },
    { path: '/active-recall', label: 'Active Recall', icon: Brain },
    { path: '/viva-sessions', label: 'AI Viva Sessions', icon: Mic2 },
    { path: '/notes', label: 'Notes', icon: BookOpen },
    { path: '/materials', label: 'Materials', icon: FolderKanban },
  ];

  return (
    <aside className="w-64 md:w-72 bg-[#393E46] text-[#DFD0B8] flex flex-col justify-between shrink-0 h-full rounded-r-3xl md:rounded-r-[40px] shadow-2xl border-r border-[#948979]/20 transition-all duration-300">
      {/* Top Header & Branding */}
      <div>
        <div className="p-6 md:p-8 border-b border-[#948979]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#222831] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-inner">
              <GraduationCap className="w-5 h-5 text-[#DFD0B8]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-wide text-[#DFD0B8] font-['Outfit']">
                AI Study Room
              </h1>
              <p className="text-[11px] text-[#948979] tracking-wider font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#DFD0B8]" />
                Intelligent Learning
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links with React Router NavLink */}
        <nav className="p-4 md:p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#222831] text-[#DFD0B8] shadow-lg border border-[#948979]/30 font-semibold'
                      : 'text-[#DFD0B8]/80 hover:bg-[#222831]/50 hover:text-[#DFD0B8]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive 
                            ? 'bg-[#DFD0B8] text-[#222831]' 
                            : 'bg-[#222831]/60 text-[#948979] group-hover:text-[#DFD0B8] group-hover:bg-[#222831]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide text-sm md:text-base">
                        {item.label}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-5 rounded-full bg-[#DFD0B8] shadow-sm animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="p-4 md:p-6 border-t border-[#948979]/20">
        <div className="bg-[#222831]/70 p-3.5 rounded-2xl border border-[#948979]/25 flex items-center justify-between hover:border-[#948979]/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#948979] to-[#DFD0B8] flex items-center justify-center text-[#222831] font-bold text-sm shadow">
              AR
            </div>
            <div>
              <p className="text-sm font-semibold text-[#DFD0B8] leading-tight">Arina</p>
              <p className="text-xs text-[#948979]">arina@study.ai</p>
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Online" />
        </div>
      </div>
    </aside>
  );
}
