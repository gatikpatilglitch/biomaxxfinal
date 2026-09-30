import React, { useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Phone,
  Heart,
  Activity,
  Wind,
  Thermometer,
  Moon,
  Battery,
  Waves,
  ChevronRight,
  Siren,
  MapPin,
  Clock
} from 'lucide-react';
import { SEVERITY } from '../../../hooks/useVitalsTriage';
import { soundFx } from '../../../utils/audioSynthesizer';

// Severity-specific UI config
const SEVERITY_CONFIG = {
  [SEVERITY.EMERGENCY]: {
    bgGradient: 'from-rose-950/98 via-red-950/95 to-[#0a0a0a]',
    borderColor: 'border-rose-500/70',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/25 border-rose-500/60',
    badgeText: 'text-rose-200',
    glowColor: 'shadow-[0_0_60px_rgba(244,63,94,0.35)]',
    headerText: '🚨 EMERGENCY — VISIT ER IMMEDIATELY',
    headerSub: 'Life-threatening vitals detected. Do not delay.',
    icon: Siren,
    pulseClass: 'animate-pulse'
  },
  [SEVERITY.CRITICAL]: {
    bgGradient: 'from-orange-950/95 via-red-950/90 to-[#0a0a0a]',
    borderColor: 'border-orange-500/60',
    accentColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/20 border-orange-500/50',
    badgeText: 'text-orange-200',
    glowColor: 'shadow-[0_0_40px_rgba(249,115,22,0.25)]',
    headerText: '⚠️ CRITICAL — SEE A DOCTOR TODAY',
    headerSub: 'Multiple vitals require urgent medical evaluation.',
    icon: ShieldAlert,
    pulseClass: ''
  },
  [SEVERITY.WARNING]: {
    bgGradient: 'from-amber-950/90 via-[#1a1400]/80 to-[#0a0a0a]',
    borderColor: 'border-amber-500/50',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/40',
    badgeText: 'text-amber-200',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    headerText: '⚡ WARNING — MONITOR CLOSELY',
    headerSub: 'Some vitals need attention. Consider scheduling a check-up.',
    icon: AlertTriangle,
    pulseClass: ''
  },
  [SEVERITY.WATCH]: {
    bgGradient: 'from-sky-950/80 via-[#0a1520] to-[#0a0a0a]',
    borderColor: 'border-sky-500/40',
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/15 border-sky-500/30',
    badgeText: 'text-sky-200',
    glowColor: '',
    headerText: '👁️ WATCH — MINOR DEVIATIONS',
    headerSub: 'Vitals slightly off-baseline. No immediate action needed.',
    icon: Activity,
    pulseClass: ''
  }
};

// Map vital names to icons
const VITAL_ICONS = {
  spo2: Activity,
  restingHr: Heart,
  hrv: Waves,
  respiratoryRate: Wind,
  skinTemp: Thermometer,
  recovery: Battery,
  sleep: Moon
};

