import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { 
  Eye, 
  Camera, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Download,
  RotateCcw
} from "lucide-react";
import { soundFx } from "../utils/audioSynthesizer";

/**
 * MediaPipe Face Mesh landmark indices for eyes:
 * Left Eye: 33, 133, 159, 145, 158, 153
 * Right Eye: 362, 263, 386, 374, 387, 380
 */
const LEFT_EYE = {
  left: 33,
  right: 133,
  top1: 159,
  bottom1: 145,
  top2: 158,
  bottom2: 153
};

const RIGHT_EYE = {
  left: 362,
  right: 263,
  top1: 386,
  bottom1: 374,
  top2: 387,
  bottom2: 380
};

function distance(a, b) {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Eye Aspect Ratio (EAR)
 * EAR decreases as the eye closes during a blink.
 */
function calculateEAR(landmarks, eye) {
  if (!landmarks || !landmarks[eye.left] || !landmarks[eye.right] ||
      !landmarks[eye.top1] || !landmarks[eye.bottom1] ||
      !landmarks[eye.top2] || !landmarks[eye.bottom2]) {
    return 0;
  }
  const horizontal = distance(landmarks[eye.left], landmarks[eye.right]);
  const vertical1 = distance(landmarks[eye.top1], landmarks[eye.bottom1]);
  const vertical2 = distance(landmarks[eye.top2], landmarks[eye.bottom2]);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2 * horizontal);
}

