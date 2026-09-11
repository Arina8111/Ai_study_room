import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Overview from './overview';
import ActiveRecall from './active_recall';
import VivaSessions from './viva_sessions';
import Notes from './notes';
import Materials from './materials';
import RecallSession from './recall_session';
import VoiceSession from './voice_session';
import ChooseMaterial from './choose_material';
import { Menu, X, GraduationCap } from 'lucide-react';
import './index.css';



function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#222831] text-[#DFD0B8] flex flex-col md:flex-row antialiased selection:bg-[#948979]/40 selection:text-[#DFD0B8]">
      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#393E46] border-b border-[#948979]/20 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#222831] border border-[#948979]/40 flex items-center justify-center text-[#DFD0B8]">
            <GraduationCap className="w-4 h-4 text-[#DFD0B8]" />
          </div>
          <span className="font-extrabold text-base tracking-wide text-[#DFD0B8]">
            AI Study Room
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#222831] text-[#DFD0B8] border border-[#948979]/30"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden flex">
          <div className="w-72 max-w-[80vw] h-full flex flex-col justify-between">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div 
            className="flex-1 h-full" 
            onClick={() => setMobileMenuOpen(false)} 
          />
        </div>
      )}

      {/* Desktop Persistent Sidebar - full length of page */}
      <div className="hidden md:flex flex-col shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content Area: Routes */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/active-recall" element={<ActiveRecall />} />
          <Route path="/viva-sessions" element={<VivaSessions />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/recall-session" element={<RecallSession />} />
          <Route path="/voice-session" element={<VoiceSession />} />
          <Route path="/choose_material" element={<ChooseMaterial />} />
          <Route path="/choose-material" element={<Navigate to="/choose_material" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />


        </Routes>
      </main>
    </div>
  );
}

export default App;
