import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Siren,
  Activity,
  Heart,
  Wind,
  Thermometer,
  Moon,
  Battery,
  Waves,
  ChevronRight,
  Phone,
  Eye,
  X
} from 'lucide-react';
import { SEVERITY } from '../../hooks/useVitalsTriage';
import { soundFx } from '../../utils/audioSynthesizer';

// Severity UI mapping with escalating visual urgency
const SENTINEL_STYLES = {
  [SEVERITY.NORMAL]: {
    border: 'border-emerald-500/30',
    bg: 'bg-[#0a1a10]/90',
    glow: '',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    title: 'All Vitals Normal',
    subtitle: 'No health concerns detected. Keep it up!',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accentGlow: 'shadow-[0_0_12px_rgba(52,211,153,0.15)]',
    pulseRing: false
  },
  [SEVERITY.WATCH]: {
    border: 'border-sky-500/30',
    bg: 'bg-[#0a1420]/90',
    glow: '',
    icon: Eye,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30',
    title: 'Minor Deviations Detected',
    subtitle: 'Some vitals slightly off-baseline. No action needed yet.',
    dotColor: 'bg-sky-400',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    accentGlow: '',
    pulseRing: false
  },
  [SEVERITY.WARNING]: {
    border: 'border-amber-500/40 hover:border-amber-500/60',
    bg: 'bg-[#1a1400]/90',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/40',
    title: 'Health Warning',
    subtitle: 'Notable vital deviations — consider scheduling a check-up.',
    dotColor: 'bg-amber-400',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    accentGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    pulseRing: false
  },
  [SEVERITY.CRITICAL]: {
    border: 'border-orange-500/50 hover:border-orange-500/70',
    bg: 'bg-gradient-to-r from-[#1a0a00]/95 via-[#1a0500]/90 to-[#0e1628]/90',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    icon: ShieldAlert,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20 border-orange-500/50',
    title: '⚠️ See a Doctor Today',
    subtitle: 'Critical vitals detected — urgent medical evaluation recommended.',
    dotColor: 'bg-orange-400',
    badgeColor: 'bg-orange-500/20 text-orange-200 border-orange-500/50',
    accentGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    pulseRing: true
  },
  [SEVERITY.EMERGENCY]: {
    border: 'border-rose-500/60 hover:border-rose-500/80',
    bg: 'bg-gradient-to-r from-rose-950/95 via-red-950/90 to-[#0e1628]/90',
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]',
    icon: Siren,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/25 border-rose-500/60',
    title: '🚨 EMERGENCY — Visit ER Now',
    subtitle: 'Life-threatening vital signs. Seek immediate medical attention.',
    dotColor: 'bg-rose-500',
    badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-500/60',
    accentGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
    pulseRing: true
  }
};

// Map vital names to display-friendly icons
const VITAL_ICONS = {
  spo2: Activity,
  restingHr: Heart,
  hrv: Waves,
  respiratoryRate: Wind,
  skinTemp: Thermometer,
  recovery: Battery,
  sleep: Moon
};

