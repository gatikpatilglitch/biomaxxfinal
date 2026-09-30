import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Sparkles, 
  Gamepad2, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Music,
  Send, 
  Bot, 
  Clock, 
  Smile, 
  Heart,
  Droplet,
  Coffee,
  Plus,
  HelpCircle,
  Trees,
  Leaf,
  Waves,
  Bell,
  Moon,
  Sun,
  Bed
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

const MEDITATION_TRACKS = [
  {
    id: 'ravi',
    title: 'Ravi Music',
    artist: 'Ravi',
    badge: 'SIGNATURE THEME',
    durationLabel: 'MEDITATION',
    desc: 'Signature opening ambient soundtrack for BioMaxxx to calm breathing, reduce stress & center the mind.',
    src: '/audio/ravi_music.mp3',
    fallbackSrc: '/audio/ravi_music.mp3'
  },
  {
    id: 'nature',
    title: 'Nature Meditation',
    artist: 'Arulo',
    badge: 'NATURE SOUNDS',
    durationLabel: '10 MIN SESSION',
    desc: 'Soothing organic ambient synth by Arulo for natural calm, forest breathing & vagal balance.',
    src: '/audio/nature_meditation_arulo.mp3',
    fallbackSrc: 'https://assets.mixkit.co/music/345/345.mp3'
  },
  {
    id: 'deep',
    title: 'Deep Meditation',
    artist: 'David Fesliyan',
    badge: 'DEEP RELAX',
    durationLabel: '10 MIN SESSION',
    desc: 'Harmonic atmospheric soundscape by David Fesliyan for deep mental tranquility & cortisol reduction.',
    src: '/audio/deep_meditation_david_fesliyan.mp3',
    fallbackSrc: 'https://www.fesliyanstudios.com/musicfiles/2019-04-06_-_Deep_Meditation_-_David_Fesliyan.mp3'
  }
];
import MindfulMazeGame from './MindfulMazeGame';
import ColorCalmGame from './ColorCalmGame';
import BreatheAndPlayGame from './BreatheAndPlayGame';
import ZenPatternsGame from './ZenPatternsGame';

