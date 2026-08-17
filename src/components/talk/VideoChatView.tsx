'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Subtitles, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  Maximize2,
  Activity,
  Award,
  Pause,
  Play
} from 'lucide-react';
import { ChatMode } from './TalkModeSelector';

interface VideoChatViewProps {
  topic: string;
  onEndCall: () => void;
  onSwitchMode: (mode: ChatMode) => void;
}

export function VideoChatView({ topic, onEndCall, onSwitchMode }: VideoChatViewProps) {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // WebRTC User video ref
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // Speech simulation captions
  const [caption, setCaption] = useState(
    "Welcome to your HD Video session! I'm watching your pronunciation clarity and mouth posture. Let's discuss your favorite hobbies."
  );

  // Initialize WebRTC webcam if camera is on
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraOn && !isPaused && typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          setHasCameraPermission(true);
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = mediaStream;
          }
        })
        .catch(() => {
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-[2rem] text-white overflow-hidden relative border border-slate-800 shadow-2xl">
      {/* Video Call Top Bar */}
      <div className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-20 shrink-0">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Video size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base text-white">AI HD Video Avatar</h2>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isPaused ? 'bg-amber-400' : 'bg-purple-500 animate-ping'}`} />
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                  {isPaused ? 'Paused' : '1080p Stream'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[200px] sm:max-w-none">
                Topic: <span className="text-slate-200 font-medium">{topic}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timer & Quick Mode Switches */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
            isPaused
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-purple-400'
          }`}>
            {isPaused && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            <span>{formatTime(callDuration)}</span>
            {isPaused && <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-300 ml-0.5">Paused</span>}
          </div>

          <div className="flex items-center bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => onSwitchMode('voice')}
              title="Switch to Voice Chat"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
            >
              <Mic size={13} />
              <span className="hidden sm:inline">Voice</span>
            </button>
            <button
              onClick={() => onSwitchMode('text')}
              title="Switch to Text Chat"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Viewport Stage */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* AI Tutor Avatar Video Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Animated Stylized AI Mentor Avatar Stream */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950">
            {/* AI Avatar Canvas / Avatar Graphics */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-48 h-48 lg:w-60 lg:h-60 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-1.5 shadow-2xl shadow-purple-500/20"
              >
                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&eyebrows=default&facialHairProbability=0&style=circle" 
                    alt="AI Video Tutor Avatar" 
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
              </motion.div>

              {/* Speaking Indicator Badge */}
              <div className={`absolute -bottom-3 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border ${
                isPaused 
                  ? 'bg-amber-600 border-amber-400' 
                  : 'bg-purple-600 border-purple-400'
              }`}>
                {isPaused ? (
                  <>
                    <Pause size={12} />
                    <span>Video Talk Paused</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="animate-spin" />
                    <span>AI Tutor Speaking</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Linguistic Feedback HUD Overlay (Top-Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-xl max-w-xs space-y-2.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Activity size={14} className="text-purple-400" />
              <span>Real-Time Feedback HUD</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fluency</p>
                <p className="text-sm font-extrabold text-green-400">94% <span className="text-[10px] text-slate-400 font-normal">Band 7.5</span></p>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pronunciation</p>
                <p className="text-sm font-extrabold text-blue-400">91% <span className="text-[10px] text-slate-400 font-normal">Clear</span></p>
              </div>
            </div>
          </motion.div>

          {/* User Webcam Picture-in-Picture (PiP) Overlay (Bottom-Right / Top-Right) */}
          <div className="absolute top-4 right-4 z-10 w-36 h-48 lg:w-44 lg:h-56 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex items-center justify-center">
            {isCameraOn ? (
              hasCameraPermission ? (
                <video 
                  ref={userVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                    <User size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">You (Webcam)</span>
                  <span className="text-[9px] text-slate-500">Preview Mode</span>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <VideoOff size={24} className="text-slate-500 mb-2" />
                <span className="text-[10px] font-bold text-slate-400">Camera Off</span>
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300 backdrop-blur-xs">
              ME
            </div>
          </div>

          {/* Subtitles Overlay at Bottom */}
          {showCaptions && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 inset-x-6 lg:inset-x-20 z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-center shadow-xl"
            >
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {isPaused ? '"Video session is paused. Click Resume to continue talking with AI."' : `"${caption}"`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Call Control Toolbar */}
      <div className="p-3 sm:p-5 lg:p-6 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Captions Toggle Button */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            title="Toggle Live Subtitles"
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showCaptions
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Subtitles size={16} />
            <span className="hidden md:inline">Captions</span>
          </button>

          {/* Pause / Resume Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume video conversation" : "Pause video conversation"}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isPaused ? (
              <>
                <Play size={16} className="fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Call Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCameraOn(!isCameraOn)}
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              !isCameraOn
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isCameraOn ? <Video size={17} /> : <VideoOff size={17} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndCall}
            title="End Video Session"
            className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all cursor-pointer shrink-0"
          >
            <PhoneOff size={18} className="sm:hidden" />
            <PhoneOff size={22} className="hidden sm:block" />
          </motion.button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
          {isPaused ? (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Paused</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 size={14} className="text-purple-400" />
              <span>AI Vision HUD Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoChatView;
