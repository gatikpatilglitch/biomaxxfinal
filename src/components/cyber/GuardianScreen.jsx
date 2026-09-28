import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Wind, 
  Heart, 
  Moon, 
  ChevronRight, 
  ArrowLeft,
  RefreshCw, 
  Sparkles, 
  Sliders, 
  BarChart2, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Layers,
  Settings,
  Calendar,
  Zap,
  MapPin,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  Navigation,
  Compass,
  Eye
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { useAchievements } from '../../context/AchievementsContext';
import { soundFx } from '../../utils/audioSynthesizer';
import SleepAlarmSystem from './SleepAlarmSystem';
import { CITIES, classifyAqi, getInitialCityEnvironment } from '../../utils/msritWeatherService';

export default function GuardianScreen() {
  const { 
    guardianSubView, 
    setGuardianSubView, 
    whoopData, 
    syncWhoop, 
    setIsWalkingModalOpen, 
    setIsRespiratoryModalOpen, 
    setIsSleepModalOpen,
    environmentData,
    refreshEnvironmentData,
    isRefreshingEnv,
    selectedCity,
    setSelectedCity,
    allCitiesData
  } = useWhoopData();

  const { trackAction } = useAchievements();

  // Track Guardian meaningful check
  React.useEffect(() => {
    trackAction('guardian_check');
  }, [trackAction]);

  // Track Environmental and Sleep subview checks
  React.useEffect(() => {
    if (guardianSubView === 'environment') {
      trackAction('air_aware');
    } else if (guardianSubView === 'sleep') {
      trackAction('sleep_observer');
    }
  }, [guardianSubView, trackAction]);

  const [trendRange, setTrendRange] = useState('7D'); // '7D' | '30D' | '3M'
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [calendarMetric, setCalendarMetric] = useState('recovery'); // 'recovery' | 'spo2' | 'sleep' | 'strain' | 'hrv'
  const [envTimetableTab, setEnvTimetableTab] = useState('hourly'); // 'hourly' | 'weekly' | 'campus'

  const calendar = whoopData.calendar30D || { days: [], summary: {} };
  const calendarDays = calendar.days || [];
  const activeDay = selectedCalendarDay || (calendarDays.length > 0 ? calendarDays[calendarDays.length - 1] : null);

  // Leading weekday offset for the first calendar day in the 30-day window
  const firstDayObj = calendarDays.length > 0 ? new Date(calendarDays[0].date) : new Date();
  const leadingOffset = isNaN(firstDayObj.getTime()) ? 0 : firstDayObj.getDay();

  const subNavItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'wearable', label: 'WHOOP' },
    { id: 'environment', label: 'Environment' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'trends', label: 'Trends' },
  ];

  const handleSelectSubView = (id) => {
    soundFx.playPopSound(1.2);
    setGuardianSubView(id);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 font-sans">

      {/* ================= SUB-NAVIGATION BAR ================= */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800/80">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectSubView(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                guardianSubView === item.id || (guardianSubView === 'respiratory' && item.id === 'wearable')
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
      {/* VIEW 1: GUARDIAN OVERVIEW (Image 3 Screen 1)                              */}
      {/* ========================================================================= */}
      {guardianSubView === 'overview' && (
        <div className="space-y-3.5">
          {/* Guardian Master Status Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1628]/95 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              YOUR GUARDIAN STATUS
            </span>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">STABLE</h3>
                <p className="text-xs text-slate-300 leading-tight">
                  Your respiratory & recovery signals are within your range.
                </p>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  Last evaluated 2 min ago
                </span>
              </div>
            </div>

            {/* 3 Status Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 font-mono text-center text-xs">
              <div 
                onClick={() => setGuardianSubView('wearable')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Respiratory</span>
                <span className={`font-bold ${whoopData.respiratoryStatus === 'LOW RISK' ? 'text-emerald-400' : 'text-amber-400'}`}>{whoopData.respiratoryStatus}</span>
              </div>
              <div 
                onClick={() => setGuardianSubView('wearable')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Recovery</span>
                <span className={`font-bold ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryStatus}</span>
              </div>
              <div 
                onClick={() => setGuardianSubView('environment')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Environment</span>
                <span className="text-amber-400 font-bold">{whoopData.aqiStatus}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
              Key Metrics
            </span>
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800">
                <span className="text-xs text-cyan-400 block">💧 SpO₂</span>
                <span className="text-xl font-black text-white">{whoopData.spo2}%</span>
              </div>
              <div 
                onClick={() => setGuardianSubView('environment')}
                className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
              >
                <span className="text-xs text-amber-400 block">☁️ AQI (Bengaluru)</span>
                <span className="text-xl font-black text-amber-400">{whoopData.aqi}</span>
                <span className="text-[10px] text-slate-400 block">{whoopData.aqiStatus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800">
                <span className="text-xs text-rose-400 block">❤️ Recovery</span>
                <span className={`text-xl font-black ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryScore}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 5-CITY METROPOLITAN ENVIRONMENTAL STATION & TIMETABLES             */}
      {/* Cities: Mumbai, Delhi, Bengaluru, Kolkata, Chennai                        */}
      {/* ========================================================================= */}
      {guardianSubView === 'environment' && (() => {
        const activeCityId = selectedCity || 'bengaluru';
        const activeCityMeta = CITIES[activeCityId] || CITIES.bengaluru;
        const env = environmentData || (allCitiesData && allCitiesData[activeCityId]) || getInitialCityEnvironment(activeCityId);
        const aqiInfo = env.aqiDetails || classifyAqi(env.aqi);

        return (
          <div className="space-y-4 animate-in fade-in duration-300 font-mono">

            {/* 1. 5-CITY METROPOLITAN SELECTOR HUD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>5-City Metropolitan Air Quality Network</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline">
                  Live Satellite & CPCB Synchronized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.values(CITIES).map((c) => {
                  const cityData = (allCitiesData && allCitiesData[c.id]) || getInitialCityEnvironment(c.id);
                  const isSelected = activeCityId === c.id;
                  const cAqiInfo = cityData?.aqiDetails || classifyAqi(cityData?.aqi || 75);

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        soundFx.playPopSound(1.2);
                        setSelectedCity(c.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-950/70 to-[#0c1220] border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)] ring-1 ring-cyan-400/50'
                          : 'bg-[#0c1220]/80 hover:bg-[#0e1628] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-lg bg-cyan-400 shadow-[0_0_8px_#00F2FE]" />
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold font-sans ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {c.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans truncate ml-1">
                          {c.state.replace('NCT of ', '')}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-base font-black font-mono ${cAqiInfo.textClass}`}>
                            {cityData?.aqi || '--'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">AQI</span>
                        </div>
                        <span className="text-[11px] font-sans font-medium text-slate-300">
                          {cityData?.weather?.temperature != null ? `${cityData.weather.temperature}°C` : '--'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px]">
                        <span className={`font-sans truncate font-medium ${cAqiInfo.textClass}`}>
                          {cityData?.aqiStatus || cAqiInfo.status}
                        </span>
                        <span className="text-slate-400">
                          {cityData?.weather?.condition?.split(' ')[1] || '⛅'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. City Location & Environmental Station Master Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-3.5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Station Header & Address */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                <div className="flex items-start space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.25)]">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-black text-white font-sans">
                        {env.location?.stationName || `${activeCityMeta.name} Ambient Monitoring Station`}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        PIN: {env.location?.pincode || activeCityMeta.pincode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 font-sans font-medium">
                      {env.location?.fullAddress || activeCityMeta.fullAddress}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {env.location?.latitude || activeCityMeta.latitude}° N, {env.location?.longitude || activeCityMeta.longitude}° E • Elevation {env.location?.elevation || activeCityMeta.elevation} • {env.location?.monitoringZone || activeCityMeta.monitoringZone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => refreshEnvironmentData(true, activeCityId)}
                    disabled={isRefreshingEnv}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingEnv ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>{isRefreshingEnv ? 'Updating...' : `Live Sync (${activeCityMeta.name})`}</span>
                  </button>
                </div>
              </div>

              {/* Station Live Metadata Pill */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>● Live Satellite & CPCB Monitoring Feed</span>
                </span>
                <span className="text-slate-300">
                  Last Updated: <strong className="text-white">{env.lastUpdated || 'Today • Live Station Feed'}</strong>
                </span>
              </div>
            </div>

            {/* 1. AIR QUALITY STATUS */}
            <div className={`p-5 rounded-3xl bg-[#0e1628]/95 border ${aqiInfo.borderClass} space-y-4 shadow-xl relative overflow-hidden`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* AQI Big Hero Number */}
                <div className="flex items-center space-x-4">
                  <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center border ${aqiInfo.bgClass} ${aqiInfo.borderClass} shadow-lg shrink-0`}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">AQI</span>
                    <span className={`text-3xl font-black ${aqiInfo.textClass}`}>
                      {env.aqi}
                    </span>
                    <span className="text-[9px] text-slate-400">US / CPCB</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      1. AIR QUALITY STATUS
                    </span>
                    <h3 className={`text-xl font-black font-sans ${aqiInfo.textClass} flex items-center space-x-2`}>
                      <span>{env.aqiStatus}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${aqiInfo.dotClass} shadow-[0_0_8px_currentColor]`} />
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
                      {aqiInfo.cpcbGrade}
                    </p>
                  </div>
                </div>

                {/* Primary Pollutant Driver Peek */}
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs sm:w-72">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block mb-1">
                    Dominant Driver Pollutant
                  </span>
                  <div className="text-sm font-bold text-white">
                    {env.dominantPollutant || 'PM2.5 (Fine Respirable Particulates)'}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Current value: <strong className="text-white">{env.pollutants?.pm25 ?? '--'} µg/m³</strong> (CPCB Standard: 60 µg/m³)
                  </span>
                </div>
              </div>

              {/* 1-Sentence Health Impact Recommendation */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🫁</span>
                  <strong className="text-cyan-300 font-bold font-sans">
                    Health Impact Recommendation:
                  </strong>
                </div>
                <p className="font-sans text-slate-200 leading-relaxed pl-6">
                  {env.healthRecommendation || 'Air quality is acceptable; unusually sensitive individuals should consider limiting prolonged outdoor exertion along high-density traffic corridors.'}
                </p>
                {env.patientClinicalImpact && (
                  <p className="font-sans text-slate-400 text-[11px] leading-relaxed pl-6 pt-1 border-t border-cyan-500/20">
                    <strong className="text-slate-300">{activeCityMeta.name} Micro-Climate Context:</strong> {env.patientClinicalImpact}
                  </p>
                )}
              </div>
            </div>

            {/* 2. PARTICULATE & CHEMICAL POLLUTANT MATRIX */}
            <div className="p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-3.5 shadow-xl font-mono">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>2. Particulate & Chemical Pollutant Matrix</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-normal">({activeCityMeta.name})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Live concentration metrics vs. CPCB 24-hr standards
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Standard: CPCB India</span>
              </div>

              {/* Structured Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 text-[11px] font-sans border-b border-slate-800 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Pollutant</th>
                      <th className="py-2.5 px-3">Concentration</th>
                      <th className="py-2.5 px-3">24-Hr Standard</th>
                      <th className="py-2.5 px-3">Status / Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">PM2.5</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Fine Respirable Particulates</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.pm25 ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.pm25Limit || 60} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.pm25Status || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          (env.pollutants?.pm25Status || '').includes('Satisfactory') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          (env.pollutants?.pm25Status || '').includes('Moderate') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {env.pollutants?.pm25Status || (env.pollutants?.pm25 <= 60 ? 'Satisfactory' : 'Moderate')}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">PM10</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Inhalable Coarse Dust</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.pm10 ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.pm10Limit || 100} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.pm10Status || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          (env.pollutants?.pm10Status || '').includes('Satisfactory') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {env.pollutants?.pm10Status || (env.pollutants?.pm10 <= 100 ? 'Good' : 'Moderate')}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">NO₂</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Nitrogen Dioxide (Vehicular Exhaust)</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.no2 ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.no2Limit || 80} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.no2Status || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {env.pollutants?.no2Status || (env.pollutants?.no2 <= 80 ? 'Good' : 'Moderate')}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">SO₂</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Sulfur Dioxide (Industrial)</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.so2 ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.so2Limit || 80} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.so2Status || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {env.pollutants?.so2Status || (env.pollutants?.so2 <= 80 ? 'Good' : 'Moderate')}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">CO</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Carbon Monoxide (Combustion)</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.co ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.coLimit || 2000} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.coStatus || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {env.pollutants?.coStatus || (env.pollutants?.co <= 2000 ? 'Good' : 'Moderate')}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        <span className="font-bold">O₃</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Ground-Level Ozone</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {env.pollutants?.o3 ?? '--'} µg/m³
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {env.pollutants?.o3Limit || 100} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (env.pollutants?.o3Status || '').includes('Good') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {env.pollutants?.o3Status || (env.pollutants?.o3 <= 100 ? 'Good' : 'Moderate')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. REAL-TIME WEATHER BIOMETRICS */}
            <div className="p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-3.5 shadow-xl font-mono">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2.5">
                <span className="font-bold text-white font-sans flex items-center space-x-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>3. Real-Time Weather Biometrics</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-normal">({activeCityMeta.name} Meteorological Hub)</span>
                </span>
                <span className="text-cyan-400 font-bold">{env.weather?.condition || 'Real-Time'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-center">
                {/* 1. Temperature & RealFeel */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Temperature & RealFeel</span>
                  </span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {env.weather?.temperature ?? '--'}°C
                  </span>
                  <span className="text-[10px] text-slate-400">
                    RealFeel: <strong className="text-slate-200">{env.weather?.feelsLike ?? env.weather?.temperature ?? '--'}°C</strong>
                  </span>
                </div>

                {/* 2. Relative Humidity */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Relative Humidity</span>
                  </span>
                  <span className="text-xl font-black text-cyan-300 mt-1 block">
                    {env.weather?.humidity ?? '--'}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {env.weather?.humidity > 70 ? 'High Humidity' : env.weather?.humidity < 30 ? 'Dry Air' : 'Optimal Comfort'}
                  </span>
                </div>

                {/* 3. Wind Speed & Direction */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Wind Speed & Direction</span>
                  </span>
                  <span className="text-xl font-black text-teal-300 mt-1 block">
                    {env.weather?.windSpeed ?? '--'} km/h
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Direction: <strong className="text-slate-200">{env.weather?.windDirection || 'Normal'}</strong>
                  </span>
                </div>

                {/* 4. UV Index & Solar Radiation */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>UV Index & Solar Radiation</span>
                  </span>
                  <span className="text-xl font-black text-amber-400 mt-1 block">
                    UV {env.weather?.uvIndex ?? '--'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {env.weather?.solarRadiation || 'Peak 820 W/m² / 0 W/m²'}
                  </span>
                </div>

                {/* 5. Atmospheric Pressure */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Atmospheric Pressure</span>
                  </span>
                  <span className="text-xl font-black text-indigo-300 mt-1 block">
                    {env.weather?.surfacePressure ?? '--'} hPa
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Elevation {activeCityMeta.elevation}
                  </span>
                </div>

                {/* 6. Visibility */}
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Visibility</span>
                  </span>
                  <span className="text-xl font-black text-emerald-300 mt-1 block">
                    {env.weather?.visibilityKm ?? '14.3'} km
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Precipitation: <strong className="text-slate-200">{env.weather?.rainProb ?? '0'}%</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 4. ENVIRONMENTAL TIMETABLES */}
            <div className="p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-4 shadow-xl font-mono">
              
              {/* Solar & Ambient Cycle Timetable Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>4. Environmental Timetables</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-normal">({activeCityMeta.name} Solar & Cycle Matrix)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Solar windows, ambient cycles & synchronized hourly forecasts
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'hourly', label: '24-Hr Hourly' },
                    { id: 'weekly', label: '7-Day Forecast' },
                    { id: 'campus', label: `${activeCityMeta.name} Cycles` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundFx.playPopSound(1.2);
                        setEnvTimetableTab(tab.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        envTimetableTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedicated Solar & Ambient Cycle Timetable Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
                    Sunrise & Sunset
                  </span>
                  <div className="mt-1 font-bold text-white text-xs">
                    🌅 {env.solarTimetable?.sunrise || '06:08 AM'}
                  </div>
                  <div className="text-slate-300 text-xs">
                    🌇 {env.solarTimetable?.sunset || '06:11 PM'}
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1">Solar Day Window</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold">
                    Dawn & Dusk
                  </span>
                  <div className="mt-1 font-bold text-white text-xs">
                    🌌 {env.solarTimetable?.dawn || '05:48 AM'}
                  </div>
                  <div className="text-slate-300 text-xs">
                    🌆 {env.solarTimetable?.dusk || '06:33 PM'}
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1">Civil Twilight Cycle</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-yellow-400 uppercase tracking-wider block font-bold">
                    Peak Solar Hours
                  </span>
                  <div className="mt-1 font-bold text-amber-300 text-xs">
                    ☀️ {env.solarTimetable?.peakSolarHours || '11:30 AM – 02:30 PM'}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Highest UV Window (Max UV ~8.3)</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-bold">
                    Peak AQI Window
                  </span>
                  <div className="mt-1 font-bold text-rose-300 text-xs">
                    🚗 {env.solarTimetable?.peakAqiWindow || '08:30–10:30 AM & 18:00–20:30'}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Daily Traffic Congestion Trapping</span>
                </div>
              </div>

              {/* TIMETABLE VIEW A: 24-HOUR HOURLY TIMETABLE */}
              {envTimetableTab === 'hourly' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Hour & Condition</span>
                    <span>Temp · Humidity · AQI</span>
                    <span className="hidden sm:inline">Respiratory Guidance</span>
                  </div>

                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                    {(env.hourlyTimetable || []).map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors gap-2"
                      >
                        <div className="flex items-center space-x-3 min-w-[130px]">
                          <span className="text-xs font-bold text-white block">
                            {slot.time}
                          </span>
                          <span className="text-xs text-slate-300 font-sans">
                            {slot.condition}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs">
                          <span className="font-bold text-white">{slot.temp}°C</span>
                          <span className="text-slate-400 text-[11px]">{slot.humidity}% RH</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            slot.aqi <= 50 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            slot.aqi <= 100 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            slot.aqi <= 200 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            AQI {slot.aqi}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-sans text-right max-w-xs truncate hidden sm:block">
                          {slot.advice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TIMETABLE VIEW B: 7-DAY FORECAST TIMETABLE */}
              {envTimetableTab === 'weekly' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {(env.dailyTimetable || []).map((d, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border ${
                          d.isToday
                            ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                            : 'bg-slate-900/60 border-slate-800'
                        } space-y-1.5 text-center`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-bold ${d.isToday ? 'text-cyan-300' : 'text-white'}`}>
                            {d.dayName}
                          </span>
                          <span className="text-slate-500 text-[10px]">{d.dateFormatted}</span>
                        </div>

                        <div className="text-xs font-sans text-slate-300 py-1">
                          {d.condition}
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-xs">
                          <span className="font-bold text-white">{d.tempMax}°</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{d.tempMin}°C</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="text-cyan-400">🌧️ {d.rainProb}%</span>
                          <span className="text-amber-400 font-bold">{d.aqiRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TIMETABLE VIEW C: CITY SPECIFIC COMMUTE & MICRO-CLIMATE CYCLES */}
              {envTimetableTab === 'campus' && (
                <div className="space-y-2.5">
                  <p className="text-xs font-sans text-slate-300 leading-relaxed">
                    Micro-climate analysis for {activeCityMeta.name} ({activeCityMeta.state}) based on arterial vehicular congestion and regional atmospheric boundary convection:
                  </p>

                  <div className="space-y-2">
                    {(env.campusTimetable || activeCityMeta.commuteCycles || []).map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{c.window}</span>
                            <span className="text-slate-400 font-sans">({c.period})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            c.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            c.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            AQI {c.expectedAqi}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>Traffic: <strong className="text-slate-200">{c.traffic}</strong></span>
                          <span>Temp: <strong className="text-slate-200">{c.temp}</strong></span>
                        </div>

                        <p className="text-xs font-sans text-slate-300 leading-relaxed pt-1 border-t border-slate-800/60">
                          {c.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* VIEW 3: WEARABLE DATA & RESPIRATORY ANALYSIS (WHOOP 4.0)                  */}
      {/* ========================================================================= */}
      {(guardianSubView === 'wearable' || guardianSubView === 'respiratory') && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-white">
                W
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WHOOP 4.0 Wearable</span>
                <span className="text-[11px] font-mono text-emerald-400">● Connected • Synced {whoopData.lastSynced}</span>
              </div>
            </div>
            <button 
              onClick={syncWhoop}
              disabled={whoopData.isSyncing}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${whoopData.isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Recovery</span>
              <span className={`text-2xl font-black ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryScore}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{whoopData.recoveryStatus}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Sleep</span>
              <span className="text-2xl font-black text-indigo-400">{whoopData.sleepHours}h</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Score: {whoopData.sleepScore}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Strain</span>
              <span className="text-2xl font-black text-cyan-400">{whoopData.dayStrain}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{whoopData.dayStrain >= 14 ? 'High Target' : 'Active Target'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HRV</span>
              <span className="text-2xl font-black text-white">{whoopData.hrv}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ms RMSSD</span>
            </div>
          </div>

          {/* Today's Activity & Heart Rate */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold">Today's Activity</span>
              <span className="text-cyan-400 font-bold">{whoopData.steps.toLocaleString()} / {whoopData.stepsGoal.toLocaleString()} Steps</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div style={{ width: '68%' }} className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-300">Resting Heart Rate</span>
              <span className="text-sm font-black text-rose-400 flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>Avg {whoopData.restingHr} bpm</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Calories</span>
                <span className="font-bold text-amber-300">{whoopData.calories.toLocaleString()} kcal</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Energy (kJ)</span>
                <span className="font-bold text-cyan-300">{whoopData.kilojoule?.toLocaleString() || '3,780'} kJ</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESPIRATORY HEALTH ANALYSIS (Moved into WHOOP Tab)                        */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-3xl bg-[#0e1628]/95 border border-cyan-500/30 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
                RESPIRATORY HEALTH ANALYSIS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Pulse Oximetry
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-[#00F2FE] flex items-center justify-center shrink-0">
                <Activity className="w-7 h-7 text-[#00F2FE] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">CURRENT STATUS</span>
                <h3 className={`text-xl font-black font-sans ${whoopData.respiratoryStatus === 'LOW RISK' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {whoopData.respiratoryStatus}
                </h3>
                <span className="text-xs font-mono text-slate-300">
                  SpO₂: <strong className="text-white">{whoopData.spo2}%</strong> • Strain: <strong className="text-cyan-300">{whoopData.respiratoryStrain}</strong> • {whoopData.breathsPerMin} RPM
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Your breathing pattern is stable. Continuous bronchial telemetry and blood oxygen saturation captured directly by WHOOP 4.0 optical sensor.
            </p>

            <button 
              onClick={() => setIsRespiratoryModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <span>View detailed clinical analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ACCURATE 7-DAY SpO2 TREND CHART (From Official WHOOP History)             */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-3xl bg-[#0e1628]/90 border border-slate-800 space-y-3 font-mono shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">SpO₂ 7-Day History</span>
                <span className="text-[10px] text-slate-400">Official WHOOP Band Telemetry</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
                <span className="text-slate-400">7D Avg:</span>
                <span className="text-emerald-400 font-bold">{whoopData.spo2Avg7D || '95.9'}%</span>
              </div>
            </div>

            {/* Sparkline / Bar Graphic with Exact 7-Day SpO2 points */}
            <div className="h-32 w-full flex items-end justify-between px-2 pt-4 border-b border-slate-800/80 pb-2">
              {(whoopData.spo2History7D || [
                { day: 'Sun', date: '2026-09-20', spo2: 96.1 },
                { day: 'Tue', date: '2026-09-22', spo2: 94.3 },
                { day: 'Wed', date: '2026-09-23', spo2: 95.0 },
                { day: 'Thu', date: '2026-09-24', spo2: 96.4 },
                { day: 'Fri', date: '2026-09-25', spo2: 95.0 },
                { day: 'Sat', date: '2026-09-26', spo2: 97.1 },
                { day: 'Sun', date: '2026-09-27', spo2: 97.3 }
              ]).map((item, idx) => {
                const heightPx = Math.max(20, Math.round((item.spo2 - 90) * 11));
                const isLatest = idx === (whoopData.spo2History7D?.length || 7) - 1;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <span className={`text-[9px] font-bold ${isLatest ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white transition-colors'}`}>
                      {item.spo2}%
                    </span>
                    <div 
                      style={{ height: `${heightPx}px` }} 
                      className={`w-7 rounded-t-lg transition-all ${
                        isLatest 
                          ? 'bg-gradient-to-t from-cyan-900 to-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.6)] ring-1 ring-cyan-400/50' 
                          : 'bg-gradient-to-t from-slate-900 to-teal-400/80 group-hover:to-cyan-400'
                      }`}
                    />
                    <span className={`text-[9px] ${isLatest ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3 Metrics Footer */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Current SpO₂</span>
                <span className="font-bold text-emerald-400">{whoopData.spo2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Strain</span>
                <span className="font-bold text-cyan-300">{whoopData.respiratoryStrain}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                <span className="font-bold text-white">{whoopData.breathsPerMin} RPM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: SLEEP & RECOVERY (Sleep Cycle & Dual Alarm System)                 */}
      {/* ========================================================================= */}
      {guardianSubView === 'sleep' && (
        <div className="space-y-4">
          <SleepAlarmSystem />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: 30-DAY WHOOP BIOMETRICS CALENDAR (Replaces static trends)         */}
      {/* ========================================================================= */}
      {guardianSubView === 'trends' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Calendar Master Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header & Auto-update Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
                  <Calendar className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                    <span>30-Day WHOOP Biometrics Calendar</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Accurate Daily Telemetry Archive • Auto-updates every day
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                  {calendar.summary?.startDate} – {calendar.summary?.endDate}
                </span>
                <button
                  onClick={syncWhoop}
                  disabled={whoopData.isSyncing}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Sync latest biometrics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${whoopData.isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
                </button>
              </div>
            </div>

            {/* 30-Day Summary Aggregates HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Recovery</span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                  {calendar.summary?.avgRecovery || 68.2}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {calendar.summary?.greenDaysCount || 14} Optimal Days
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg SpO₂</span>
                <span className="text-base font-black text-cyan-300 mt-0.5 block">
                  {calendar.summary?.avgSpo2 || 95.3}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Pulse Oximetry
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Sleep</span>
                <span className="text-base font-black text-indigo-300 mt-0.5 block">
                  {calendar.summary?.avgSleep || 6.9}h
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Time in Bed
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Strain</span>
                <span className="text-base font-black text-orange-400 mt-0.5 block">
                  {calendar.summary?.avgStrain || 10.4}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Avg HRV {calendar.summary?.avgHrv || 82}ms
                </span>
              </div>
            </div>

            {/* Metric Mode Filter Pills */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-slate-400 font-sans">
                Calendar Overlay Metric:
              </span>
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: 'recovery', label: 'Recovery' },
                  { id: 'spo2', label: 'SpO₂' },
                  { id: 'sleep', label: 'Sleep' },
                  { id: 'strain', label: 'Strain' },
                  { id: 'hrv', label: 'HRV' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playPopSound(1.2);
                      setCalendarMetric(m.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all ${
                      calendarMetric === m.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1 text-center font-mono">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
                <div key={idx} className="text-[10px] font-bold text-slate-500 py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* 30-Day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 font-mono">
              {/* Leading Empty Cells for Day Alignment */}
              {Array.from({ length: leadingOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="p-1 min-h-[58px] sm:min-h-[66px] rounded-xl bg-slate-900/10 border border-transparent" />
              ))}

              {/* 30 Consecutive Days */}
              {calendarDays.map((day) => {
                const isSelected = activeDay?.date === day.date;
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      soundFx.playPopSound(1.3);
                      setSelectedCalendarDay(day);
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl flex flex-col items-center justify-between min-h-[58px] sm:min-h-[66px] transition-all relative group cursor-pointer text-left ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,242,254,0.35)] border-cyan-400'
                        : day.isToday
                          ? 'bg-slate-900/95 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                          : 'bg-[#0b101c]/80 hover:bg-[#11192e] border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Date & Live Dot */}
                    <div className="flex items-center justify-between w-full text-[10px] leading-none">
                      <span className={day.isToday ? 'text-cyan-300 font-black' : isSelected ? 'text-white font-bold' : 'text-slate-400'}>
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" title="Today" />
                      )}
                    </div>

                    {/* Metric Value Display */}
                    <div className="my-0.5 flex flex-col items-center justify-center">
                      {calendarMetric === 'recovery' && (
                        <span className={`text-[11px] sm:text-xs font-black ${
                          day.recoveryScore >= 67 ? 'text-emerald-400' : day.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {day.recoveryScore}%
                        </span>
                      )}
                      {calendarMetric === 'spo2' && (
                        <span className="text-[11px] sm:text-xs font-black text-cyan-300">
                          {day.spo2}%
                        </span>
                      )}
                      {calendarMetric === 'sleep' && (
                        <span className="text-[11px] sm:text-xs font-black text-indigo-300">
                          {day.sleepHours}h
                        </span>
                      )}
                      {calendarMetric === 'strain' && (
                        <span className="text-[11px] sm:text-xs font-black text-orange-400">
                          {day.strain}
                        </span>
                      )}
                      {calendarMetric === 'hrv' && (
                        <span className="text-[11px] sm:text-xs font-black text-rose-300">
                          {Math.round(day.hrv)}
                        </span>
                      )}
                    </div>

                    {/* Status Color Pill */}
                    <div className="w-full flex items-center justify-center">
                      <span className={`w-3.5 h-1 rounded-full ${
                        day.recoveryScore >= 67 
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' 
                          : day.recoveryScore >= 34 
                            ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' 
                            : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Optimal (≥67%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span>Moderate (34–66%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span>Low (&lt;34%)</span>
              </div>
            </div>
          </div>

          {/* Selected Day Deep Biometrics Breakdown Card */}
          {activeDay && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1222] border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden font-mono">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Day Title & Date */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-black text-white font-sans">
                      {activeDay.fullFormattedDate}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Official WHOOP 4.0 Optical Sensor Telemetry
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  activeDay.isToday 
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 animate-pulse' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {activeDay.isToday ? '● LIVE TODAY' : 'HISTORICAL'}
                </span>
              </div>

              {/* Recovery Score Hero Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                    activeDay.recoveryScore >= 67 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]' 
                      : activeDay.recoveryScore >= 34 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  }`}>
                    {activeDay.recoveryScore}%
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">RECOVERY SCORE</span>
                    <span className={`text-base font-bold font-sans ${
                      activeDay.recoveryScore >= 67 ? 'text-emerald-400' : activeDay.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {activeDay.recoveryStatus} Recovery
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      HRV: <strong className="text-white">{activeDay.hrv} ms</strong> • RHR: <strong className="text-white">{activeDay.restingHr} bpm</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-400 block">Skin Temp</span>
                  <span className="text-sm font-bold text-slate-200">{activeDay.skinTemp} °C</span>
                </div>
              </div>

              {/* 4 Pillars Grid for the Selected Day */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                {/* SpO2 */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 font-bold block">
                    🫁 SpO₂
                  </span>
                  <span className="text-lg font-black text-cyan-300 mt-1 block">{activeDay.spo2}%</span>
                  <span className="text-[10px] text-slate-400">{activeDay.spo2 >= 95 ? 'Optimal Saturation' : 'Mild Strain'}</span>
                </div>

                {/* Sleep */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-400 font-bold block">
                    😴 Sleep
                  </span>
                  <span className="text-lg font-black text-indigo-300 mt-1 block">{activeDay.sleepHours}h</span>
                  <span className="text-[10px] text-slate-400">{activeDay.sleepScore}% Score</span>
                </div>

                {/* Strain */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-orange-500/20">
                  <span className="text-[10px] text-orange-400 font-bold block">
                    ⚡ Day Strain
                  </span>
                  <span className="text-lg font-black text-orange-300 mt-1 block">{activeDay.strain}</span>
                  <span className="text-[10px] text-slate-400">{activeDay.calories.toLocaleString()} kcal</span>
                </div>

                {/* Respiratory Rate */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-teal-500/20">
                  <span className="text-[10px] text-teal-400 font-bold block">
                    🌬️ Resp. Rate
                  </span>
                  <span className="text-lg font-black text-teal-300 mt-1 block">{activeDay.breathsPerMin}</span>
                  <span className="text-[10px] text-slate-400">RPM</span>
                </div>
              </div>

              {/* Quick Action Modal Links */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-xs">
                <button
                  onClick={() => setIsRespiratoryModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold font-mono transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>SpO₂ Clinical Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsSleepModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 font-bold font-mono transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Full Sleep Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 30-Day Recovery Consistency Distribution Bar */}
          <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold">30-Day Recovery Consistency</span>
              <span className="text-slate-400 text-[11px]">{calendar.summary?.totalDays || 30} Days Analyzed</span>
            </div>

            {/* Multi-segment Bar */}
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
              <div 
                style={{ width: `${Math.round(((calendar.summary?.greenDaysCount || 14) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-emerald-400" 
                title={`Optimal: ${calendar.summary?.greenDaysCount} days`}
              />
              <div 
                style={{ width: `${Math.round(((calendar.summary?.yellowDaysCount || 13) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-amber-400" 
                title={`Moderate: ${calendar.summary?.yellowDaysCount} days`}
              />
              <div 
                style={{ width: `${Math.round(((calendar.summary?.redDaysCount || 3) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-rose-500" 
                title={`Low: ${calendar.summary?.redDaysCount} days`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Optimal ({calendar.summary?.greenDaysCount || 14}d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Moderate ({calendar.summary?.yellowDaysCount || 13}d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Rest Needed ({calendar.summary?.redDaysCount || 3}d)</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
