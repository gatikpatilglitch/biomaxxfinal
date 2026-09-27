import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Bed
} from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function AlarmRingingOverlay() {
  const { 
    activeRingingAlarm, 
    dismissAlarm, 
    snoozeAlarm, 
    startSleepSession, 
    stopSleepSessionAndWakeUp,
    alarmSettings
  } = useWhoopData();

  const [currentTime, setCurrentTime] = useState('');
  const [seconds, setSeconds] = useState('');
  const [ampm, setAmpm] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${mins}`);
      setSeconds(secs);
      setAmpm(period);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeRingingAlarm) return null;

  const isBedtime = activeRingingAlarm === 'bedtime';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Background Animated Neon Pulsing Rings */}
      <div className={`absolute w-[450px] h-[450px] rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none ${
        isBedtime ? 'bg-indigo-600' : 'bg-cyan-400'
      }`} />

      <div 
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 relative overflow-hidden space-y-6 shadow-2xl border text-slate-100 ${
          isBedtime 
            ? 'bg-[#0B0F1E] border-indigo-500/50 shadow-[0_0_60px_rgba(99,102,241,0.25)]' 
            : 'bg-[#08121E] border-cyan-400/50 shadow-[0_0_60px_rgba(0,242,254,0.3)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              isBedtime 
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40' 
                : 'bg-cyan-950 text-cyan-300 border border-cyan-400/40'
            }`}>
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{isBedtime ? 'CIRCADIAN SLEEP ROUTINE' : 'MORNING CIRCADIAN WAKE'}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 animate-pulse">
            ALARM RINGING
          </span>
        </div>

        {/* Center Glowing Icon with Pulsing Halo */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center relative shadow-2xl transition-all ${
            isBedtime 
              ? 'border-indigo-400/80 bg-indigo-950/40 shadow-[0_0_40px_rgba(99,102,241,0.4)]' 
              : 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_40px_rgba(0,242,254,0.4)]'
          }`}>
            {isBedtime ? (
              <Moon className="w-14 h-14 text-indigo-300 animate-pulse" />
            ) : (
              <Sun className="w-14 h-14 text-cyan-300 animate-spin" style={{ animationDuration: '12s' }} />
            )}
            
            {/* Audio Wave Sound Bars */}
            <div className="absolute -bottom-2 flex items-end space-x-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80">
              <Volume2 className="w-3 h-3 text-cyan-400 mr-1" />
              {[40, 85, 60, 100, 50, 90, 65, 80].map((h, i) => (
                <span 
                  key={i} 
                  className="w-1 bg-cyan-400 rounded-full animate-pulse" 
                  style={{ height: `${h * 0.12}px`, animationDuration: `${0.3 + (i % 3) * 0.15}s` }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Giant Digital Clock Display */}
        <div className="text-center space-y-1">
          <div className="flex items-baseline justify-center space-x-2 font-mono">
            <span className={`text-5xl sm:text-6xl font-black tracking-tight ${
              isBedtime ? 'text-white' : 'text-cyan-200'
            }`}>
              {currentTime}
            </span>
            <span className="text-lg text-slate-400 font-bold">:{seconds}</span>
            <span className="text-sm font-bold text-cyan-400">{ampm}</span>
          </div>
          
          <h2 className="text-base sm:text-lg font-bold text-white font-sans">
            {isBedtime ? 'Bedtime Alarm • 10:30 PM' : 'Morning Wake-Up Alarm • 6:30 AM'}
          </h2>
          <p className="text-xs text-slate-300 font-sans max-w-xs mx-auto leading-relaxed">
            {isBedtime 
              ? 'Your scheduled 10:30 PM bedtime window has arrived. Start your sleep routine now to protect your 5-cycle recovery window.'
              : 'Circadian wake-up window reached. Stop alarm to immediately generate your overnight SpO2 & Heart Rate report.'}
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isBedtime ? (
            <>
              <button
                onClick={startSleepSession}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-bold font-mono text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <Bed className="w-4 h-4 fill-slate-950" />
                <span>Acknowledge & Start Sleep Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => snoozeAlarm(10)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Snooze (10m)</span>
                </button>
                <button
                  onClick={dismissAlarm}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Turn Off</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={stopSleepSessionAndWakeUp}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black font-mono text-sm shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <Sun className="w-5 h-5 fill-slate-950" />
                <span>Turn Off Alarm & View Overnight Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => snoozeAlarm(5)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Snooze (5m)</span>
                </button>
                <button
                  onClick={dismissAlarm}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