export default function AiDryEyeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [blinkCount, setBlinkCount] = useState(0);
  const [leftEAR, setLeftEAR] = useState(0);
  const [rightEAR, setRightEAR] = useState(0);
  const [report, setReport] = useState(null);

  const sessionStartRef = useRef(0);
  const blinkCountRef = useRef(0);
  const blinkTimesRef = useRef([]);
  const eyeHistoryRef = useRef([]);
  const wasClosedRef = useRef(false);
  const lastBlinkTimeRef = useRef(0);
  const sessionActiveRef = useRef(false);

  // Load MediaPipe FaceLandmarker with multi-tier fallback (local wasm/buffer -> CDN wasm/buffer -> GPU/CPU)
  const initMediaPipe = useCallback(async () => {
    try {
      setLoadingModel(true);
      setModelError("");

      // 1. Resolve WASM fileset (try local first, fallback to jsdelivr CDN)
      let vision = null;
      try {
        vision = await FilesetResolver.forVisionTasks("/wasm");
      } catch (wasmErr) {
        console.warn("Local wasm fileset not found, trying CDN:", wasmErr);
        vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
      }

      // 2. Fetch model asset buffer
      let modelBuffer = null;
      try {
        const resp = await fetch("/models/face_landmarker.task");
        if (resp.ok) {
          const ab = await resp.arrayBuffer();
          modelBuffer = new Uint8Array(ab);
        }
      } catch (localFetchErr) {
        console.warn("Local model file fetch error, will try CDN buffer:", localFetchErr);
      }

      if (!modelBuffer) {
        try {
          const cdnResp = await fetch(
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
          );
          if (cdnResp.ok) {
            const ab = await cdnResp.arrayBuffer();
            modelBuffer = new Uint8Array(ab);
          }
        } catch (cdnErr) {
          console.warn("CDN model fetch error:", cdnErr);
        }
      }

      const baseConfig = modelBuffer 
        ? { modelAssetBuffer: modelBuffer }
        : { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" };

      // 3. Initialize FaceLandmarker (attempt GPU first, fallback to CPU)
      let landmarker = null;
      try {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { ...baseConfig, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      } catch (gpuErr) {
        console.warn("GPU delegate unavailable or failed, falling back to CPU delegate:", gpuErr);
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { ...baseConfig, delegate: "CPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }

      landmarkerRef.current = landmarker;
      setLoadingModel(false);
    } catch (error) {
      console.error("Critical MediaPipe initialization failure:", error);
      setModelError("Could not load eye-tracking vision model. Click to retry.");
      setLoadingModel(false);
    }
  }, []);

  useEffect(() => {
    initMediaPipe();

    return () => {
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {}
      }
    };
  }, [initMediaPipe]);

  // Real-time Face & Eye Analysis Loop
  const startVisionLoop = useCallback(() => {
    let lastVideoTime = -1;

    const processFrame = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !landmarker || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      try {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const result = landmarker.detectForVideo(video, performance.now());
          if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];
            const left = calculateEAR(landmarks, LEFT_EYE);
            const right = calculateEAR(landmarks, RIGHT_EYE);

            setLeftEAR(left);
            setRightEAR(right);

            if (sessionActiveRef.current) {
              processBlink(left, right);
            }
          }
        }
      } catch (error) {
        // Drop faulty frame without crashing loop
      }

      animationRef.current = requestAnimationFrame(processFrame);
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start Camera Stream
  async function startCamera() {
    try {
      setCameraError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in this browser environment or insecure origin (requires HTTPS or localhost).");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        await videoRef.current.play();
        setCameraActive(true);
        startVisionLoop();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Camera access error:", error);
      let msg = "Camera permission was denied or camera is unavailable.";
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        msg = "Camera permission denied. Please allow camera access in browser permissions.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        msg = "No webcam device detected on your system.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        msg = "Webcam is currently in use by another application.";
      }
      setCameraError(msg);
      return false;
    }
  }

  // Blink Detection with physiological debouncing & exact interval logging
  function processBlink(left, right) {
    const CLOSED_THRESHOLD = 0.20;
    const OPEN_THRESHOLD = 0.24;
    const averageEAR = (left + right) / 2;

    // Detect eye closing
    if (averageEAR < CLOSED_THRESHOLD && !wasClosedRef.current) {
      wasClosedRef.current = true;
    }

    // Detect eye reopening
    if (averageEAR > OPEN_THRESHOLD && wasClosedRef.current) {
      wasClosedRef.current = false;
      const now = performance.now();

      // Prevent physical bounce or multiple triggers within 250ms
      if (now - lastBlinkTimeRef.current > 250) {
        blinkCountRef.current += 1;
        setBlinkCount(blinkCountRef.current);
        blinkTimesRef.current.push(now);
        lastBlinkTimeRef.current = now;

        try {
          soundFx.playPopSound(1.6);
        } catch (e) {}
      }
    }

    // Store eye measurements
    eyeHistoryRef.current.push({ left, right, time: Date.now() });

    // Keep memory bounded
    if (eyeHistoryRef.current.length > 1000) {
      eyeHistoryRef.current.shift();
    }
  }

  // Finish assessment
  function finishAssessment() {
    clearInterval(timerRef.current);
    sessionActiveRef.current = false;
    setSessionActive(false);
    stopCamera();

    try {
      soundFx.playZenChime();
    } catch (e) {}

    const totalBlinks = blinkCountRef.current;
    const durationSeconds = 15;
    const blinkRateBpm = (totalBlinks / durationSeconds) * 60;
    const history = eyeHistoryRef.current;

    let averageLeft = 0;
    let averageRight = 0;
    if (history.length > 0) {
      averageLeft = history.reduce((sum, item) => sum + item.left, 0) / history.length;
      averageRight = history.reduce((sum, item) => sum + item.right, 0) / history.length;
    }

    // Real measured inter-blink interval (IBI)
    const blinkTimes = blinkTimesRef.current;
    let meanIBI = null;
    if (blinkTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < blinkTimes.length; i++) {
        intervals.push((blinkTimes[i] - blinkTimes[i - 1]) / 1000);
      }
      meanIBI = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // Screening classification: Normal-pattern / Needs-review
    let screeningStatus = "Normal blink-pattern range";
    let isNormal = true;
    if (blinkRateBpm < 10) {
      screeningStatus = "Lower blink frequency — review recommended";
      isNormal = false;
    } else if (blinkRateBpm > 40) {
      screeningStatus = "Higher blink frequency — review recommended";
      isNormal = false;
    }

    const earDifference = Math.abs(averageLeft - averageRight);
    if (earDifference > 0.055) {
      screeningStatus += " (Asymmetrical palpebral opening)";
      isNormal = false;
    }

    setReport({
      blinkRateBpm: blinkRateBpm.toFixed(1),
      totalBlinks,
      meanIBI: meanIBI !== null ? meanIBI.toFixed(2) : "N/A",
      averageLeftEAR: averageLeft.toFixed(3),
      averageRightEAR: averageRight.toFixed(3),
      earDifference: earDifference.toFixed(3),
      screeningStatus,
      isNormal
    });
  }

  // Start 15-second assessment
  async function startAssessment() {
    if (loadingModel) return;
    if (!landmarkerRef.current) {
      setModelError("Eye-tracking model is not ready. Please retry loading.");
      return;
    }

    const cameraReady = await startCamera();
    if (!cameraReady) {
      return;
    }

    try {
      soundFx.playPopSound(1.2);
    } catch (e) {}

    setReport(null);
    blinkCountRef.current = 0;
    setBlinkCount(0);
    blinkTimesRef.current = [];
    eyeHistoryRef.current = [];
    wasClosedRef.current = false;
    lastBlinkTimeRef.current = 0;
    sessionStartRef.current = Date.now();
    setSecondsRemaining(15);
    sessionActiveRef.current = true;
    setSessionActive(true);

    clearInterval(timerRef.current);
    let seconds = 15;
    timerRef.current = setInterval(() => {
      seconds -= 1;
      setSecondsRemaining(seconds);
      if (seconds <= 0) {
        finishAssessment();
      }
    }, 1000);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      sessionActiveRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Export feature vector sample
  const exportSampleCSV = () => {
    if (!report) return;
    const label = report.isNormal ? "normal" : "needs_review";
    const ibiVal = report.meanIBI === "N/A" ? "0.00" : report.meanIBI;
    const csvContent = `blink_rate,mean_ibi,left_ear,right_ear,ear_difference,label\n${report.blinkRateBpm},${ibiVal},${report.averageLeftEAR},${report.averageRightEAR},${report.earDifference},${label}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eye_sample_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            AI Eye Screening
          </h2>
          <p className="text-xs text-slate-400">
            Real-time eye landmark tracking and blink kinematics analysis.
          </p>
        </div>

        <div className="text-xs font-mono">
          {loadingModel ? (
            <span className="text-yellow-400 flex items-center gap-2 bg-yellow-950/30 px-3 py-1.5 rounded-lg border border-yellow-800/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading vision model...
            </span>
          ) : modelError ? (
            <button
              onClick={initMediaPipe}
              className="text-red-400 bg-red-950/40 hover:bg-red-900/50 px-3 py-1.5 rounded-lg border border-red-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{modelError}</span>
            </button>
          ) : (
            <span className="text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Vision model ready
            </span>
          )}
        </div>
      </div>

      {/* Scanner Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="relative h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {/* Camera */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:20px_20px]" />

          {/* Target Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`w-60 h-28 border-2 rounded-2xl flex items-center justify-center gap-8 ${
                sessionActive
                  ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                  : "border-slate-700 border-dashed"
              }`}
            >
              <div className="w-20 h-14 border border-cyan-400/60 rounded-xl flex items-center justify-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    sessionActive ? "bg-cyan-400" : "bg-slate-600"
                  }`}
                />
              </div>
              <div className="w-20 h-14 border border-cyan-400/60 rounded-xl flex items-center justify-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    sessionActive ? "bg-cyan-400" : "bg-slate-600"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Live Information Overlay */}
          {sessionActive && (
            <>
              <div className="absolute top-3 left-3 bg-slate-900/90 rounded-xl px-3 py-2 font-mono border border-slate-800 backdrop-blur-sm">
                <div className="text-[10px] text-slate-400">BLINKS</div>
                <div className="text-xl font-bold text-emerald-400">{blinkCount}</div>
              </div>

              <div className="absolute top-3 right-3 bg-slate-900/90 rounded-xl px-3 py-2 font-mono border border-slate-800 backdrop-blur-sm">
                <div className="text-[10px] text-slate-400">TIME</div>
                <div className="text-xl font-bold text-cyan-400">{secondsRemaining}s</div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-full px-4 py-2 text-xs font-mono text-cyan-300 flex items-center gap-2 backdrop-blur-sm">
                  <Scan className="w-4 h-4 animate-spin text-cyan-400" />
                  Tracking actual eye landmarks
                </div>
              </div>
            </>
          )}

          {cameraError && (
            <div className="absolute bottom-3 left-3 right-3 bg-red-950/90 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 text-center font-mono backdrop-blur-sm">
              {cameraError}
            </div>
          )}
        </div>

        {/* Live EAR Display */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 block font-mono">LEFT EYE EAR</span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              {leftEAR.toFixed(3)}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 block font-mono">RIGHT EYE EAR</span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              {rightEAR.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startAssessment}
          disabled={sessionActive || loadingModel || !!modelError}
          className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 active:scale-98"
        >
          {sessionActive ? (
            <>
              <Scan className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Start 15-Second Eye Scan
            </>
          )}
        </button>

        {/* Results */}
        {report && (
          <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Eye Screening Results
              </div>
              <button
                onClick={exportSampleCSV}
                title="Download CSV sample for classifier training"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Metric title="Blink Rate" value={`${report.blinkRateBpm} BPM`} />
              <Metric title="Total Blinks" value={report.totalBlinks} />
              <Metric
                title="Mean IBI"
                value={report.meanIBI === "N/A" ? "N/A" : `${report.meanIBI}s`}
              />
              <Metric title="Left EAR" value={report.averageLeftEAR} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Metric title="Right EAR" value={report.averageRightEAR} />
              <Metric title="Screening" value={report.screeningStatus} />
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  This is a computer-vision screening result, not a medical diagnosis. Blink frequency and eye landmarks alone cannot determine dry-eye disease or other eye conditions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
      <span className="text-[10px] text-slate-400 block font-mono">{title}</span>
      <span className="text-sm font-bold text-cyan-300 block mt-1 font-mono">{value}</span>
    </div>
  );
}
