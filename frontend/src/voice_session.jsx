import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Clock, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ArrowLeft, 
  PhoneOff, 
  User, 
  Bot,
  CameraOff,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function VoiceSession() {
  const [activeSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('active_viva_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [socketStatus, setSocketStatus] = useState('Connecting');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [vivaError, setVivaError] = useState('');
  const socketRef = useRef(null);

  // Initialize timer based on duration
  const [seconds, setSeconds] = useState(() => {
    if (activeSession?.duration) {
      if (activeSession.duration === 'No Limit') return 0;
      const parsed = parseInt(activeSession.duration);
      if (!isNaN(parsed) && parsed > 0) return parsed * 60;
    }
    return 582; // default 09:42 countdown
  });

  const isCountUp = activeSession?.duration === 'No Limit';
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer countdown / countup
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (isCountUp) return prev + 1;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCountUp]);

  // Request & attach real webcam stream
  useEffect(() => {
    let mounted = true;

    async function initWebcam() {
      if (!isVideoOn) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraPermissionGranted(false);
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });

          if (mounted) {
            streamRef.current = stream;
            setCameraPermissionGranted(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } else {
            stream.getTracks().forEach((track) => track.stop());
          }
        }
      } catch (err) {
        console.warn('Unable to access user webcam or permission dismissed:', err);
        if (mounted) {
          setCameraPermissionGranted(false);
        }
      }
    }

    initWebcam();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  // Handle Mute Toggle
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // toggle
      });
    }
    setIsMuted(!isMuted);
  };

  // Handle Video Toggle
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!activeSession?.sessionId) {
      setVivaError('No saved viva session was found. Analyze a material before starting.');
      return undefined;
    }

    const socket = io('http://localhost:3000');
    socketRef.current = socket;
    socket.on('connect', () => {
      setSocketStatus('Connected');
      socket.emit('viva:start', { sessionId: activeSession.sessionId });
    });
    socket.on('viva:started', ({ question, totalQuestions: total }) => {
      setTotalQuestions(total);
      setCurrentQuestion(question);
      setMessages([{ sender: 'AI', text: question.question, time: 'Question 1' }]);
    });
    socket.on('viva:evaluating', () => setIsEvaluating(true));
    socket.on('viva:evaluation', ({ evaluation, nextQuestion, completed, totalQuestions: total }) => {
      setIsEvaluating(false);
      setTotalQuestions(total);
      setMessages((previous) => [
        ...previous,
        { sender: 'AI', text: `Score: ${evaluation.score}/10. ${evaluation.feedback}`, time: 'Evaluation' },
        ...(nextQuestion ? [{ sender: 'AI', text: nextQuestion.question, time: `Question ${nextQuestion.number}` }] : [{ sender: 'AI', text: 'Viva completed. Your responses have been saved.', time: 'Complete' }]),
      ]);
      setCurrentQuestion(nextQuestion);
      if (completed) setSocketStatus('Completed');
    });
    socket.on('viva:error', ({ message }) => {
      setIsEvaluating(false);
      setVivaError(message);
    });
    socket.on('disconnect', () => setSocketStatus('Disconnected'));
    return () => socket.disconnect();
  }, [activeSession?.sessionId]);

  const submitTranscript = (event) => {
    event.preventDefault();
    const transcript = answer.trim();
    if (!transcript || !currentQuestion || isEvaluating) return;
    setMessages((previous) => [...previous, { sender: 'Me', text: transcript, time: 'Your answer' }]);
    setAnswer('');
    socketRef.current?.emit('viva:transcript', { sessionId: activeSession.sessionId, transcript });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Top Navigation & Center Title: AI VIVA ROOM */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <Link
          to="/choose_material"
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs md:text-sm text-[#948979] hover:text-[#DFD0B8] transition-colors bg-[#393E46]/40 px-3.5 py-2 rounded-xl border border-[#948979]/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Change Material</span>
        </Link>

        <h1 className="text-2xl md:text-4xl font-extrabold text-[#DFD0B8] tracking-tight font-['Outfit'] text-center uppercase">
          AI Viva Room
        </h1>
      </div>

      {/* Top Action Bar: Timer | Active Topic | End Session */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#393E46]/50 p-4 md:p-5 rounded-2xl border border-[#948979]/20 shadow-md">
        {/* Left: Timer */}
        <div className="flex items-center gap-2.5 bg-[#222831] px-4 py-2.5 rounded-xl border border-[#948979]/30">
          <Clock className="w-4 h-4 text-[#DFD0B8] animate-pulse" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#948979] uppercase font-semibold">
              {isCountUp ? 'Elapsed' : 'Timer'}
            </span>
            <span className="font-mono text-lg md:text-xl font-bold text-[#DFD0B8]">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Center: Active Material / Topic badge */}
        {activeSession && (
          <div className="flex items-center gap-2 text-center">
            <Sparkles className="w-4 h-4 text-[#DFD0B8]" />
            <span className="text-xs md:text-sm font-bold text-[#DFD0B8] truncate max-w-xs md:max-w-md">
              {activeSession.topic || activeSession.fileName}
            </span>
          </div>
        )}

        {/* Right: End Session Button */}
        <Link
          to="/viva-sessions"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all shadow-md"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Session</span>
        </Link>
      </div>

      {/* Question state is supplied one at a time over WebSocket. */}
      {currentQuestion && (
        <div className="bg-[#393E46] p-4 rounded-2xl border border-[#948979]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#DFD0B8]" />
            <span className="text-xs uppercase font-bold text-[#948979]">Viva Question:</span>
            <span className="text-sm font-extrabold text-[#DFD0B8]">
              {currentQuestion.number} of {totalQuestions}
            </span>
            {currentQuestion.difficulty && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  currentQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : currentQuestion.difficulty === 'Medium'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            )}
            {currentQuestion.keyConcept && (
              <span className="hidden md:inline text-[11px] text-[#948979] bg-[#222831] px-2 py-0.5 rounded">
                Concept: {currentQuestion.keyConcept}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Two-Column Grid: Left User Video Input Frame | Right Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: User Video Input Frame with Camera & Mic Controls */}
        <div className="lg:col-span-6 bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-2xl flex flex-col justify-between items-center space-y-6">
          <div className="w-full flex flex-col items-center">
            {/* User Video Frame */}
            <div className="w-full aspect-video bg-[#222831] rounded-2xl border border-[#948979]/30 shadow-2xl relative overflow-hidden flex items-center justify-center ring-1 ring-[#948979]/30">
              {/* Actual HTML5 Video Element for User Video Input */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  isVideoOn && cameraPermissionGranted ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />

              {/* Placeholder when Camera is off or waiting for permissions */}
              {(!isVideoOn || !cameraPermissionGranted) && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 select-none">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#393E46] border-2 border-[#948979]/40 flex items-center justify-center text-[#DFD0B8] shadow-inner">
                    {isVideoOn ? (
                      <User className="w-10 h-10 md:w-12 md:h-12 text-[#DFD0B8]" />
                    ) : (
                      <CameraOff className="w-10 h-10 md:w-12 md:h-12 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#DFD0B8]">
                      {isVideoOn ? 'User Video Feed (Camera Ready)' : 'Camera Is Turned Off'}
                    </p>
                    <p className="text-xs text-[#948979] mt-0.5 max-w-xs">
                      {isVideoOn
                        ? 'Allow camera permissions in browser to show live video feed'
                        : 'Click camera button below to turn your video on'}
                    </p>
                  </div>
                </div>
              )}

              {/* Video Overlay Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#222831]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-[#948979]/30 text-xs font-semibold text-[#DFD0B8] z-20">
                <span className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>You (Arina)</span>
              </div>

              {isMuted && (
                <div className="absolute top-3 right-3 bg-rose-500/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow z-20">
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-[#222831]/75 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-[#948979]/20 text-[10px] text-[#948979] z-20">
                {isVideoOn ? 'HD 720p' : 'Audio Only'}
              </div>
            </div>
          </div>

          {/* User Video Controls underneath the screen matching wireframe: Mic + Camera */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-center justify-center gap-5">
              {/* Microphone Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-4 rounded-2xl border transition-all shadow-lg flex items-center justify-center group ${
                  isMuted
                    ? 'bg-rose-950/50 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
                    : 'bg-[#222831] border-[#948979]/40 text-[#DFD0B8] hover:border-[#DFD0B8]'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-rose-400" />
                ) : (
                  <Mic className="w-6 h-6 text-[#DFD0B8] group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={toggleVideo}
                className={`p-4 rounded-2xl border transition-all shadow-lg flex items-center justify-center group ${
                  !isVideoOn
                    ? 'bg-rose-950/50 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
                    : 'bg-[#222831] border-[#948979]/40 text-[#DFD0B8] hover:border-[#DFD0B8]'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? (
                  <Video className="w-6 h-6 text-[#DFD0B8] group-hover:scale-110 transition-transform" />
                ) : (
                  <VideoOff className="w-6 h-6 text-rose-400" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#948979]">
              {isMuted ? 'Microphone muted' : 'Microphone active'} • {isVideoOn ? 'Camera active' : 'Camera disabled'}
            </p>
          </div>
        </div>

        {/* Right Card: Live Transcript */}
        <div className="lg:col-span-6 bg-[#393E46] rounded-3xl p-6 md:p-8 border border-[#948979]/30 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#948979]/20 mb-4">
              <h2 className="text-lg md:text-xl font-bold text-[#DFD0B8] capitalize">
                Transcript
              </h2>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-[#222831] px-2.5 py-1 rounded-lg border border-[#948979]/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>

            {/* Transcript Messages matching wireframe sketch */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAI
                        ? 'bg-[#222831] border-[#948979]/30 text-[#DFD0B8]'
                        : 'bg-[#222831]/60 border-[#948979]/20 text-[#DFD0B8]/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isAI ? (
                          <span className="w-6 h-6 rounded-lg bg-[#393E46] text-[#DFD0B8] flex items-center justify-center text-xs font-bold border border-[#948979]/30">
                            <Bot className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-lg bg-[#DFD0B8] text-[#222831] flex items-center justify-center text-xs font-bold">
                            <User className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#DFD0B8]">
                          {msg.sender === 'AI' ? 'Ai:' : 'Me:'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#948979]">{msg.time}</span>
                    </div>

                    <p className="text-sm md:text-base leading-relaxed pl-8">
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>
            {vivaError && <p className="mt-3 text-xs text-rose-400">{vivaError}</p>}
          </div>

          <form onSubmit={submitTranscript} className="pt-3 border-t border-[#948979]/20 space-y-2">
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={!currentQuestion || isEvaluating} rows="3" placeholder="Type the live transcript or your answer…" className="w-full resize-none rounded-xl bg-[#222831] border border-[#948979]/30 p-3 text-sm text-[#DFD0B8] outline-none focus:border-[#DFD0B8] disabled:opacity-50" />
            <div className="flex items-center justify-between text-xs text-[#948979]">
              <span>{isEvaluating ? 'Gemini is evaluating your answer…' : `WebSocket: ${socketStatus}`}</span>
              <button type="submit" disabled={!answer.trim() || !currentQuestion || isEvaluating} className="rounded-lg bg-[#DFD0B8] px-3 py-2 font-bold text-[#222831] disabled:opacity-50">Submit answer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
