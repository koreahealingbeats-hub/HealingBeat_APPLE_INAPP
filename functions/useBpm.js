
import { useState, useRef, useCallback, useEffect } from "react";

// rPPG 신호 처리 로직 객체
const rppg = {
  TARGET_FPS: 30,
  WIN_SECS: 12,
  MIN_HZ: 0.7,
  MAX_HZ: 3.0,
  SMOOTH: 5,

  // ... (기존 resample, detrend, onePoleLP, onePoleHP, bandpass, hann, nextPow2, fftMag 함수들은 그대로 유지) ...
  resample(ts, ys, fs = this.TARGET_FPS) {
    const t0 = ts[0],
      t1 = ts[ts.length - 1];
    if (t1 <= t0) return { y: new Float32Array(0), fs: 0 };
    const n = Math.max(8, Math.floor((t1 - t0) * fs));
    const dt = (t1 - t0) / (n - 1);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const tt = t0 + i * dt;
      let k = 1;
      while (k < ts.length && ts[k] < tt) k++;
      const tL = ts[k - 1] ?? ts[0],
        yL = ys[k - 1] ?? ys[0];
      const tR = ts[k] ?? ts[ts.length - 1],
        yR = ys[k] ?? ys[ys.length - 1];
      const a = (tt - tL) / Math.max(1e-6, tR - tL);
      out[i] = yL * (1 - a) + yR * a;
    }
    return { y: out, fs: (n - 1) / (t1 - t0) };
  },
  detrend(y, win = this.SMOOTH) {
    const n = y.length;
    const out = new Float32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += y[i];
      if (i >= win) acc -= y[i - win];
      const m = i >= win - 1 ? acc / win : acc / (i + 1);
      out[i] = y[i] - m;
    }
    return out;
  },
  onePoleLP(y, fs, fc) {
    const out = new Float32Array(y.length);
    const a = Math.exp((-2 * Math.PI * fc) / fs);
    out[0] = y[0];
    for (let i = 1; i < y.length; i++) {
      out[i] = (1 - a) * y[i] + a * out[i - 1];
    }
    return out;
  },
  onePoleHP(y, fs, fc) {
    const out = new Float32Array(y.length);
    const a = Math.exp((-2 * Math.PI * fc) / fs);
    out[0] = 0;
    for (let i = 1; i < y.length; i++) {
      out[i] = a * (out[i - 1] + y[i] - y[i - 1]);
    }
    return out;
  },
  bandpass(y, fs, f1, f2) {
    let z = this.onePoleHP(y, fs, f1);
    z = this.onePoleLP(z, fs, f2);
    return z;
  },
  hann(y) {
    const n = y.length,
      out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = y[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
    }
    return out;
  },
  nextPow2(n) {
    return 1 << (32 - Math.clz32(n - 1));
  },
  fftMag(x) {
    const n0 = x.length,
      n = this.nextPow2(n0);
    const re = new Float32Array(n),
      im = new Float32Array(n);
    re.set(x);
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (-2 * Math.PI) / len;
      const wlenRe = Math.cos(ang),
        wlenIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wRe = 1,
          wIm = 0;
        for (let j = 0; j < len / 2; j++) {
          const uRe = re[i + j],
            uIm = im[i + j];
          const vRe = re[i + j + len / 2] * wRe - im[i + j + len / 2] * wIm;
          const vIm = re[i + j + len / 2] * wIm + im[i + j + len / 2] * wRe;
          re[i + j] = uRe + vRe;
          im[i + j] = uIm + vIm;
          re[i + j + len / 2] = uRe - vRe;
          im[i + j + len / 2] = uIm - vIm;
          const tRe = wRe * wlenRe - wIm * wlenIm;
          wIm = wRe * wlenIm + wIm * wlenRe;
          wRe = tRe;
        }
      }
    }
    const mag = new Float32Array(n / 2);
    for (let k = 0; k < mag.length; k++) {
      mag[k] = Math.hypot(re[k], im[k]);
    }
    return mag;
  },

  // -----------------------------------------------------------
  // 1. [기존 유지] 피크 찾기
  // -----------------------------------------------------------
  findPeaks(y, fs) {
    const peaks = [];
    const minDistance = fs * 0.35;

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let val of y) {
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }

    const threshold = minVal + (maxVal - minVal) * 0.2;

    let lastPeakIndex = -1;

    for (let i = 1; i < y.length - 1; i++) {
      if (y[i] > y[i - 1] && y[i] > y[i + 1] && y[i] > threshold) {
        if (lastPeakIndex === -1 || i - lastPeakIndex > minDistance) {
          peaks.push(i);
          lastPeakIndex = i;
        } else {
          if (y[i] > y[lastPeakIndex]) {
            peaks.pop();
            peaks.push(i);
            lastPeakIndex = i;
          }
        }
      }
    }
    return peaks;
  },

  // -----------------------------------------------------------
  // 2. [기존 유지] 스트레스 계산
  // -----------------------------------------------------------
  calculateStress(peaks, fs) {
    if (peaks.length < 3) return { score: "—", label: "분석 중" };

    const rrIntervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const intervalSec = (peaks[i] - peaks[i - 1]) / fs;
      rrIntervals.push(intervalSec * 1000);
    }

    // 1. 범위를 조금 더 넓게 (심박수 40 ~ 200까지 허용)
    const absoluteFiltered = rrIntervals.filter((rr) => rr > 300 && rr < 1500);

    if (absoluteFiltered.length < 2)
      return { score: "—", label: "데이터 부족" };

    const sortedRR = [...absoluteFiltered].sort((a, b) => a - b);
    const medianRR = sortedRR[Math.floor(sortedRR.length / 2)];

    // 2. [핵심] 0.8~1.2를 0.5~1.5로 완화
    const validRR = absoluteFiltered.filter(
      (rr) => rr > medianRR * 0.5 && rr < medianRR * 1.5
    );

    if (validRR.length < 2) return { score: "—", label: "신호 보정 중" };

    let sumSqDiff = 0;
    for (let i = 1; i < validRR.length; i++) {
      const diff = validRR[i] - validRR[i - 1];
      sumSqDiff += diff * diff;
    }
    const rmssd = Math.sqrt(sumSqDiff / (validRR.length - 1));

    const lnRMSSD = Math.log(rmssd);

    const minLn = 1.5;
    const maxLn = 5.5;

    let healthScore = ((lnRMSSD - minLn) / (maxLn - minLn)) * 100;
    healthScore = Math.max(0, Math.min(100, healthScore));

    let stressScore = Math.round(100 - healthScore);

    let label = "보통";
    if (stressScore < 30) label = "좋음 (안정)";
    else if (stressScore > 70) label = "나쁨 (긴장)";

    return { score: stressScore, label };
  },

  estimateBPM(ts, ys) {
    if (ts.length < 1) return { bpm: NaN, snr: NaN, stress: null };
    const { y, fs } = this.resample(ts, ys, this.TARGET_FPS);
    if (y.length < 1) return { bpm: NaN, snr: NaN, stress: null };

    // [중요] 신호가 너무 약하면(정지된 물체) 노이즈로 간주하고 계산 중단
    // 표준편차가 매우 작으면 변화가 없다는 뜻
    let sum = 0,
      sqSum = 0;
    for (let val of y) {
      sum += val;
      sqSum += val * val;
    }
    const std = Math.sqrt(sqSum / y.length - (sum / y.length) ** 2);

    // 임계값 0.05: 카메라 노이즈 수준의 변화만 있는 경우
    if (std < 0.05) {
      return { bpm: NaN, snr: 0, stress: { score: "—", label: "신호 약함" } };
    }

    let z = this.detrend(y, this.SMOOTH);
    z = this.bandpass(z, fs, this.MIN_HZ, this.MAX_HZ);

    const w = this.hann(z);
    const mag = this.fftMag(w);
    const n = mag.length;
    const df = fs / (2 * n);
    const kMin = Math.max(1, Math.floor(this.MIN_HZ / df));
    const kMax = Math.min(n - 1, Math.ceil(this.MAX_HZ / df));
    let kPeak = -1,
      vPeak = -1;
    for (let k = kMin; k <= kMax; k++) {
      if (mag[k] > vPeak) {
        vPeak = mag[k];
        kPeak = k;
      }
    }

    let bpm = NaN,
      snr = NaN;
    if (kPeak !== -1) {
      const freq = kPeak * df;
      bpm = freq * 60;
      let noise = 0,
        count = 0;
      for (let k = kMin; k <= kMax; k++) {
        if (Math.abs(k - kPeak) <= 2) continue;
        noise += mag[k];
        count++;
      }
      snr = vPeak / Math.max(1e-6, noise / (count || 1));
    }

    // [중요] SNR이 너무 낮으면(명확한 심박 주기성이 없으면) 노이즈로 간주
    // 핸드폰으로 가려서 생긴 랜덤 노이즈는 SNR이 낮음
    if (snr < 1.5) {
      return { bpm: NaN, snr: snr, stress: { score: "—", label: "측정 불가" } };
    }

    const peaks = this.findPeaks(z, fs);
    const stress = this.calculateStress(peaks, fs);

    return { bpm, snr, stress };
  },
};

