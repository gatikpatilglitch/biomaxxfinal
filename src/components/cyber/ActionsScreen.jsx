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
  Plus
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';
import MindfulMazeGame from './MindfulMazeGame';
import ColorCalmGame from './ColorCalmGame';
import BreatheAndPlayGame from './BreatheAndPlayGame';

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

  // Health Tracker Symptoms State
  const [selectedSymptom, setSelectedSymptom] = useState('None');
  const [symptomNote, setSymptomNote] = useState('');
  const [symptomSaved, setSymptomSaved] = useState(false);

  // AI Assistant Chat State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi Aditi! How can I help you today? I can guide your breathing, check air quality safety, or optimize your sleep.' }
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

    // Automated smart clinical / wellness responses
    setTimeout(() => {
      let reply = "Your biometrics look great today! Rest and steady pacing are recommended.";
      const lower = text.toLowerCase();
      if (lower.includes('breath') || lower.includes('exercise')) {
        reply = "I recommend 4-7-8 breathing right now. Inhale for 4s, hold for 7s, and exhale through pursed lips for 8s to calm the vagus nerve.";
      } else if (lower.includes('out') || lower.includes('safe') || lower.includes('air')) {
        reply = `Today's AQI is ${whoopData.aqi} (Moderate). Your best outdoor window is 7:00 AM – 8:30 AM before ground-level ozone builds.`;
      } else if (lower.includes('sleep')) {
        reply = `Based on your ${whoopData.dayStrain} strain, aim for bed at ${whoopData.bedtime} to repay your 41m sleep debt and clear airway fatigue.`;
      } else if (lower.includes('stress')) {
        reply = "Try the 10-minute Daily Calm meditation or a gentle 4-7-8 breathing session in the Actions tab.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      soundFx.playPopSound(1.4);
    }, 600);
  };

  const subNavItems = [
    { id: 'home', label: 'All Actions' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'stress', label: 'Stress Relief' },
    { id: 'games', label: 'Games' },
    { id: 'inhaler', label: 'Inhaler' },
    { id: 'health_tips', label: 'Tips' },
    { id: 'health_tracker', label: 'Tracker' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'ai_assistant', label: 'AI Bot' },
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
              { id: 'health_tips', title: 'Health Tips', desc: 'Daily tips for airway health & nutrition.', icon: Droplet, color: 'text-blue-400' },
              { id: 'ai_assistant', title: 'AI Assistant', desc: 'Ask anything. Get personalized guidance.', icon: Bot, color: 'text-purple-400' },
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
      {/* 4. GAMES (Mindful Maze, Color Calm, Breathe & Play)                       */}
      {/* ========================================================================= */}
      {actionsSubView === 'games' && (
        <div className="space-y-4 font-sans">
          {activeGame === 'maze' ? (
            <MindfulMazeGame onBack={() => setActiveGame(null)} />
          ) : activeGame === 'color' ? (
            <ColorCalmGame onBack={() => setActiveGame(null)} />
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
                  { id: 'breathe', name: 'Breathe & Play', sub: 'Memory match cards', icon: '🍃', actionText: '✦ Play Memory Match', featured: true },
                  { id: 'memory', name: 'Zen Patterns', sub: 'Gentle focus', icon: '🧠', actionText: 'Coming Soon', featured: false }
                ].map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (game.id === 'maze') {
                        setActiveGame('maze');
                      } else if (game.id === 'color') {
                        setActiveGame('color');
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
      {/* 6. HEALTH TIPS (Image 4 Screen 6)                                         */}
      {/* ========================================================================= */}
      {actionsSubView === 'health_tips' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 flex items-center space-x-3.5">
            <img src="/water_bg.jpg" alt="Stay Hydrated" className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/30" />
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">LIFESTYLE TIP</span>
              <h3 className="text-sm font-bold text-white">Stay Hydrated</h3>
              <p className="text-[11px] text-slate-300 leading-snug">Helps in thinning bronchial mucus and keeps airway passages clear.</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Foods for Lung Health', sub: 'Leafy greens, berries, walnuts & turmeric' },
              { title: 'Avoid Airway Triggers', sub: 'Seal windows during rush hour smog peaks' },
              { title: 'Daily Breathing Routine', sub: 'Practice pursed-lip breathing twice daily' }
            ].map((tip, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{tip.title}</span>
                  <span className="text-[11px] text-slate-400">{tip.sub}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
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
      {/* 8. AI ASSISTANT (Image 4 Screen 10)                                       */}
      {/* ========================================================================= */}
      {actionsSubView === 'ai_assistant' && (
        <div className="space-y-3 font-sans">
          {/* Chat Stream Card */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-cyan-500/30 min-h-[300px] flex flex-col justify-between space-y-3">
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800 font-mono text-[10px]">
              {[
                'Breathing exercise suggestions',
                'Is it safe to go out today?',
                'Tips for better sleep',
                'I feel stressed, what can I do?'
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

            {/* Input bar */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:brightness-110"
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
