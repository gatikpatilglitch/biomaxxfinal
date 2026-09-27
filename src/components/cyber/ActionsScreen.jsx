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
  Send, 
  Bot, 
  Clock, 
  Smile, 
  Heart,
  Droplet,
  Coffee,
  Plus,
  HelpCircle
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';
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
    whoopData
  } = useWhoopData();

  // Breathing 4-7-8 State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale (4s), Hold (7s), Exhale (8s)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Meditation State
  const [isMeditationPlaying, setIsMeditationPlaying] = useState(false);


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
    { id: 'help_bot', label: 'Help Bot' },
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
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
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
            <p className="text-xs text-slate-400">Personalized tools to help you breathe better.</p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'breathing', title: 'Breathing Exercises', desc: 'Calm your mind. Support your lungs.', icon: Wind, color: 'text-cyan-400' },
              { id: 'stress', title: 'Stress Relief', desc: 'Relax, reset, feel better.', icon: Sparkles, color: 'text-indigo-400' },
              { id: 'games', title: 'Games', desc: 'Fun interactive biofeedback stress busters.', icon: Gamepad2, color: 'text-emerald-400' },
              { id: 'inhaler', title: 'Inhaler Tracker', desc: `Track doses (${inhalerData.dosesToday}/${inhalerData.maxDoses} logged today).`, icon: CheckCircle2, color: 'text-teal-400' },
              { id: 'reminders', title: 'Reminders', desc: 'Scheduled alerts for doses & medication.', icon: Clock, color: 'text-blue-400' },
              { id: 'help_bot', title: 'App Guide & Help Bot', desc: 'New here? Learn how to navigate and use BioMaxxx.', icon: HelpCircle, color: 'text-cyan-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playPopSound(1.2);
                    setActionsSubView(item.id);
                  }}
                  className="p-3.5 rounded-2xl bg-[#0e1628]/95 hover:bg-[#131f38] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
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
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white font-sans text-sm">4-7-8 Breathing</span>
              <span>Calm • Focus • Relax</span>
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
                <span className="text-sm font-sans font-bold uppercase tracking-wider text-cyan-300">
                  {breathingActive ? breathPhase : 'Ready'}
                </span>
                <span className="text-4xl font-black text-white my-1">
                  {breathingActive ? phaseSecondsLeft : '4-7-8'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {breathingActive ? `${cyclesCompleted} cycles` : 'Tap Play'}
                </span>
              </div>
            </div>

            {/* Phase duration indicators */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl border ${breathPhase === 'Inhale' && breathingActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="block text-[10px]">4s</span>
                <span>Inhale</span>
              </div>
              <div className={`p-2 rounded-xl border ${breathPhase === 'Hold' && breathingActive ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="block text-[10px]">7s</span>
                <span>Hold</span>
              </div>
              <div className={`p-2 rounded-xl border ${breathPhase === 'Exhale' && breathingActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="block text-[10px]">8s</span>
                <span>Exhale</span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={toggleBreathing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center space-x-2"
            >
              {breathingActive ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{breathingActive ? 'Pause Session' : 'Start 4-7-8 Exercise'}</span>
            </button>
          </div>

          {/* Other Breathing Exercises */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider px-1">Other Exercises</span>
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
                className="p-3 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{ex.name}</span>
                  <span className="text-[11px] text-slate-400">{ex.sub}</span>
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
          {/* Daily Calm Feature Card with Serene Lake Background */}
          <div className="w-full rounded-3xl overflow-hidden border border-indigo-500/30 relative shadow-xl min-h-[170px] flex flex-col justify-between p-5 bg-[#0a1120]">
            <div 
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-50"
              style={{ backgroundImage: `url('/meditation_bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090E1A] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-widest">
                GUIDED MEDITATION
              </span>
              <h3 className="text-lg font-black text-white">Daily Calm</h3>
              <p className="text-xs font-mono text-slate-300">10 min • Calm lake soundscape & breathwork</p>
            </div>

            <div className="relative z-10 pt-4 flex items-center space-x-3">
              <button
                onClick={() => {
                  const next = !isMeditationPlaying;
                  setIsMeditationPlaying(next);
                  soundFx.playPopSound(next ? 1.5 : 0.8);
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-md flex items-center space-x-2"
              >
                {isMeditationPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                <span>{isMeditationPlaying ? 'Pause Audio' : 'Play Guided Meditation'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Mindful Breathing', sub: '5 min • Quick vagal reset' },
              { title: 'Nature Sounds (Pine Forest Rain)', sub: 'Soothing organic background' },
              { title: 'Gratitude Reflection', sub: 'Cortisol reduction practice' }
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={() => soundFx.playPopSound(1.2)}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/30"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.title}</span>
                  <span className="text-[11px] text-slate-400">{item.sub}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
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
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Mindfulness & Calming Games</span>
                <span className="text-[10px] font-mono text-cyan-400/80">Low-pressure • Focus & Relax</span>
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
                    <div className="font-bold text-xs text-white">{game.name}</div>
                    <div className="text-[10px] text-slate-400">{game.sub}</div>
                    <span className="text-[9px] font-mono text-cyan-400 block pt-1 font-semibold">
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
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Today's Inhaler Doses</span>
            
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-500/40 border-t-[#00F2FE] flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{inhalerData.dosesToday} <span className="text-sm font-normal text-slate-400">/ {inhalerData.maxDoses}</span></span>
            </div>

            <div className="text-xs text-slate-300">
              {inhalerData.maxDoses - inhalerData.dosesToday} doses remaining for today
            </div>

            <button
              onClick={logInhalerDose}
              disabled={inhalerData.dosesToday >= inhalerData.maxDoses}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
            >
              + Log Dose Now
            </button>
          </div>

          {/* Schedule list */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider px-1 block">Scheduled Doses</span>
            {inhalerData.schedule.map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleMedication(item.id)}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.name} ({item.time})</span>
                  <span className="text-[11px] text-slate-400">{item.med}</span>
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
      {/* 7. REMINDERS (Image 4 Screen 9)                                           */}
      {/* ========================================================================= */}
      {actionsSubView === 'reminders' && (
        <div className="space-y-3 font-mono">
          <span className="text-xs text-slate-400 uppercase tracking-wider px-1 block">Scheduled Reminders</span>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div 
                key={r.id}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{r.title}</span>
                  <span className="text-[11px] text-slate-400">{r.time}</span>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${r.enabled ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${r.enabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. HELP BOT (App Guide for New Users)                                     */}
      {/* ========================================================================= */}
      {actionsSubView === 'help_bot' && (
        <div className="space-y-3 font-sans">
          <div className="px-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>App Guide & Help Bot</span>
              </h3>
              <p className="text-[11px] text-slate-400">Ask how to navigate and use BioMaxxx features</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40">
              Online
            </span>
          </div>

          {/* Chat Stream Card */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-cyan-500/30 min-h-[320px] flex flex-col justify-between space-y-3 shadow-[0_0_20px_rgba(0,242,254,0.05)]">
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}>
                    {m.text.split('\n').map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips for New Users */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-[10px]">
              <span className="text-[10px] text-slate-500 block uppercase">Guide Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🏠 How to use Home screen?',
                  '🛡️ How to check AQI & Weather?',
                  '💨 How does Breathing work?',
                  '🎮 What games can I play?',
                  '⌚ How to view Whoop data?',
                  '💊 How to track Inhaler doses?'
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center space-x-2 pt-1 font-sans">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask how to use any feature..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all"
                title="Send question"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
