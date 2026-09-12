import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, GraduationCap, LockKeyhole, Mail, UserRound } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const isSignup = mode === 'signup';

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/overview');
  };

  return <div className="min-h-screen w-full bg-[#222831] text-[#DFD0B8] grid lg:grid-cols-2">
    <section className="hidden lg:flex relative overflow-hidden p-12 xl:p-16 flex-col justify-between bg-[#393E46] border-r border-[#948979]/20">
      <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#DFD0B8]/10 blur-3xl" />
      <div className="relative flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#222831] border border-[#948979]/40 grid place-items-center"><GraduationCap className="w-6 h-6" /></div><span className="text-2xl font-extrabold tracking-wide">PrepMate</span></div>
      <div className="relative max-w-lg"><p className="text-sm uppercase tracking-[0.22em] text-[#948979] font-bold">Your study companion</p><h1 className="mt-4 text-5xl font-extrabold leading-tight">Study with clarity. Recall with confidence.</h1><p className="mt-6 text-lg leading-relaxed text-[#DFD0B8]/75">Prepare for viva sessions, strengthen active recall, and keep your learning materials in one focused workspace.</p><div className="mt-10 grid grid-cols-2 gap-4"><Feature icon={Brain} label="Active Recall" /><Feature icon={BookOpen} label="AI Viva Practice" /></div></div>
      <p className="relative text-sm text-[#948979]">Build better study habits, one session at a time.</p>
    </section>

    <section className="flex items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex justify-center items-center gap-2 mb-10"><GraduationCap className="w-7 h-7" /><span className="text-2xl font-extrabold">PrepMate</span></div>
        <div className="rounded-3xl bg-[#393E46] border border-[#948979]/30 p-6 sm:p-8 shadow-2xl">
          <div className="flex rounded-2xl bg-[#222831] p-1 border border-[#948979]/20"><button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${!isSignup ? 'bg-[#DFD0B8] text-[#222831]' : 'text-[#948979] hover:text-[#DFD0B8]'}`}>Log in</button><button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${isSignup ? 'bg-[#DFD0B8] text-[#222831]' : 'text-[#948979] hover:text-[#DFD0B8]'}`}>Sign up</button></div>
          <div className="mt-8"><h2 className="text-2xl font-extrabold">{isSignup ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm text-[#948979]">{isSignup ? 'Start building a better study routine today.' : 'Log in to continue your learning journey.'}</p></div>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isSignup && <Field label="Full name" type="text" icon={UserRound} placeholder="Your name" />}
            <Field label="Email address" type="email" icon={Mail} placeholder="you@example.com" />
            <Field label="Password" type="password" icon={LockKeyhole} placeholder="••••••••" />
            {isSignup && <Field label="Confirm password" type="password" icon={LockKeyhole} placeholder="••••••••" />}
            <button type="submit" className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#DFD0B8] py-3.5 text-sm font-extrabold text-[#222831] hover:bg-[#b3a898] transition-colors">{isSignup ? 'Create account' : 'Log in'}<ArrowRight className="w-4 h-4" /></button>
          </form>
          <p className="mt-6 text-center text-xs text-[#948979]">{isSignup ? 'Already have an account?' : 'New to PrepMate?'} <button type="button" onClick={() => setMode(isSignup ? 'login' : 'signup')} className="font-bold text-[#DFD0B8] hover:underline">{isSignup ? 'Log in' : 'Create an account'}</button></p>
        </div>
      </div>
    </section>
  </div>;
}

function Field({ label, type, icon: Icon, placeholder }) {
  return <label className="block"><span className="text-xs font-bold text-[#DFD0B8]">{label}</span><span className="mt-2 flex items-center gap-2 rounded-xl bg-[#222831] border border-[#948979]/30 px-3.5 py-3 focus-within:border-[#DFD0B8]"><Icon className="w-4 h-4 text-[#948979]" /><input required type={type} placeholder={placeholder} className="w-full bg-transparent outline-none text-sm placeholder:text-[#948979]/60" /></span></label>;
}

function Feature({ icon: Icon, label }) {
  return <div className="rounded-2xl bg-[#222831]/60 border border-[#948979]/20 p-4"><Icon className="w-5 h-5" /><p className="mt-2 text-sm font-bold">{label}</p></div>;
}