export default function ActionsScreen() {
  const { 
    actionsSubView, 
    setActionsSubView, 
    inhalerData, 
    logInhalerDose, 
    toggleMedication,
    reminders,
    toggleReminder,
    saveSymptom,
    whoopData,
    alarmSettings,
    toggleAlarmSetting,
    updateAlarmTime,
    triggerAlarm,
    setActiveTab,
    setGuardianSubView
  } = useWhoopData();

  // Breathing 4-7-8 State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale (4s), Hold (7s), Exhale (8s)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Daily Calm Meditation Audio State (Ravi Music, Nature Meditation by Arulo & Deep Meditation by David Fesliyan)
  const meditationAudioRef = useRef(null);
  const [selectedTrackId, setSelectedTrackId] = useState('ravi'); // Default to Ravi Music
  const [isMeditationPlaying, setIsMeditationPlaying] = useState(false);
  const [meditationElapsed, setMeditationElapsed] = useState(0); // 0 to 600s (10 mins)
  const [isMeditationMuted, setIsMeditationMuted] = useState(false);

  const activeTrack = MEDITATION_TRACKS.find(t => t.id === selectedTrackId) || MEDITATION_TRACKS[0];

  // Ensure volume is unmuted and at 100% on mount
  useEffect(() => {
    if (meditationAudioRef.current) {
      meditationAudioRef.current.volume = 1.0;
    }
  }, []);

  // 10-Minute Meditation Timer Loop
  useEffect(() => {
    let interval = null;
    if (isMeditationPlaying) {
      interval = setInterval(() => {
        setMeditationElapsed((prev) => {
          if (prev >= 600) {
            if (meditationAudioRef.current) {
              meditationAudioRef.current.pause();
            }
            setIsMeditationPlaying(false);
            soundFx.playPopSound(1.8);
            return 600;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditationPlaying]);

  const selectTrack = (trackId, autoPlay = true) => {
    const track = MEDITATION_TRACKS.find(t => t.id === trackId) || MEDITATION_TRACKS[0];
    setSelectedTrackId(track.id);
    setMeditationElapsed(0);
    if (meditationAudioRef.current) {
      meditationAudioRef.current.pause();
      meditationAudioRef.current.src = track.src;
      meditationAudioRef.current.currentTime = 0;
      meditationAudioRef.current.load();
      if (autoPlay) {
        const p = meditationAudioRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            setIsMeditationPlaying(true);
            soundFx.playPopSound(1.4);
          }).catch((err) => {
            console.warn("Autoplay blocked or fallback:", err);
            if (track.fallbackSrc) {
              meditationAudioRef.current.src = track.fallbackSrc;
              meditationAudioRef.current.load();
              meditationAudioRef.current.play()
                .then(() => setIsMeditationPlaying(true))
                .catch(() => setIsMeditationPlaying(false));
            } else {
              setIsMeditationPlaying(false);
            }
          });
        }
      } else {
        setIsMeditationPlaying(false);
      }
    }
  };

  const toggleMeditationAudio = () => {
    if (!meditationAudioRef.current) return;
    if (isMeditationPlaying) {
      meditationAudioRef.current.pause();
      setIsMeditationPlaying(false);
      soundFx.playPopSound(0.85);
    } else {
      if (!meditationAudioRef.current.src || !meditationAudioRef.current.src.includes(activeTrack.src.replace('/audio/', ''))) {
        meditationAudioRef.current.src = activeTrack.src;
        meditationAudioRef.current.load();
      }
      const playPromise = meditationAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMeditationPlaying(true);
            soundFx.playPopSound(1.4);
          })
          .catch((err) => {
            console.warn("Audio playback error, trying fallback:", err);
            if (activeTrack.fallbackSrc && meditationAudioRef.current.src !== activeTrack.fallbackSrc) {
              meditationAudioRef.current.src = activeTrack.fallbackSrc;
              meditationAudioRef.current.load();
              meditationAudioRef.current.play()
                .then(() => setIsMeditationPlaying(true))
                .catch(() => setIsMeditationPlaying(false));
            } else {
              setIsMeditationPlaying(false);
            }
          });
      }
    }
  };

  const handleSelectNatureSounds = () => {
    if (selectedTrackId !== 'nature') {
      selectTrack('nature', true);
    } else {
      toggleMeditationAudio();
    }
  };

  const handleSeekMeditation = (e) => {
    const newSecs = parseInt(e.target.value, 10);
    setMeditationElapsed(newSecs);
    if (meditationAudioRef.current && meditationAudioRef.current.duration) {
      meditationAudioRef.current.currentTime = newSecs % meditationAudioRef.current.duration;
    }
  };

  const resetMeditationAudio = () => {
    if (meditationAudioRef.current) {
      meditationAudioRef.current.currentTime = 0;
    }
    setMeditationElapsed(0);
    soundFx.playPopSound(1.1);
  };

  const toggleMeditationMute = () => {
    if (!meditationAudioRef.current) return;
    const nextMute = !isMeditationMuted;
    meditationAudioRef.current.muted = nextMute;
    setIsMeditationMuted(nextMute);
    soundFx.playPopSound(nextMute ? 0.9 : 1.2);
  };

  const formatMeditationTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  // App Help Guide Bot State
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Welcome to BioMaxxx! 👋 I'm your App Help Bot. I'm here to guide new users on how to use every feature and navigate the app easily. Ask me where to find anything or tap a guide topic below!" 
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Games State
  const [gameScore, setGameScore] = useState(0);
  const [activeGame, setActiveGame] = useState('maze');

  // 4-7-8 Breathing Loop Effect
  useEffect(() => {
    let timer = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              soundFx.playPopSound(1.4);
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              soundFx.playPopSound(0.9);
              return 8;
            } else {
              setBreathPhase('Inhale');
              setCyclesCompleted((c) => c + 1);
              soundFx.playPopSound(1.2);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  const toggleBreathing = () => {
    const next = !breathingActive;
    setBreathingActive(next);
    soundFx.playPopSound(next ? 1.5 : 0.8);
    if (!next) {
      setBreathPhase('Inhale');
      setPhaseSecondsLeft(4);
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    soundFx.playPopSound(1.2);
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setChatInput('');

    // Helpful new-user guidance
    setTimeout(() => {
      let reply = "Here to help! BioMaxxx is structured into 4 main navigation tabs at the bottom:\n• Home: Real-time recovery, strain, vitals overview\n• Guardian: Whoop SpO2 analytics, 30-day health calendar & live Bangalore AQI\n• Actions: Guided breathing, relaxation games, inhaler dose logging\n• You: Personalized clinical parameters and Whoop device status.";
      const lower = text.toLowerCase();
      if (lower.includes('home') || lower.includes('dashboard')) {
        reply = "🏠 Home Tab Guide:\nThe Home screen provides your primary biometric snapshot. View your Recovery Score circle, daily Strain score, Resting Heart Rate, and Sleep Debt. Tap any metric tile to view deeper biometrics.";
      } else if (lower.includes('guardian') || lower.includes('aqi') || lower.includes('weather') || lower.includes('environment')) {
        reply = "🛡️ Guardian Tab Guide:\n• Whoop Analytics: View past 7-day SpO2 continuous levels and a 30-day interactive health calendar.\n• Environment: Live, hourly updating weather & AQI (PM2.5, PM10, Ozone, NO2) calibrated for MSRIT Mathikere, Bengaluru.";
      } else if (lower.includes('whoop') || lower.includes('spo2') || lower.includes('calendar')) {
        reply = "⌚ Whoop Data Guide:\nGo to Guardian → Whoop tab to inspect your accurate 7-day SpO2 respiratory oxygenation chart, plus a 30-day calendar displaying your daily strain, recovery, and sleep debt.";
      } else if (lower.includes('breath') || lower.includes('4-7-8') || lower.includes('exercise')) {
        reply = "💨 Breathing Exercises Guide:\nGo to Actions → Breathing. Tap 'Start 4-7-8 Breathing' to follow the expanding/contracting visual guide (Inhale 4s, Hold 7s, Exhale 8s). Great for calming the nervous system and easing breathing distress.";
      } else if (lower.includes('game') || lower.includes('maze') || lower.includes('color') || lower.includes('pattern') || lower.includes('breathe & play')) {
        reply = "🎮 Relaxation Games Guide:\nGo to Actions → Games to play 4 calming, low-pressure games:\n1. Mindful Maze: Gentle procedural maze flow\n2. Color Calm: Digital mindfulness coloring\n3. Zen Patterns: Rhythmic sacred geometry flow\n4. Breathe & Play: 3D memory card matching.";
      } else if (lower.includes('inhaler') || lower.includes('dose') || lower.includes('medication')) {
        reply = "💊 Inhaler Tracking Guide:\nGo to Actions → Inhaler to log your daily doses with '+ Log Dose Now', check remaining doses, and review your morning/afternoon/evening schedule.";
      } else if (lower.includes('stress') || lower.includes('meditat') || lower.includes('calm')) {
        reply = "🌿 Stress Relief Guide:\nGo to Actions → Stress Relief for a guided 10-minute Daily Calm meditation with soothing audio and physical muscle relaxation techniques.";
      } else if (lower.includes('you') || lower.includes('profile')) {
        reply = "👤 Profile Guide:\nTap the 'You' tab at the bottom to check your user health profile, connected Whoop band status, and clinical respiratory target zones.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      soundFx.playPopSound(1.4);
    }, 500);
  };

  const subNavItems = [
    { id: 'home', label: 'All Actions' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'stress', label: 'Stress Relief' },
    { id: 'games', label: 'Games' },
    { id: 'inhaler', label: 'Inhaler' },
    { id: 'reminders', label: 'Reminders' },
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 font-sans">
      
      {/* Sub-Navigation Bar */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800/80">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playPopSound(1.2);
                setActionsSubView(item.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all cursor-pointer ${
                actionsSubView === item.id
                  ? 'bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTIONS HOME (Image 4 Screen 1)                                        */}
      {/* ========================================================================= */}
      {actionsSubView === 'home' && (
        <div className="space-y-3 font-sans">
          <div className="px-1">
            <h2 className="text-base font-extrabold text-white">Actions Toolkit</h2>
            <p className="text-sm text-slate-300">Personalized tools to help you breathe better.</p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'breathing', title: 'Breathing Exercises', desc: 'Calm your mind. Support your lungs.', icon: Wind, color: 'text-cyan-400' },
              { id: 'stress', title: 'Stress Relief', desc: 'Relax, reset, feel better.', icon: Sparkles, color: 'text-indigo-400' },
              { id: 'games', title: 'Games', desc: 'Fun interactive biofeedback stress busters.', icon: Gamepad2, color: 'text-emerald-400' },
              { id: 'inhaler', title: 'Inhaler Tracker', desc: `Track doses (${inhalerData.dosesToday}/${inhalerData.maxDoses} logged today).`, icon: CheckCircle2, color: 'text-teal-400' },
              { id: 'reminders', title: 'Reminders', desc: 'Scheduled alerts for doses & medication.', icon: Clock, color: 'text-blue-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playPopSound(1.2);
                    setActionsSubView(item.id);
                  }}
                  className="p-4 rounded-2xl bg-[#0e1628]/95 hover:bg-[#131f38] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-[13px] text-slate-300 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BREATHING EXERCISES (Image 4 Screen 2)                                 */}
      {/* ========================================================================= */}
      {actionsSubView === 'breathing' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 space-y-4 font-mono text-center relative overflow-hidden">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="font-bold text-white font-sans text-base">4-7-8 Breathing</span>
              <span className="text-xs sm:text-sm text-cyan-300/80">Calm • Focus • Relax</span>
            </div>

            {/* Interactive Animated Breathing Gauge */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div 
                className={`w-40 h-40 rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center relative transition-all duration-1000 shadow-[0_0_30px_rgba(0,242,254,0.2)] ${
                  breathingActive && breathPhase === 'Inhale' 
                    ? 'scale-115 border-[#00F2FE] bg-cyan-950/30' 
                    : breathingActive && breathPhase === 'Hold' 
                    ? 'scale-115 border-indigo-400 bg-indigo-950/30' 
                    : 'scale-95 border-emerald-400 bg-emerald-950/20'
                }`}
              >
                <span className="text-base font-sans font-bold uppercase tracking-wider text-cyan-300">
                  {breathingActive ? breathPhase : 'Ready'}
                </span>
                <span className="text-4xl font-black text-white my-1">
                  {breathingActive ? phaseSecondsLeft : '4-7-8'}
                </span>
                <span className="text-xs text-slate-300">
                  {breathingActive ? `${cyclesCompleted} cycles completed` : 'Tap Play'}
                </span>
              </div>
            </div>

            {/* Phase duration indicators */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className={`p-2.5 rounded-xl border ${breathPhase === 'Inhale' && breathingActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <span className="block text-xs text-cyan-400 font-mono">4s</span>
                <span className="font-semibold">Inhale</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${breathPhase === 'Hold' && breathingActive ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <span className="block text-xs text-indigo-400 font-mono">7s</span>
                <span className="font-semibold">Hold</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${breathPhase === 'Exhale' && breathingActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <span className="block text-xs text-emerald-400 font-mono">8s</span>
                <span className="font-semibold">Exhale</span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={toggleBreathing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm shadow-md hover:brightness-110 flex items-center justify-center space-x-2"
            >
              {breathingActive ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{breathingActive ? 'Pause Session' : 'Start 4-7-8 Exercise'}</span>
            </button>
          </div>

          {/* Other Breathing Exercises */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-mono text-slate-400 uppercase tracking-wider px-1">Other Exercises</span>
            {[
              { name: 'Diaphragmatic Breathing', sub: 'Improve lung capacity & oxygen intake' },
              { name: 'Box Breathing (4-4-4-4)', sub: 'Reduce autonomic anxiety & lower pulse' },
              { name: 'Pursed Lip Breathing', sub: 'Easier exhale, clears trapped bronchial air' }
            ].map((ex, i) => (
              <div 
                key={i} 
                onClick={() => {
                  soundFx.playPopSound(1.2);
                  toggleBreathing();
                }}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
              >
                <div>
                  <span className="text-sm font-bold text-white block">{ex.name}</span>
                  <span className="text-xs text-slate-300 mt-0.5 block">{ex.sub}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STRESS RELIEF (Image 4 Screen 3)                                       */}
      {/* ========================================================================= */}
      {actionsSubView === 'stress' && (
        <div className="space-y-4">
          {/* Daily Calm Feature Card with Nature Meditation by Arulo & Deep Meditation by David Fesliyan */}
          <div className="w-full rounded-3xl overflow-hidden border border-cyan-500/30 relative shadow-2xl p-5 bg-[#090e1a] space-y-4">
            
            {/* Background lake art */}
            <div 
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 transition-opacity duration-700"
              style={{ 
                backgroundImage: `url('/meditation_bg.jpg')`,
                filter: isMeditationPlaying ? 'brightness(1.1)' : 'brightness(0.85)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080d17] via-[#080d17]/60 to-transparent pointer-events-none" />

            {/* Real HTML5 Audio Element */}
            <audio
              ref={meditationAudioRef}
              src={activeTrack.src}
              loop
              preload="auto"
              onError={(e) => {
                console.warn("Audio element error, attempting fallback:", e);
                if (activeTrack.fallbackSrc && meditationAudioRef.current && meditationAudioRef.current.src !== activeTrack.fallbackSrc) {
                  meditationAudioRef.current.src = activeTrack.fallbackSrc;
                  meditationAudioRef.current.load();
                  if (isMeditationPlaying) {
                    meditationAudioRef.current.play().catch(() => {});
                  }
                }
              }}
              onEnded={() => {
                if (meditationElapsed < 600 && meditationAudioRef.current) {
                  meditationAudioRef.current.play().catch(() => {});
                }
              }}
            >
              <source src={activeTrack.src} type="audio/mpeg" />
              {activeTrack.fallbackSrc && <source src={activeTrack.fallbackSrc} type="audio/mpeg" />}
            </audio>

            {/* Header info */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                  {activeTrack.id === 'ravi' ? (
                    <Music className="w-4 h-4 text-[#00F2FE]" />
                  ) : activeTrack.id === 'nature' ? (
                    <Trees className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{activeTrack.badge}</span>
                </span>
                <span className="text-xs font-mono text-indigo-300 font-bold px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40">
                  {activeTrack.durationLabel}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <span>Daily Calm</span>
                  {isMeditationPlaying && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-ping" />
                  )}
                </h3>

                {/* Animated Equalizer Waveform while playing */}
                {isMeditationPlaying && (
                  <div className="flex items-end space-x-1 h-3.5 py-0.5">
                    {[40, 85, 60, 100, 50, 75, 90, 45, 65, 80].map((h, idx) => (
                      <span
                        key={idx}
                        className="w-0.5 bg-cyan-400 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDuration: `${0.35 + (idx % 4) * 0.15}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-sm font-sans text-cyan-300 font-semibold flex items-center space-x-2">
                <span>{activeTrack.title}</span>
                <span className="text-slate-300 font-normal">— by {activeTrack.artist}</span>
              </p>
              <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed">
                {activeTrack.desc}
              </p>

              {/* Quick Track Switcher */}
              <div className="flex items-center space-x-2 pt-1.5 flex-wrap gap-y-2">
                {MEDITATION_TRACKS.map((t) => {
                  const isSelected = selectedTrackId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTrack(t.id, true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
                        isSelected 
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                          : 'bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.id === 'ravi' ? <Music className="w-3.5 h-3.5 text-[#00F2FE]" /> : t.id === 'nature' ? <Leaf className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{t.title}</span>
                      {isSelected && isMeditationPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Progress Scrubber & Live 10-Min Session Time Display */}
            <div className="relative z-10 space-y-1.5 pt-1">
              <input
                type="range"
                min="0"
                max="600"
                value={meditationElapsed}
                onChange={handleSeekMeditation}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-300">
                <span className="text-cyan-300 font-bold">{formatMeditationTime(meditationElapsed)}</span>
                <span className="text-xs text-slate-300 font-sans">
                  {isMeditationPlaying ? `Playing: ${activeTrack.title}` : 'Paused (10 Min Session)'}
                </span>
                <span className="text-slate-300 font-bold">10:00</span>
              </div>
            </div>

            {/* Playback Action Controls */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={toggleMeditationAudio}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 font-bold font-mono text-sm shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 active:scale-95 transition-all flex items-center space-x-2"
                >
                  {isMeditationPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Play 10-Min Meditation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetMeditationAudio}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
                  title="Rewind to beginning (00:00)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={toggleMeditationMute}
                className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-colors"
                title={isMeditationMuted ? "Unmute" : "Mute"}
              >
                {isMeditationMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>

          </div>

          {/* Stress Relief Activities List */}
          <div className="space-y-2">
            {[
              { 
                id: 'ravi',
                title: 'Ravi Music (Signature Theme)', 
                sub: 'Signature opening soundscape to calm & center',
                action: () => {
                  soundFx.playPopSound(1.2);
                  selectTrack('ravi', !isMeditationPlaying || selectedTrackId !== 'ravi');
                },
                icon: Music,
                active: isMeditationPlaying && selectedTrackId === 'ravi'
              },
              { 
                id: 'nature',
                title: 'Nature Sounds (Nature Meditation — Arulo)', 
                sub: 'Soothing organic background & forest calm',
                action: () => handleSelectNatureSounds(),
                icon: Leaf,
                active: isMeditationPlaying && selectedTrackId === 'nature'
              },
              { 
                id: 'breathing',
                title: 'Mindful Breathing', 
                sub: '5 min • 4-7-8 Vagal reset exercise',
                action: () => {
                  soundFx.playPopSound(1.2);
                  setActionsSubView('breathing');
                },
                icon: Wind,
                active: false
              },
              { 
                id: 'gratitude',
                title: 'Gratitude Reflection', 
                sub: 'Cortisol reduction practice',
                action: () => soundFx.playPopSound(1.2),
                icon: Sparkles,
                active: false
              }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={item.id} 
                  onClick={item.action}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.active 
                      ? 'bg-[#0b1c30] border-cyan-400/60 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                      : 'bg-[#0e1628] border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${item.active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold block ${item.active ? 'text-cyan-300' : 'text-white'}`}>{item.title}</span>
                        {item.active && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse font-bold">
                            PLAYING NOW
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-300 mt-0.5 block">{item.sub}</span>
                    </div>
                  </div>

                  {item.id === 'nature' || item.id === 'ravi' ? (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-cyan-400 hover:text-white">
                      {item.active ? <Pause className="w-4 h-4 fill-cyan-400" /> : <Play className="w-4 h-4 fill-cyan-400" />}
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GAMES (Mindful Maze, Color Calm, Zen Patterns, Breathe & Play)         */}
      {/* ========================================================================= */}
      {actionsSubView === 'games' && (
        <div className="space-y-4 font-sans">
          {activeGame === 'maze' ? (
            <MindfulMazeGame onBack={() => setActiveGame(null)} />
          ) : activeGame === 'color' ? (
            <ColorCalmGame onBack={() => setActiveGame(null)} />
          ) : activeGame === 'zen' ? (
            <ZenPatternsGame onBack={() => setActiveGame(null)} />
          ) : activeGame === 'breathe' ? (
            <BreatheAndPlayGame onBack={() => setActiveGame(null)} />
          ) : (
            <div className="space-y-3">
              <div className="px-1 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono uppercase text-slate-300 font-bold">Mindfulness & Calming Games</span>
                <span className="text-xs font-mono text-cyan-400 font-medium">Low-pressure • Focus & Relax</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'maze', name: 'Mindful Maze', sub: 'Focus & Serenity', icon: '🌀', actionText: '✦ Play Mindful Maze', featured: true },
                  { id: 'color', name: 'Color Calm', sub: 'Creative stillness', icon: '🎨', actionText: '✦ Play Color Calm', featured: true },
                  { id: 'zen', name: 'Zen Patterns', sub: 'Harmonic flow', icon: '🧠', actionText: '✦ Play Zen Patterns', featured: true },
                  { id: 'breathe', name: 'Breathe & Play', sub: 'Memory match cards', icon: '🍃', actionText: '✦ Play Breathe & Play', featured: true }
                ].map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (game.id === 'maze') {
                        setActiveGame('maze');
                      } else if (game.id === 'color') {
                        setActiveGame('color');
                      } else if (game.id === 'zen') {
                        setActiveGame('zen');
                      } else if (game.id === 'breathe') {
                        setActiveGame('breathe');
                      } else {
                        soundFx.playPopSound(1.2);
                      }
                    }}
                    className={`p-4 rounded-3xl bg-[#0e1628] border ${
                      game.featured ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.12)]' : 'border-slate-800'
                    } hover:border-cyan-400 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02]`}
                  >
                    <div className="text-3xl">{game.icon}</div>
                    <div className="font-bold text-sm text-white">{game.name}</div>
                    <div className="text-xs text-slate-300">{game.sub}</div>
                    <span className="text-xs font-mono text-cyan-400 block pt-1 font-semibold">
                      {game.actionText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INHALER TRACKER (Image 4 Screen 5)                                     */}
      {/* ========================================================================= */}
      {actionsSubView === 'inhaler' && (
        <div className="space-y-4 font-mono">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 space-y-3 text-center">
            <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider block font-semibold">Today's Inhaler Doses</span>
            
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-500/40 border-t-[#00F2FE] flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{inhalerData.dosesToday} <span className="text-base font-normal text-slate-400">/ {inhalerData.maxDoses}</span></span>
            </div>

            <div className="text-sm font-medium text-slate-200">
              {inhalerData.maxDoses - inhalerData.dosesToday} doses remaining for today
            </div>

            <button
              onClick={logInhalerDose}
              disabled={inhalerData.dosesToday >= inhalerData.maxDoses}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm shadow-md disabled:opacity-50"
            >
              + Log Dose Now
            </button>
          </div>

          {/* Schedule list */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider px-1 block font-semibold">Scheduled Doses</span>
            {inhalerData.schedule.map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleMedication(item.id)}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className="text-sm font-bold text-white block">{item.name} ({item.time})</span>
                  <span className="text-xs text-slate-300 mt-0.5 block">{item.med}</span>
                </div>
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${item.taken ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700'}`}>
                  {item.taken && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 7. REMINDERS & SLEEP ALARM CONTROLS                                       */}
      {/* ========================================================================= */}
      {actionsSubView === 'reminders' && (
        <div className="space-y-4 font-mono">
          
          {/* Dual Alarm Master Controller */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090e1a] border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 relative z-10">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Dual Sleep & Wake Alarms</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playPopSound(1.2);
                  setActiveTab('guardian');
                  setGuardianSubView('sleep');
                }}
                className="text-xs text-cyan-300 hover:text-white underline cursor-pointer flex items-center space-x-1"
              >
                <span>Full Sleep Hub →</span>
              </button>
            </div>

            {/* Bedtime & Wake Alarm Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              
              {/* Bedtime Alarm */}
              <div className={`p-4 rounded-2xl border transition-all ${
                alarmSettings.bedtimeEnabled 
                  ? 'bg-[#0e1628] border-indigo-500/50 shadow-md' 
                  : 'bg-[#0a0f1d] border-slate-800/80 opacity-70'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center space-x-2.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">Bedtime Alarm</span>
                      <span className="text-xs text-indigo-300">Routine Reminder</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAlarmSetting('bedtime')}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      alarmSettings.bedtimeEnabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${
                      alarmSettings.bedtimeEnabled ? 'right-0.75' : 'left-0.75'
                    }`} />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <input
                    type="time"
                    value={alarmSettings.bedtimeTime}
                    onChange={(e) => updateAlarmTime('bedtime', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => {
                      soundFx.playZenChime();
                      soundFx.playPopSound(1.2);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Test</span>
                  </button>
                </div>
              </div>

              {/* Wake-Up Alarm */}
              <div className={`p-4 rounded-2xl border transition-all ${
                alarmSettings.wakeEnabled 
                  ? 'bg-[#0e1628] border-cyan-400/50 shadow-md' 
                  : 'bg-[#0a0f1d] border-slate-800/80 opacity-70'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center space-x-2.5">
                    <Sun className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">Wake-Up Alarm</span>
                      <span className="text-xs text-cyan-300">Overnight Analysis</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAlarmSetting('wake')}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      alarmSettings.wakeEnabled ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.5)]' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${
                      alarmSettings.wakeEnabled ? 'right-0.75' : 'left-0.75'
                    }`} />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <input
                    type="time"
                    value={alarmSettings.wakeTime}
                    onChange={(e) => updateAlarmTime('wake', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        soundFx.startAlarmLoop('wakeup');
                        setTimeout(() => soundFx.stopAlarmLoop(), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Test</span>
                    </button>
                    <button
                      onClick={() => triggerAlarm('wakeup')}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-xs text-cyan-300 font-bold hover:brightness-110 flex items-center space-x-1"
                      title="Test morning wake-up ringing overlay & report modal"
                    >
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ring</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* General Medication & Health Reminders List */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider px-1 block font-semibold">Scheduled Medication & Health Alerts</span>
            {reminders.filter(r => r.category !== 'alarm').map((r) => (
              <div 
                key={r.id}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-sm font-bold text-white block">{r.title}</span>
                  <span className="text-xs text-slate-300 mt-0.5 block">{r.time}</span>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${r.enabled ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${r.enabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
