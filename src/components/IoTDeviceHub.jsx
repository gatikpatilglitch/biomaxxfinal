import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Bluetooth, 
  Wifi, 
  Activity, 
  Wind, 
  BatteryCharging, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Pause,
  Layers,
  Thermometer,
  CloudRain,
  Gauge
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

export default function IoTDeviceHub({ 
  iotConnected, 
  setIotConnected, 
  currentSpo2, 
  setCurrentSpo2, 
  currentAqi, 
  onTriggerSpike 
}) {
  const [pulseRate, setPulseRate] = useState(74);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [inhalerDosesLeft, setInhalerDosesLeft] = useState(142);
  const [inhalerLastUsed, setInhalerLastUsed] = useState('3h 24m ago');
  const [rssi, setRssi] = useState(-62);
  const [activeTab, setActiveTab] = useState('devices'); // devices, stream, architecture
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);

  // Periodic subtle sensor drift simulation when connected
  useEffect(() => {
    if (!iotConnected) return;

    const interval = setInterval(() => {
      setPulseRate(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(95, Math.max(65, prev + delta));
      });
      setRssi(prev => -60 + (Math.floor(Math.random() * 7) - 3));
    }, 2500);

    return () => clearInterval(interval);
  }, [iotConnected]);

  const handleToggleConnect = () => {
    const next = !iotConnected;
    setIotConnected(next);
    soundFx.playPopSound(next ? 1.5 : 0.8);
  };

  const handleTriggerSpikeTest = () => {
    setIsSimulatingSpike(true);
    soundFx.playSpikeAlert();
    if (onTriggerSpike) onTriggerSpike();
    setTimeout(() => setIsSimulatingSpike(false), 8000);
  };

  const handleSimulateInhalerPuff = () => {
    if (inhalerDosesLeft > 0) {
      setInhalerDosesLeft(d => d - 1);
      setInhalerLastUsed('Just now (Puff Recorded)');
      soundFx.playPopSound(2.0);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Master Telemetry Switch */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>IoT Wearable & Atmospheric Mesh</span>
              <span className={`inline-block w-2 h-2 rounded-full ${iotConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              BLE 5.2 • MQTT/TLS 1.3 • ESP32 Hardware Node
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleConnect}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
              iotConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>{iotConnected ? 'Mesh Active' : 'Connect IoT Nodes'}</span>
          </button>

          <button
            onClick={handleTriggerSpikeTest}
            title="Simulate sudden outdoor wildfire/smog spike to verify instant COPD alert triggers"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 border transition-all ${
              isSimulatingSpike
                ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-slate-900 border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimulatingSpike ? 'Spike Fired!' : 'Simulate Smog Spike'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs: Devices vs Architecture */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('devices')}
          className={`text-xs font-mono px-3 py-1 rounded-lg transition-all ${
            activeTab === 'devices' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Connected Devices (3)
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`text-xs font-mono px-3 py-1 rounded-lg transition-all ${
            activeTab === 'architecture' 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          IoT Embedded Specs & Firmware
        </button>
      </div>

      {/* VIEW 1: ACTIVE DEVICES TELEMETRY */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* DEVICE 1: BLE Pulse Oximeter */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 font-sans">Pulse Oximeter</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Model: BioMax-Ox1 (BLE)</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                iotConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {iotConnected ? 'STREAMING' : 'OFFLINE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block">SpO₂ Oxygen</span>
                <span className="text-2xl font-black font-mono text-emerald-400 text-glow-emerald">
                  {iotConnected ? `${currentSpo2}%` : '--'}
                </span>
                <span className="text-[9px] text-slate-400 block">Resting Saturation</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block">Heart Rate</span>
                <span className="text-2xl font-black font-mono text-cyan-400 text-glow-cyan">
                  {iotConnected ? `${pulseRate}` : '--'}
                </span>
                <span className="text-[9px] text-slate-400 block">BPM Pleth</span>
              </div>
            </div>

            {/* Simulated PPG Photoplethysmogram Pulse Waveform */}
            <div className="bg-slate-950 rounded-xl p-2 border border-slate-800/70 relative h-14 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966910_1px,transparent_1px),linear-gradient(to_bottom,#05966910_1px,transparent_1px)] bg-[size:8px_8px]"></div>
              {iotConnected ? (
                <svg className="w-full h-10 text-emerald-400" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path
                    d="M0,20 L30,20 L35,8 L40,32 L45,15 L50,22 L55,20 L90,20 L95,8 L100,32 L105,15 L110,22 L115,20 L150,20 L155,8 L160,32 L165,15 L170,22 L175,20 L200,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                </svg>
              ) : (
                <span className="text-[10px] font-mono text-slate-600">PPG Stream Paused</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>{batteryLevel}% Battery</span>
              </span>
              <span>RSSI: {rssi} dBm</span>
            </div>
          </div>

          {/* DEVICE 2: Smart Inhaler Cap */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 font-sans">Smart Rescue Inhaler</h3>
                  <span className="text-[10px] text-slate-400 font-mono">InhaleGuard-BLE Cap</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Doses Remaining</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {inhalerDosesLeft} <span className="text-xs text-slate-500">/ 200</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(inhalerDosesLeft / 200) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>Last Actuation:</span>
                <span className="text-slate-200 font-bold">{inhalerLastUsed}</span>
              </div>
            </div>

            <button
              onClick={handleSimulateInhalerPuff}
              className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Simulate Rescue Inhaler Dose</span>
            </button>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-center">
              Adherence Score: <span className="text-emerald-400 font-bold">94%</span> (No missed scheduled maintenance)
            </div>
          </div>

          {/* DEVICE 3: Atmospheric Node ESP32 */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 font-sans">AeroSense ESP32</h3>
                  <span className="text-[10px] text-slate-400 font-mono">PMS5003 + BME688</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                MQTT-TLS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-400 block">PM2.5 Laser</span>
                <span className="text-sm font-bold text-cyan-300">
                  {iotConnected ? `${(currentAqi * 0.35).toFixed(1)} µg/m³` : '--'}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-400 block">PM10 Coarse</span>
                <span className="text-sm font-bold text-cyan-300">
                  {iotConnected ? `${(currentAqi * 0.72).toFixed(1)} µg/m³` : '--'}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-400 block">VOC Index</span>
                <span className="text-sm font-bold text-emerald-400">114 (Good)</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-400 block">Barometer</span>
                <span className="text-sm font-bold text-slate-200">1013.8 hPa</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>Station: Balcony Node #1</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Packet Loss</span>
              </span>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: HARDWARE ARCHITECTURE & EMBEDDED SPECS */}
      {activeTab === 'architecture' && (
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              IoT Hardware Architecture & Communication Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              How BioMaxxx bridges microcontrollers, sensor nodes, and real-time clinical dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono block">1. Edge Microcontroller</span>
              <p className="text-slate-300 leading-relaxed">
                <strong>ESP32-WROOM-32E</strong> handles dual-core edge processing. Core 0 samples the <em>MAX30102</em> pulse oximeter I2C bus at 100 Hz, applying a bandpass Butterworth filter to extract clean SpO₂ and R-peak heart rate.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 font-mono block">2. Inhaler Hall Sensor</span>
              <p className="text-slate-300 leading-relaxed">
                The smart inhaler collar houses an ultra-low-power <strong>nRF52840 SoC</strong> with an integrated Hall-effect magnetic reed switch. Every canister compression triggers an instantaneous BLE GATT notification with timestamp & duration.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-400 font-mono block">3. MQTT / WebSocket Bridge</span>
              <p className="text-slate-300 leading-relaxed">
                The atmospheric sensor transmits JSON packets over MQTT to an AWS IoT Core / Mosquitto broker. Node.js backend converts telemetry into high-speed Socket.io broadcast channels consumed by this frontend.
              </p>
            </div>

          </div>

          {/* Code snippet of ESP32 Arduino/C++ sensor loop */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto space-y-1">
            <span className="text-slate-500 block">// ESP32 MQTT Telemetry Firmware Excerpt (PMS5003 + MAX30102)</span>
            <pre className="text-cyan-300">
{`void sendTelemetry() {
  StaticJsonDocument<256> doc;
  doc["nodeId"] = "BIOMAXXX_ESP32_01";
  doc["pm25"]   = pms.pm25_standard;
  doc["pm10"]   = pms.pm10_standard;
  doc["temp"]   = bme.readTemperature();
  doc["aqi"]    = calculateEPA_AQI(pms.pm25_standard);
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish("biomaxxx/v1/sensors/atmospheric", buffer);
}`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