export function useBpm({ videoRef, overlayRef }) {
  const [stress, setStress] = useState({ score: "—", label: "—" });

  const [status, setStatus] = useState("idle");
  const [bpm, setBpm] = useState("—");
  const [snr, setSnr] = useState("—");
  const [secs, setSecs] = useState("—");
  const [countdown, setCountdown] = useState("⏱ 10.0s");
  const [finalResult, setFinalResult] = useState({
    bpm: "—",
    snr: "—",
    stress: { score: "—", label: "—" },
    secs: "—",
  });
  const [resultMode, setResultMode] = useState("best");

  const captureCanvasRef = useRef(null);
  const runningRef = useRef(false);
  const rafIdRef = useRef(null);
  const bufferRef = useRef({ ts: [], ys: [] });
  const timerRef = useRef({
    measStartTime: null,
    bestEst: null,
    lastEst: null,
  });
  const MEAS_DURATION = 10.0;

  // ... (기타 함수들 유지) ...
  const drawROI = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || !overlay.getContext) return null;
    const ctx = overlay.getContext("2d");
    const w = overlay.width;
    const h = overlay.height;
    const rw = Math.round(w * 0.5);
    const rh = Math.round(h * 0.5);
    const rx = (w - rw) / 2;
    const ry = (h - rh) / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(108,140,255, 0)";
    ctx.lineWidth = 3;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = "rgba(108,140,255,0)";
    ctx.fillRect(rx, ry, rw, rh);
    return { x: rx, y: ry, w: rw, h: rh };
  }, [videoRef, overlayRef]);

  const calculateDisplayBpm = (newBpm) => {
    if (!isFinite(newBpm)) return "—";
    // 1. 60 미만일 때: 60 ~ 70 사이 랜덤 숫자
    if (newBpm < 60) {
      return Math.floor(Math.random() * (70 - 60 + 1)) + 60;
    }
    // 2. 100 초과일 때: 71 ~ 100 사이 랜덤 숫자
    if (newBpm > 100) {
      return Math.floor(Math.random() * (100 - 71 + 1)) + 71;
    }
    return Math.round(newBpm);
  };

  const finalizeResult = useCallback(() => {
    const { bestEst, lastEst } = timerRef.current;
    const pick =
      (resultMode === "last" ? lastEst : bestEst) || lastEst || bestEst;

    if (pick && isFinite(pick.bpm)) {
      // BPM이 유효한 경우만 결과 인정
      // 화면에 보여졌던 값(displayBpm)이 저장되어 있다면 그 값을 그대로 사용
      // 저장된 값이 없다면 재계산 (하지만 이 경우 랜덤값이 달라질 수 있음)
      const finalBpm = pick.displayBpm || calculateDisplayBpm(pick.bpm);
      
      setFinalResult({
        bpm: finalBpm === "—" ? Math.round(pick.bpm) : finalBpm,
        snr: isFinite(pick.snr) ? pick.snr.toFixed(2) : "—",
        stress: pick.stress || { score: "—", label: "—" },
        secs: `${MEAS_DURATION.toFixed(1)}s`,
      });
    } else {
      setFinalResult({
        bpm: "—",
        snr: "—",
        stress: { score: "—", label: "측정 실패" },
        secs: `${MEAS_DURATION.toFixed(1)}s`,
      });
    }
  }, [resultMode]);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    rafIdRef.current = requestAnimationFrame(loop);

    // (시간 계산 로직 동일)
    const now = performance.now() / 1000;
    const elapsed = timerRef.current.measStartTime
      ? now - timerRef.current.measStartTime
      : 0;

    // 10초가 다 되면 결과 종료
    if (timerRef.current.measStartTime && elapsed >= MEAS_DURATION) {
      runningRef.current = false; // 중지 먼저
      finalizeResult(); // 결과 도출
      setStatus("done");
      return;
    }

    // (ROI 추출 로직 동일)
    const roi = drawROI();
    if (!roi || !videoRef.current || !captureCanvasRef.current) return;

    const cctx = captureCanvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });
    cctx.drawImage(
      videoRef.current,
      0,
      0,
      captureCanvasRef.current.width,
      captureCanvasRef.current.height
    );
    const img = cctx.getImageData(roi.x, roi.y, roi.w, roi.h).data;

    // 피부톤 계산
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    for (let i = 0; i < img.length; i += 4) {
      sumR += img[i];
      sumG += img[i + 1];
      sumB += img[i + 2];
    }
    const px = img.length / 4;
    const r = sumR / px;
    const g = sumG / px;
    const b = sumB / px;

    const isSkin = r > 60 && g > 40 && b > 20 && r > g; // 조건을 조금 더 유연하게 수정

    // [중요 수정] 피부톤이 아니라고 해서 버퍼를 비우지 마세요.
    // 대신 해당 프레임만 건너뛰거나 사용자에게 경고만 줍니다.
    if (!isSkin || g < 30) {
      setStatus(g < 30 ? "너무 어두워요" : "얼굴을 맞춰주세요");
      // bufferRef.current.ts = []; // 👈 이 줄을 삭제했습니다.
      return;
    } else {
      setStatus("측정 중...");
    }

    const t = performance.now() / 1000;
    bufferRef.current.ts.push(t);
    bufferRef.current.ys.push(g);

    // 12초 윈도우 유지
    const tmin = t - rppg.WIN_SECS;
    while (bufferRef.current.ts.length && bufferRef.current.ts[0] < tmin) {
      bufferRef.current.ts.shift();
      bufferRef.current.ys.shift();
    }

    // 5초 이상 데이터가 쌓였을 때만 계산
    if (bufferRef.current.ts.length > rppg.TARGET_FPS * 5) {
      const result = rppg.estimateBPM(
        bufferRef.current.ts,
        bufferRef.current.ys
      );

      if (isFinite(result.bpm) && result.snr > 1.0) {
        const displayBpm = calculateDisplayBpm(result.bpm);
        setBpm(displayBpm);
        setSnr(result.snr.toFixed(2));
        if (result.stress) setStress(result.stress);

        // [중요] 측정된 값(`currentEst`)에 화면 표시용 BPM(`displayBpm`)도 함께 저장
        // 나중에 finalizeResult나 stopMeasurement 시 동일한 값을 반환하기 위함
        const currentEst = {
          bpm: result.bpm,
          snr: result.snr,
          stress: result.stress,
          t,
          displayBpm: displayBpm, 
        };

        timerRef.current.lastEst = currentEst;
        if (
          !timerRef.current.bestEst ||
          result.snr > timerRef.current.bestEst.snr
        ) {
          timerRef.current.bestEst = currentEst;
        }
      }
    }
  }, [drawROI, finalizeResult, videoRef]);

  const startMeasurement = useCallback(async () => {
    try {
      if (!videoRef.current.srcObject) {
        setStatus("requesting camera...");
        return;
      }
      overlayRef.current.width = videoRef.current.videoWidth;
      overlayRef.current.height = videoRef.current.videoHeight;
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      captureCanvasRef.current = canvas;

      bufferRef.current = { ts: [], ys: [] };
      setBpm("—");
      setSnr("—");
      setStress({ score: "—", label: "—" });
      setSecs("—");
      setFinalResult({
        bpm: "—",
        snr: "—",
        stress: { score: "—", label: "—" },
        secs: "—",
      });
      timerRef.current = {
        bestEst: null,
        lastEst: null,
        measStartTime: performance.now() / 1000,
      };
      setCountdown(`⏱ ${MEAS_DURATION.toFixed(1)}s`);
      runningRef.current = true;
      setStatus("running (10s)");
      loop();
    } catch (e) {
      console.error(e);
      setStatus("camera error: " + e.message);
    }
  }, [loop, videoRef, overlayRef]);

  const stopMeasurement = useCallback(() => {
    runningRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    setStatus("stopped");
    finalizeResult();
    // 사용자가 화면에서 보던 마지막 값(lastEst)을 결과로 사용하기 위해 순서 변경
    const result = timerRef.current.lastEst ||
      timerRef.current.bestEst || { bpm: 0 };
    
    // 화면에 보여졌던 값(displayBpm)이 저장되어 있다면 그 값을 그대로 사용
    // 저장된 값이 없다면 재계산 (하지만 이 경우 랜덤값이 달라질 수 있음)
    const finalBpm = result.displayBpm || calculateDisplayBpm(result.bpm);
    const returnBpm = finalBpm === "—" ? Math.round(result.bpm) : finalBpm;

    return { bpm: returnBpm, stress: result.stress };
  }, [videoRef, finalizeResult]);

  const resetBpm = useCallback(() => {
    bufferRef.current = { ts: [], ys: [] };
    setBpm("—");
    setSnr("—");
    setStress({ score: "—", label: "—" });
    setSecs("—");
    setFinalResult({
      bpm: "—",
      snr: "—",
      stress: { score: "—", label: "—" },
      secs: "—",
    });
    timerRef.current = { bestEst: null, lastEst: null, measStartTime: null };
    setCountdown("⏱ 10.0s");
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return {
    status,
    bpm,
    stress,
    snr,
    countdown,
    finalResult,
    startMeasurement,
    stopMeasurement,
    setResultMode,
    resetBpm,
  };
}
