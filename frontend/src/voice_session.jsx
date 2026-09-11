import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  CameraOff
} from 'lucide-react';

export default function VoiceSession() {
  const [seconds, setSeconds] = useState(582); // 09:42 countdown
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

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

  const transcriptMessages = [
    { sender: 'AI', text: 'What is photosynthesis?', time: '09:55' },
    { sender: 'Me', text: 'It is a process used by plants and other organisms to convert light energy into chemical energy...', time: '09:48' },
    { sender: 'AI', text: 'Good. Where specifically do the light-dependent reactions take place inside the plant cell?', time: '09:44' },
    { sender: 'Me', text: 'They take place in the thylakoid membranes of chloroplasts, where chlorophyll absorbs photons.', time: '09:42' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Top Navigation & Center Title: AI VIVA ROOM */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <Link
          to="/viva-sessions"
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs md:text-sm text-[#948979] hover:text-[#DFD0B8] transition-colors bg-[#393E46]/40 px-3.5 py-2 rounded-xl border border-[#948979]/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Vivas</span>
        </Link>

        <h1 className="text-2xl md:text-4xl font-extrabold text-[#DFD0B8] tracking-tight font-['Outfit'] text-center uppercase">
          AI Viva Room
        </h1>
      </div>

      {/* Top Action Bar matching Wireframe: Left "timer" | Right "end session" */}
      <div className="flex items-center justify-between gap-4 bg-[#393E46]/50 p-4 md:p-5 rounded-2xl border border-[#948979]/20 shadow-md">
        {/* Left: Timer */}
        <div className="flex items-center gap-2.5 bg-[#222831] px-4 py-2.5 rounded-xl border border-[#948979]/30">
          <Clock className="w-4 h-4 text-[#DFD0B8] animate-pulse" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#948979] uppercase font-semibold">Timer</span>
            <span className="font-mono text-lg md:text-xl font-bold text-[#DFD0B8]">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Right: End Session Button */}
        <Link
          to="/viva-sessions"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all shadow-md"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Session</span>
        </Link>
      </div>

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
              {transcriptMessages.map((msg, idx) => {
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
          </div>

          {/* Transcript Footer Helper */}
          <div className="pt-3 border-t border-[#948979]/20 flex items-center justify-between text-xs text-[#948979]">
            <span>Continuous speech recognition active</span>
            <span className="text-[#DFD0B8] font-medium">Session auto-transcribing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