const VITAL_BADGE_COLORS = {
  [SEVERITY.EMERGENCY]: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  [SEVERITY.CRITICAL]: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  [SEVERITY.WARNING]: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  [SEVERITY.WATCH]: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

export default function HealthSentinelCard({ triageResult, onOpenDoctorModal, userData }) {
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!triageResult) return null;

  const { overallSeverity, alerts, flaggedCount, shouldVisitDoctor, isEmergency } = triageResult;
  const style = SENTINEL_STYLES[overallSeverity] || SENTINEL_STYLES[SEVERITY.NORMAL];
  const SeverityIcon = style.icon;

  // Reset dismissed state when severity escalates
  useEffect(() => {
    if (shouldVisitDoctor) {
      setDismissed(false);
    }
  }, [overallSeverity, shouldVisitDoctor]);

  // Don't show the card if it's normal and user dismissed
  if (overallSeverity === SEVERITY.NORMAL && dismissed) return null;

  const handleCardClick = () => {
    soundFx?.playPopSound?.(1.3);
    if (shouldVisitDoctor) {
      onOpenDoctorModal?.();
    } else {
      setShowDetails(!showDetails);
    }
  };

  const emergencyPhone = userData?.emergencyDoctor || '+91 98765 43210';

  return (
    <div className={`w-full rounded-3xl ${style.bg} border ${style.border} ${style.glow} relative overflow-hidden transition-all duration-300`}>
      
      {/* Ambient glow effects for critical/emergency */}
      {(overallSeverity === SEVERITY.CRITICAL || overallSeverity === SEVERITY.EMERGENCY) && (
        <>
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isEmergency ? 'bg-rose-500/15' : 'bg-orange-500/10'
          }`} />
          <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isEmergency ? 'bg-rose-500/10' : 'bg-orange-500/8'
          }`} />
        </>
      )}

      {/* Main Card Content (Clickable) */}
      <div
        onClick={handleCardClick}
        className="p-4 sm:p-5 cursor-pointer relative z-10"
      >
        <div className="flex items-start gap-3.5">
          {/* Severity Icon with optional pulse ring */}
          <div className="relative shrink-0">
            {style.pulseRing && (
              <div className={`absolute inset-0 rounded-2xl animate-ping opacity-30 ${
                isEmergency ? 'bg-rose-500' : 'bg-orange-500'
              }`} />
            )}
            <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border ${style.iconBg} ${style.accentGlow}`}>
              <SeverityIcon className={`w-5 h-5 ${style.iconColor} ${style.pulseRing ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-white tracking-tight font-sans">
                {style.title}
              </h3>
              {flaggedCount > 0 && overallSeverity !== SEVERITY.NORMAL && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${style.badgeColor}`}>
                  {flaggedCount} FLAGGED
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
              {style.subtitle}
            </p>

            {/* Flagged Vitals Mini-Tags */}
            {flaggedCount > 0 && overallSeverity !== SEVERITY.NORMAL && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {alerts.slice(0, 4).map((alert, idx) => {
                  const Icon = VITAL_ICONS[alert.vital] || Activity;
                  const tagColor = VITAL_BADGE_COLORS[alert.severity] || VITAL_BADGE_COLORS[SEVERITY.WARNING];
                  return (
                    <div
                      key={`tag-${alert.vital}-${idx}`}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${tagColor}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>{alert.threshold?.label?.split('(')[0]?.trim()?.split(' ').slice(0, 2).join(' ') || alert.vital}</span>
                    </div>
                  );
                })}
                {alerts.length > 4 && (
                  <span className="text-[9px] text-slate-500 font-mono self-center">+{alerts.length - 4} more</span>
                )}
              </div>
            )}
          </div>

          {/* Action indicator */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${style.dotColor} ${style.pulseRing ? 'animate-pulse' : ''}`} />
            <ChevronRight className={`w-4 h-4 ${style.iconColor} opacity-60`} />
          </div>
        </div>
      </div>

      {/* ── Expanded Details Section ─────────────────────────────── */}
      {showDetails && !shouldVisitDoctor && flaggedCount > 0 && (
        <div className="px-4 sm:px-5 pb-4 border-t border-slate-800/60 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-3 space-y-2">
            {alerts.slice(0, 3).map((alert, idx) => {
              const Icon = VITAL_ICONS[alert.vital] || Activity;
              return (
                <div
                  key={`detail-${alert.vital}-${idx}`}
                  className="flex items-start gap-2.5 text-[11px] p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60"
                >
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                    alert.severity === SEVERITY.WARNING ? 'text-amber-400' :
                    alert.severity === SEVERITY.WATCH ? 'text-sky-400' : 'text-slate-400'
                  }`} />
                  <div>
                    <p className="text-slate-300 font-sans">{alert.message}</p>
                    {alert.recommendation && (
                      <p className="text-cyan-300/80 text-[10px] mt-1 font-sans">💡 {alert.recommendation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Emergency Quick-Call Strip ───────────────────────────── */}
      {shouldVisitDoctor && (
        <div className={`px-4 sm:px-5 pb-4 pt-0 border-t ${isEmergency ? 'border-rose-800/40' : 'border-orange-800/40'} flex items-center gap-2`}>
          <a
            href={`tel:${emergencyPhone.replace(/\s/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
              isEmergency
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Call Doctor Now
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx?.playPopSound?.(1.2);
              onOpenDoctorModal?.();
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono transition-all cursor-pointer"
          >
            View All Vitals
          </button>
        </div>
      )}

    </div>
  );
}