// Severity badge colors
const SEVERITY_BADGE = {
  [SEVERITY.EMERGENCY]: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
  [SEVERITY.CRITICAL]: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  [SEVERITY.WARNING]: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  [SEVERITY.WATCH]: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  [SEVERITY.NORMAL]: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export default function DoctorAlertModal({ isOpen, onClose, triageResult, userData }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      soundFx?.playPopSound?.(1.5);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !triageResult) return null;

  const { overallSeverity, alerts, allResults, flaggedCount, isEmergency, timestamp } = triageResult;
  const config = SEVERITY_CONFIG[overallSeverity] || SEVERITY_CONFIG[SEVERITY.WARNING];
  const HeaderIcon = config.icon;

  const emergencyPhone = userData?.emergencyDoctor || '+91 98765 43210';
  const emergencyFamily = userData?.emergencyFamily || '+91 87654 32109';

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b ${config.bgGradient} border-t ${config.borderColor} ${config.glowColor} z-10 animate-in slide-in-from-bottom-5 duration-300`}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-20 flex justify-center pt-3 pb-1 bg-inherit rounded-t-3xl">
          <div className="w-12 h-1.5 rounded-full bg-slate-600" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white z-20 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pb-6 space-y-5">

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="text-center space-y-3 pt-2">
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${config.badgeBg} border ${config.pulseClass}`}>
              <HeaderIcon className={`w-8 h-8 ${config.accentColor}`} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight font-sans">
                {config.headerText}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{config.headerSub}</p>
            </div>
            <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </span>
              <span>•</span>
              <span>{flaggedCount} vital{flaggedCount !== 1 ? 's' : ''} flagged</span>
            </div>
          </div>

          {/* ── EMERGENCY CALL BUTTONS ──────────────────────────────── */}
          {(overallSeverity === SEVERITY.EMERGENCY || overallSeverity === SEVERITY.CRITICAL) && (
            <div className="space-y-2">
              <a
                href={`tel:${emergencyPhone.replace(/\s/g, '')}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm font-mono shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Call Doctor: {emergencyPhone}
              </a>
              <a
                href={`tel:${emergencyFamily.replace(/\s/g, '')}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-rose-500/50 text-slate-200 font-bold text-xs font-mono transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                Emergency Family: {emergencyFamily}
              </a>
              {isEmergency && (
                <a
                  href="tel:108"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 font-bold text-xs font-mono transition-all cursor-pointer hover:bg-rose-900/50"
                >
                  <Siren className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  Call Ambulance: 108
                </a>
              )}
            </div>
          )}

          {/* ── FLAGGED VITALS BREAKDOWN ────────────────────────────── */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
              Flagged Vitals ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.map((alert, idx) => {
                const Icon = VITAL_ICONS[alert.vital] || Activity;
                const badgeClass = SEVERITY_BADGE[alert.severity];
                return (
                  <div
                    key={`${alert.vital}-${idx}`}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white font-sans">
                            {alert.threshold?.label || alert.vital}
                          </span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    {alert.recommendation && (
                      <div className="pl-12 text-[11px] text-cyan-300/90 font-sans flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-cyan-500" />
                        <span>{alert.recommendation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── ALL VITALS STATUS ───────────────────────────────────── */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
              All Vitals Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allResults.map((result, idx) => {
                const Icon = VITAL_ICONS[result.vital] || Activity;
                const isNormal = result.severity === SEVERITY.NORMAL;
                const badgeClass = SEVERITY_BADGE[result.severity];
                return (
                  <div
                    key={`all-${result.vital}-${idx}`}
                    className={`p-2.5 rounded-xl border ${isNormal ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-900/60 border-slate-800'} transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isNormal ? 'text-emerald-400' : badgeClass.split(' ')[1]}`} />
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        {result.threshold?.label?.split('(')[0]?.trim() || result.vital}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-sm font-black ${isNormal ? 'text-emerald-300' : 'text-white'}`}>
                        {result.value}{result.threshold?.unit || ''}
                      </span>
                      <span className={`text-[9px] font-mono font-bold uppercase ${isNormal ? 'text-emerald-500' : badgeClass.split(' ')[1]}`}>
                        {result.severity === SEVERITY.NORMAL ? '✓ OK' : result.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── NEAREST HOSPITAL ────────────────────────────────────── */}
          {(overallSeverity === SEVERITY.EMERGENCY || overallSeverity === SEVERITY.CRITICAL) && (
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-sans">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Nearest Hospital</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                M.S. Ramaiah Memorial Hospital, New BEL Road, Bangalore - 560054
              </p>
              <a
                href="https://maps.google.com/?q=MS+Ramaiah+Memorial+Hospital+Bangalore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/25 transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                Open in Maps
              </a>
            </div>
          )}

          {/* ── MEDICAL DISCLAIMER ─────────────────────────────────── */}
          <div className="pt-3 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500 leading-relaxed text-center font-sans">
              <strong className="text-slate-400">⚕️ Medical Disclaimer:</strong> BioMaxxx is not a medical device. 
              These alerts are based on WHOOP wearable data and clinical reference ranges, not diagnostic tests. 
              Always consult a licensed healthcare provider for medical decisions. In case of emergency, call 108.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
