import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Moon, 
  Sun, 
  Clock, 
  Bed, 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Wind, 
  Heart, 
  TrendingDown, 
  ArrowRight,
  Flame,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function SleepAlarmSystem() {
  const { 
    alarmSettings, 
    toggleAlarmSetting, 
    updateAlarmTime,
    sleepSession, 
    startSleepSession, 
    stopSleepSessionAndWakeUp,
    triggerAlarm,
    openOvernightReport,
    overnightReport,
    whoopData 
  } = useWhoopData();

  // Current real-time clock
  const [nowTime, setNowTime] = useState(new Date());
  const [elapsedSleepText, setElapsedSleepText] = useState('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live elapsed sleep timer
  useEffect(() => {
    if (!sleepSession.isSleeping || !sleepSession.sleepStartTime) {
      setElapsedSleepText('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const diffMs = Date.now() - sleepSession.sleepStartTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      setElapsedSleepText(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepSession.isSleeping, sleepSession.sleepStartTime]);

  // Next alarm calculation
  const getNextAlarmInfo = () => {
    const now = nowTime;
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [bH, bM] = alarmSettings.bedtimeTime.split(':').map(Number);
    const bedtimeMins = bH * 60 + bM;

    const [wH, wM] = alarmSettings.wakeTime.split(':').map(Number);
    const wakeMins = wH * 60 + wM;

    let diffBed = bedtimeMins - currentMins;
    if (diffBed <= 0) diffBed += 1440;

    let diffWake = wakeMins - currentMins;
    if (diffWake <= 0) diffWake += 1440;

    if (alarmSettings.wakeEnabled && (!alarmSettings.bedtimeEnabled || diffWake < diffBed)) {
      const h = Math.floor(diffWake / 60);
      const m = diffWake % 60;
      return { label: `Morning Wake Alarm in ${h}h ${m}m`, type: 'wake', time: alarmSettings.wakeTime };
    }

    if (alarmSettings.bedtimeEnabled) {
      const h = Math.floor(diffBed / 60);
      const m = diffBed % 60;
      return { label: `Bedtime Alarm in ${h}h ${m}m`, type: 'bedtime', time: alarmSettings.bedtimeTime };
    }

    return { label: 'Alarms Disabled', type: 'none', time: '--:--' };
  };

  const nextAlarm = getNextAlarmInfo();

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-300">
      
      {/* Real-Time Circadian Status & Clock Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0C1220] border border-cyan-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CIRCADIAN SLEEP ENGINE</span>
            </span>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40">
            WHOOP SYNCED
          </span>
        </div>

        {/* Live Clock & Next Countdown */}
        <div className="relative z-10 pt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">CURRENT TIME</span>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono flex items-baseline space-x-1.5">
              <span>{nowTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              <span className="text-xs text-slate-500 font-normal">
                :{String(nowTime.getSeconds()).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">NEXT SCHEDULED EVENT</span>
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center sm:justify-end space-x-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{nextAlarm.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Sleep Tracker Session Card */}
      <div className={`p-5 rounded-3xl border relative overflow-hidden transition-all shadow-xl ${
        sleepSession.isSleeping 
          ? 'bg-[#0A1424] border-cyan-400/60 shadow-[0_0_40px_rgba(0,242,254,0.18)]' 
          : 'bg-[#0E1628] border-indigo-500/30'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${
              sleepSession.isSleeping ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {sleepSession.isSleeping ? 'Active Sleep Session Tracking' : 'Overnight Sleep Tracker'}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                {sleepSession.isSleeping ? 'Monitoring SpO₂ & HRV resting dip' : 'Ready to begin sleep tracking'}
              </p>
            </div>
          </div>

          {sleepSession.isSleeping && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 animate-pulse">
              ● IN BED
            </span>
          )}
        </div>

        {sleepSession.isSleeping ? (
          <div className="pt-4 space-y-4 font-mono">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">ELAPSED SLEEP TIME</span>
                <span className="text-3xl font-black text-white">{elapsedSleepText}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">LIVE SPO₂ STATUS</span>
                <span className="text-xl font-bold text-emerald-400">98% Stable</span>
              </div>
            </div>

            <button
              onClick={stopSleepSessionAndWakeUp}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sun className="w-4 h-4 fill-slate-950" />
              <span>Wake Up & Generate Overnight Bio-Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="pt-3 space-y-3 font-mono">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Target Sleep Need</span>
                <span className="font-bold text-white">{whoopData.sleepNeeded || '7h 45m'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current Sleep Debt</span>
                <span className="font-bold text-amber-400">{whoopData.sleepDebtMinutes || 35}m</span>
              </div>
            </div>

            <button
              onClick={startSleepSession}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Moon className="w-4 h-4 fill-slate-950" />
              <span>Start Sleep Session Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Dual Alarm Controls Grid */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider px-1 block">
          Dual Circadian Alarms
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* 1. Bedtime Alarm Card */}
          <div className={`p-4 rounded-3xl border transition-all ${
            alarmSettings.bedtimeEnabled 
              ? 'bg-[#0E1628] border-indigo-500/40 shadow-lg' 
              : 'bg-[#0c1220] border-slate-800/80 opacity-70'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bedtime Alarm</h4>
                  <span className="text-[10px] text-indigo-300 font-mono">Routine Wind-Down</span>
                </div>
              </div>

              {/* Glowing Switch */}
              <button
                onClick={() => toggleAlarmSetting('bedtime')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alarmSettings.bedtimeEnabled ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  alarmSettings.bedtimeEnabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Time Picker & Controls */}
            <div className="pt-3 space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Scheduled Time</span>
                <input
                  type="time"
                  value={alarmSettings.bedtimeTime}
                  onChange={(e) => updateAlarmTime('bedtime', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => {
                    soundFx.playZenChime();
                    soundFx.playPopSound(1.2);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-400/60 text-[10px] text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-1"
                >
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                  <span>Test Chime</span>
                </button>

                <button
                  onClick={() => triggerAlarm('bedtime')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-[10px] text-indigo-300 font-bold hover:brightness-110 transition-colors flex items-center justify-center space-x-1"
                >
                  <Bell className="w-3 h-3 text-indigo-400" />
                  <span>Ring Alarm</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Morning Wake-Up Alarm Card */}
          <div className={`p-4 rounded-3xl border transition-all ${
            alarmSettings.wakeEnabled 
              ? 'bg-[#0B1526] border-cyan-400/40 shadow-lg' 
              : 'bg-[#0c1220] border-slate-800/80 opacity-70'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Wake-Up Alarm</h4>
                  <span className="text-[10px] text-cyan-300 font-mono">Circadian Wake</span>
                </div>
              </div>

              {/* Glowing Switch */}
              <button
                onClick={() => toggleAlarmSetting('wake')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alarmSettings.wakeEnabled ? 'bg-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.5)]' : 'bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  alarmSettings.wakeEnabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Time Picker & Controls */}
            <div className="pt-3 space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Scheduled Time</span>
                <input
                  type="time"
                  value={alarmSettings.wakeTime}
                  onChange={(e) => updateAlarmTime('wake', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => {
                    soundFx.startAlarmLoop('wakeup');
                    setTimeout(() => soundFx.stopAlarmLoop(), 2500);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400/60 text-[10px] text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-1"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>Test Alarm</span>
                </button>

                <button
                  onClick={() => triggerAlarm('wakeup')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-[10px] text-cyan-300 font-bold hover:brightness-110 transition-colors flex items-center justify-center space-x-1"
                  title="Trigger actual morning wake alarm overlay with audible chime"
                >
                  <Bell className="w-3 h-3 text-cyan-400 animate-bounce" />
                  <span>Simulate Ring</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Latest Overnight Report Preview Card */}
      {overnightReport && (
        <div className="p-4 rounded-3xl bg-[#0E1628] border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Latest Overnight Health Analysis</h4>
            </div>
            <span className="text-[10px] text-slate-400">{overnightReport.date}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <span className="font-bold text-white">{overnightReport.durationFormatted}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Avg SpO₂</span>
              <span className="font-bold text-emerald-400">{overnightReport.avgSpo2}%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Lowest Dip</span>
              <span className="font-bold text-amber-400">{overnightReport.lowestSpo2}%</span>
            </div>
          </div>

          <p className="text-[11px] font-sans text-slate-300 line-clamp-2 leading-relaxed">
            {overnightReport.aiSummary}
          </p>

          <button
            onClick={() => openOvernightReport()}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>View Full Overnight Report (SpO₂ & HRV Analysis)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
