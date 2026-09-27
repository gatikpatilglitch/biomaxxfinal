import React from 'react';
import { X, Bell, Wind, Shield, Moon, Check, CheckCircle2 } from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function GuardianAlertsModal() {
  const { isAlertsModalOpen, setIsAlertsModalOpen, alerts, markAlertsRead, unreadAlertCount } = useWhoopData();

  if (!isAlertsModalOpen) return null;

  const handleClose = () => {
    setIsAlertsModalOpen(false);
    markAlertsRead();
    soundFx.playPopSound(0.8);
  };

  const getAlertIcon = (iconName) => {
    switch (iconName) {
      case 'wind': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'shield': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'moon': return <Moon className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D131F] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4 font-sans text-slate-100 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Guardian Alerts</h3>
                {unreadAlertCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                    {unreadAlertCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">Automated AI Health & Air Notifications</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                alert.unread 
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.1)]' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 mt-0.5 shrink-0">
                    {getAlertIcon(alert.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{alert.title}</span>
                      {alert.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{alert.subtitle}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-xs hover:bg-slate-800 transition-colors"
        >
          Mark All As Read & Close
        </button>
      </div>
    </div>
  );
}
