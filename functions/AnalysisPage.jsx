import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import html2canvas from "html2canvas";
import { Camera, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import { useMusicContext } from "../contexts/MusicContext";
import { MOBILE } from "../constants/mobile";
import { EMOTION_IMAGES } from "../constants/emotionImages";
import {
  formatEmotionResult,
  getErrorMessage,
} from "../api/emotionApi";
import { getCompanyThemeSongs } from "../utils/dataLoader";
import { useEmotionAnalysis } from "../hooks/useEmotionAnalysis";
// 개발용 테스트 도구 (프로덕션에서는 제거 가능)
import "../api/testUtils";
import MusicList from "../components/organisms/music/MusicList";
import { ECG_animation } from "../components/atoms/animation/ECG_animation";
import ShareableCard from "../components/molecules/share/ShareableCard";
import { useBpm } from "../hooks/useBpm";
import { Header } from "../components/atoms/layout/Header";
import { setStorageBPMdatas } from "../utils/storageManage";
import { RESULT_THEME_COLORS } from "../constants/colors";
import useLocales from "../hooks/useLocales";
import AnalysisLoadingView from "../components/organisms/analysis/AnalysisLoadingView";
import AnalysisCameraRing from "../components/organisms/analysis/AnalysisCameraRing";
import AnalysisGuideText from "../components/organisms/analysis/AnalysisGuideText";
import AnalysisActionButtons from "../components/organisms/analysis/AnalysisActionButtons";

const { BACKGROUND, FONT, ANALYSIS } = RESULT_THEME_COLORS;

const AnalysisPage = () => {
  const { t, isKorean } = useLocales();
  const navigate = useNavigate();

  const {
    home,
    cameraloading,
    cameraReady: cameraReadyText,
    capturing,
    introduction,
    buttonText,
    permissionError,
    tooFar,
    tooClose,
    outOfBounds,
    notFront,
  } = t("analysis", {
    returnObjects: true,
  });

  const {
    emotions: emotionsTexts,
    title,
    AIarg,
    Reliability,
    gender: genderText,
  } = t("analysis.result", {
    returnObjects: true,
  });

  const {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    startAnalysis,
    clearAnalysisResults,
    userProfile,
    updateUserProfile,
  } = useAnalysisContext();

  const {
    setCurrentBpm,
    setNewPlaylist,
    isPlaying,
    stopTherapyAudio,
    playlist,
  } = useMusicContext();
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureRef = useRef(null);
  const [companyThemeSongs, setCompanyThemeSongs] = useState(null);
  const { bpm, startMeasurement, stress, finalResult, stopMeasurement } =
    useBpm({
      videoRef,
      overlayRef: canvasRef,
    });
  const [saveGallery, setSaveGallery] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState("SEARCHING"); // "SEARCHING", "PERFECT", "TOO_FAR", "TOO_CLOSE", "OUT_OF_BOUNDS"
  const gatheredDataRef = useRef([]); // 10초간 모인 데이터 (Ref로 관리하여 상태 업데이트 루프 중복 방지)
  const [timerLeft, setTimerLeft] = useState(10); // 10초 타이머
  const trackingFrameRef = useRef(null);
  const lastTrackTimeRef = useRef(0); // 성능 최적화를 위한 마지막 추적 시간 기록
  const gatherIntervalRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const [isAnalysisReady, setIsAnalysisReady] = useState(false); // 버튼을 누르면 추적 시작

  const { loadModels, analyzeFace, trackFace, formatAverageEmotions } = useEmotionAnalysis();

  useEffect(() => {
    setNewPlaylist([]);
    return () => {
      setNewPlaylist([]);
    };
  }, [analysisResults]);

  useEffect(() => {
    const loadData = () => {
      try {
        const themeSongs = getCompanyThemeSongs();
        setCompanyThemeSongs(themeSongs);
        // 기본 플레이리스트로 회사 테마 음악 설정 : 비활성화함. 헷갈림
        // if (themeSongs && themeSongs.songs && themeSongs.songs.length > 0) {
        //   setNewPlaylist(themeSongs.songs, 0);
        // }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };
    // 테라피 음원 정지 : 있는 경우 제거
    stopTherapyAudio();

    loadData();
  }, []);

  useEffect(() => {
    setCurrentBpm(bpm);
  }, [bpm]);

  // 페이지 진입 시 초기화 및 카메라 자동 실행
  useEffect(() => {
    // 페이지 진입 시 이전 분석 결과 초기화
    clearAnalysisResults();
    setIsAnalyzing(false);
    setIsAnalysisReady(false);
    setShowCamera(true); // 페이지 진입 시 showCamera를 true로 설정하여 UI 렌더링
    setHasPermissionError(false); // 초기화 시 권한 에러 초기화
    setProgress(0);
    setIsCapturing(false);
    setCapturedImage(null);
    setCameraReady(false);

    // 카메라 및 모델 초기화
    const startCameraOnMount = async () => {
      try {
        console.log("페이지 진입: 모델 및 카메라 초기화 시작");
        
        await loadModels();
        
        console.log("모델 로딩 완료, 카메라 초기화 진행");
        await initializeCamera();
      } catch (error) {
        console.error("페이지 진입: 카메라/모델 초기화 실패", error);
        // 에러 처리는 handleCameraError에서 하므로 여기서는 로깅만 함
      }
    };

    startCameraOnMount();

    // 페이지를 벗어날 때 카메라 정리
    const handleBeforeUnload = () => {
      cleanupCamera();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // 컴포넌트 언마운트 시 카메라 정리
      cleanupCamera();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 카메라가 준비되었을 때 실시간 추적 루프 시작
  useEffect(() => {
    // 측정 시작 버튼을 눌렀을 때(isAnalysisReady)만 트래킹을 수행하도록 수정
    // (측정 중(isCapturing)에도 트래킹이 계속되어야 경고 UI가 실시간으로 나옵니다)
    if (cameraReady && showCamera && isAnalysisReady && !isAnalyzingRef.current) {
      startTrackingLoop();
    } else {
      stopTrackingLoop();
      // 측정 준비 모드가 아닐 때만 상태를 초기화
      if (!isAnalysisReady) setTrackingStatus("SEARCHING");
    }
    return () => stopTrackingLoop();
  }, [cameraReady, showCamera, isCapturing, isAnalysisReady]);

  const elapsedMsRef = useRef(0);
  const statusBufferRef = useRef([]);

  // 추적 상태(PERFECT 여부)에 따른 10초 자동 수집 로직
  useEffect(() => {
    if (isAnalysisReady) {
      if (trackingStatus === "PERFECT") {
        // PERFECT가 되면 10초 데이터 수집 진행/재개
        resumeGatheringData();
      } else {
        // PERFECT에서 벗어나면 수집 일시정지 (즉각 피드백)
        if (gatherIntervalRef.current) {
          pauseGatheringData();
        }
      }
    }

    return () => pauseGatheringData();
  }, [trackingStatus, isAnalysisReady]);

  const startTrackingLoop = () => {
    const TRACKING_THROTTLE_MS = 550; // 사용자 설정값 유지

    const loop = async (timestamp) => {
      // 마지막 추적 후 THROTTLE_MS가 지났는지 확인
      if (timestamp - lastTrackTimeRef.current >= TRACKING_THROTTLE_MS) {
        if (videoRef.current && !isAnalyzingRef.current) {
          const result = await trackFace(videoRef.current);
          const currentRawStatus = typeof result === "string" ? result : result.status;

          // 미세 흔들림 방지를 위한 스무딩 로직 (최근 3프레임 버퍼로 반응 속도 개선)
          statusBufferRef.current.push(currentRawStatus);
          if (statusBufferRef.current.length > 3) {
            statusBufferRef.current.shift();
          }

          // 버퍼 내에서 상태 빈도 계산
          const counts = {};
          statusBufferRef.current.forEach((s) => (counts[s] = (counts[s] || 0) + 1));
          
          let stableStatus = currentRawStatus; // 기본적으로 현재 상태를 우선 (반응성 강화)
          for (const [status, count] of Object.entries(counts)) {
            // 3번 중 2번 이상 동일 상태일 때만 확실한 상태 변화로 인정
            if (count >= 2) {
              stableStatus = status;
              break;
            }
          }

          setTrackingStatus(stableStatus);
          lastTrackTimeRef.current = timestamp;
        }
      }
      trackingFrameRef.current = requestAnimationFrame(loop);
    };
    
    statusBufferRef.current = []; // 루프 시작 시 버퍼 초기화
    lastTrackTimeRef.current = performance.now();
    trackingFrameRef.current = requestAnimationFrame(loop);
  };

  const stopTrackingLoop = () => {
    if (trackingFrameRef.current) {
      cancelAnimationFrame(trackingFrameRef.current);
      trackingFrameRef.current = null;
    }
  };

  // 10초 타이머 및 200ms 단위 감정 수집
  const resumeGatheringData = () => {
    if (gatherIntervalRef.current) return; // 이미 돌고 있으면 패스
    
    setIsCapturing(true);
    // 처음 시작 시 초기화
    if (elapsedMsRef.current === 0) {
      gatheredDataRef.current = []; 
      setTimerLeft(10); 
      setProgress(0);
      startMeasurement(); // 심박수 측정 시작 (useBpm)
    }

    const TOTAL_DURATION = 10000; // 10초
    const VISUAL_INTERVAL_MS = 50; // 시각적 업데이트는 50ms (초당 20프레임)
    const DATA_INTERVAL_MS = 200; // 데이터 수집은 200ms

    gatherIntervalRef.current = setInterval(async () => {
      elapsedMsRef.current += VISUAL_INTERVAL_MS;
      const currentProgress = (elapsedMsRef.current / TOTAL_DURATION) * 100;
      setProgress(currentProgress);
      setTimerLeft(Math.ceil((TOTAL_DURATION - elapsedMsRef.current) / 1000));

      // 데이터 수집 주기에 도달했을 때 (200ms 마다)
      if (elapsedMsRef.current % DATA_INTERVAL_MS === 0) {
        if (videoRef.current) {
          const freshTrack = await trackFace(videoRef.current, true);
          if (typeof freshTrack === "string") {
            setTrackingStatus(freshTrack);
          } else if (freshTrack && freshTrack.status === "PERFECT") {
            setTrackingStatus("PERFECT");
            gatheredDataRef.current.push(freshTrack.rawDetection);
          }
        }
      }

      if (elapsedMsRef.current >= TOTAL_DURATION) {
        // 10초 도달 완료
        clearGatheringData();
        finishAutoAnalysis();
      }
    }, VISUAL_INTERVAL_MS);
  };

  const pauseGatheringData = () => {
    if (gatherIntervalRef.current) {
      clearInterval(gatherIntervalRef.current);
      gatherIntervalRef.current = null;
    }
    // 일시정지 시 진행도는 유지하되 캡처 중 상태는 끔
    setIsCapturing(false);
  };

  const clearGatheringData = () => {
    pauseGatheringData();
    setProgress(0);
    setTimerLeft(10);
    elapsedMsRef.current = 0;
    stopMeasurement(); // 심박수 측정 취소/정지
  };

  const finishAutoAnalysis = async () => {
    isAnalyzingRef.current = true;
    stopTrackingLoop();
    
    // 마지막 화면 캡처
    let imageDataUrl = null;
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageDataUrl);
    }
    
    const measurementResult = cleanupCamera(); // 심박수 최종
    setShowCamera(false);
    const currentData = gatheredDataRef.current;
    
    try {
      if (!currentData || currentData.length === 0) {
        throw new Error("수집된 데이터가 없습니다.");
      }
      // 평균 포맷팅 (동기 함수)
      const formattedResult = formatAverageEmotions(currentData, imageDataUrl, measurementResult.bpm);
      
      // 상태 업데이트와 내비게이션은 비동기적으로 처리하거나 
      // 이 함수가 이벤트 루프(setInterval/requestAnimationFrame 외)에서 불린 것이 확인되어야 함
      // 여기서는 setInterval이 종료된 후 불리므로 안전함
      startAnalysis(formattedResult);
      setIsAnalyzing(true); // 컨텍스트 상태 업데이트
      navigate("/analysis/result");
    } catch (err) {
      console.error("자동 분석 결과 합산 오류:", err);
      alert("데이터를 분석하는 중 오류가 발생했습니다.");
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
      setShowCamera(true);
    }
  };

  useLayoutEffect(() => {
    return () => cleanupCamera();
  }, []);

  // 카메라 정리 함수
  const cleanupCamera = () => {
    const measurementResult = stopMeasurement();
    console.log("Cleanup Measurement Result:", measurementResult);

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("카메라 스트림 정리됨");
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    return measurementResult;
  };

  // 카메라 초기화
  const initializeCamera = async () => {
    try {
      console.log("카메라 권한 요청 중...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      console.log("카메라 스트림 획득 성공:", mediaStream);
      setStream(mediaStream);

      // videoRef가 준비될 때까지 최대 1초 기다림
      let attempts = 0;
      const maxAttempts = 10;

      while (!videoRef.current && attempts < maxAttempts) {
        console.log(`videoRef 대기 중... (${attempts + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!canvasRef.current) return;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log("비디오 엘리먼트에 스트림 설정 완료");

        videoRef.current.onloadedmetadata = () => {
          console.log("비디오 메타데이터 로드 완료 (imperative)");
          setCameraReady(true);
        };

        // 비디오 재생 시작
        videoRef.current.oncanplay = () => {
          console.log("비디오 재생 가능 상태");
        };
      } else {
        console.error(
          "videoRef.current가 여전히 null입니다. DOM 렌더링 문제일 수 있습니다."
        );
        throw new Error("비디오 엘리먼트를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("카메라 접근 오류:", error);
      handleCameraError(error);
      throw error; // 에러를 다시 던져서 호출하는 곳에서 처리할 수 있도록
    }
  };

  // 3초 카운트다운과 이미지 캡처
  const startCapture = () => {
    setIsCapturing(true);
    setProgress(0);
    // 3초 동안 프로그레스 바 애니메이션
    // const duration = 3000; // 3초
    const duration = 10000;
    const interval = 50; // 50ms마다 업데이트
    const increment = (interval / duration) * 100;

    startMeasurement();
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          captureImage();
          return 100;
        }
        return newProgress;
      });
    }, interval);
  };

  // 이미지 캡처 및 API 전송
  const captureImage = async () => {
    if (!videoRef.current) return;

    // Canvas에 비디오 프레임 그리기
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 좌우 반전된 이미지를 정상으로 복원
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

    // 이미지를 Data URL로 저장
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);

    // 바로 로컬 분석 실행
    await analyzeEmotionsLocal(imageDataUrl);
  };

  // 로컬 face-api.js로 단일 프레임 수동 분석 (안전장치 캡처용으로 남겨둠)
  const analyzeEmotionsLocal = async (imageDataUrl) => {
    try {
      isAnalyzingRef.current = true;
      const measurementResult = cleanupCamera();

      setShowCamera(false);
      setIsCapturing(false);
      setIsAnalyzing(true);

      const formattedResult = await analyzeFace(imageDataUrl, measurementResult.bpm);

      if (formattedResult) {
        await startAnalysis(formattedResult);
        navigate("/analysis/result");
      }
    } catch (error) {
      console.error("감정 분석 오류:", error);
      setIsAnalyzingRef.current = false;
      setIsAnalyzing(false);
      alert(`감정 분석 중 오류가 발생했습니다.\n\n${error.message}`);
      setShowCamera(true);
      setIsCapturing(false);
    }
  };

  // 카메라 에러 처리
  const handleCameraError = (error) => {
    console.error("카메라 에러 상세:", error);
    let errorMessage = "카메라에 접근할 수 없습니다.";
    if (error.name === "NotAllowedError") {
      errorMessage =
        "iframe 환경에서는 카메라 권한을 허용해주세요.\n브라우저 설정에서 카메라 권한을 확인해주세요.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "카메라를 찾을 수 없습니다.";
    } else if (error.name === "NotSupportedError") {
      errorMessage = "브라우저에서 카메라를 지원하지 않습니다.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "카메라가 다른 애플리케이션에서 사용 중입니다.";
    }
    alert(errorMessage);
    setHasPermissionError(true);
    setShowCamera(true);
    setCameraReady(false);
  };

  // 분석 시작(및 재시도) 버튼 클릭 핸들러
  const handleStartAnalysis = async () => {
    // 권한 에러 상태인 경우 (다시 시도하기 버튼 클릭)
    if (hasPermissionError) {
      console.log("카메라 권한 재요청 중...");
      setHasPermissionError(false);
      setShowCamera(true);

      try {
        await initializeCamera();
        console.log("카메라 재초기화 완료");
      } catch (error) {
        console.error("카메라 재초기화 실패:", error);
      }
    } 
    // 카메라가 정상적으로 준비된 경우 (분석 시작하기 버튼 클릭)
    else if (cameraReady && showCamera) {
      console.log("캡처 (자동 추적) 시작 버튼 클릭");
      setIsAnalysisReady(true);
    }
  };

  const handleVideoLoad = () => {
    // 비디오가 로드되면, 비디오의 실제 크기에 맞춰 캔버스 크기 조절
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
    console.log("비디오 메타데이터 로드 완료 (handleVideoLoad)");
    setCameraReady(true);
  };

  // 표정에 따른 이모티콘 출력 함수
  const getEmotionEmoji = () => {
    if (!analysisResults) return "😊";
    
    // 이전에 문자열이었을 수도 있고, 구조화된 객체일 수도 있습니다.
    const emotionName = typeof analysisResults.emotion === "string" 
      ? analysisResults.emotion 
      : analysisResults.emotion?.type;

    let resultEmotion =
      emotionName === "기쁨" || emotionName === "행복"
        ? "😊"
        : emotionName === "슬픔"
        ? "😢"
        : emotionName === "분노"
        ? "😠"
        : emotionName === "놀람"
        ? "😲"
        : emotionName === "평온"
        ? "😌"
        : emotionName === "혼란"
        ? "😵"
        : emotionName === "혐오"
        ? "🤢"
        : emotionName === "공포" || emotionName === "두려움"
        ? "😨"
        : "😊";

    return resultEmotion;
  };

  // 이미지 저장 시 사진 이모티콘으로 변경하는 함수
  useEffect(() => {
    // saveGallery가 true로 변경되었을 때만 캡처 로직 실행
    if (saveGallery) {
      const elementToCapture = captureRef.current;
      if (!elementToCapture) return;

      html2canvas(elementToCapture, { useCORS: true })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "StressSolution.png";
          link.click();
        })
        .catch((error) => {
          console.error("이미지 저장 실패:", error);
        })
        .finally(() => {
          // 캡처가 끝나면 상태를 다시 false로
          setSaveGallery(false);
        });
    }
  }, [saveGallery]);

  // 로딩 페이지 렌더링
  if (isAnalyzing && !analysisResults) {
    return <AnalysisLoadingView capturing={capturing} />;
  }
  // 결과 페이지 렌더링 - AnalysisResultPage 사용을 권장하지만, 사용자가 제공한 코드에 포함되어 있으므로 유지함.
  // 실제 렌더링은 isAnalyzing이 false이거나 analysisResults가 있으면 페이지 이동으로 처리됨 (navigate 호출)
  // 단, 여기서는 navigate("/analysis/result")를 호출하므로 이 부분은 도달하지 않거나 잠깐 보일 수 있음.

  return (
    <div
      style={{
        background: BACKGROUND.MAIN,
        display: "flex",
        flexFlow: "column",
        justifyContent: "space-between",
        gap: "20px",
        padding: "70px 16px 20px",
        height: "100dvh",
      }}
    >
      <Header />
      {/* 메인 콘텐츠 */}
      <div
        className="flex flex-col items-center"
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* 측정 상단 멘트 */}
        <div>
          <h2
            className=" text-center"
            style={{
              color: ANALYSIS.DEFAULT.TITLE,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            {home.title}
          </h2>
          <p
            className=" text-center"
            style={{
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24px",
              marginTop: "12px",
              color: ANALYSIS.DEFAULT.COMMENT,
            }}
          >
            {home.subComment}
          </p>

          {/* 원형 카메라 뷰 */}
          <AnalysisCameraRing
            showCamera={showCamera}
            stream={stream}
            videoRef={videoRef}
            cameraReady={cameraReady}
            handleVideoLoad={handleVideoLoad}
            canvasRef={canvasRef}
            isCapturing={isCapturing}
            progress={progress}
            cameraloading={cameraloading}
            hasPermissionError={hasPermissionError}
            trackingStatus={trackingStatus}
            isAnalysisReady={isAnalysisReady}
          />
          {/* 안내 텍스트 및 버튼 */}
          <AnalysisGuideText
            isCapturing={isCapturing}
            showCamera={showCamera}
            cameraReady={cameraReady}
            capturing={capturing}
            stream={stream}
            progress={progress}
            timerLeft={timerLeft}
            introduction={introduction}
            cameraReadyText={cameraReadyText}
            hasPermissionError={hasPermissionError}
            trackingStatus={trackingStatus}
            isAnalysisReady={isAnalysisReady}
            permissionError={permissionError}
            tooFar={tooFar}
            tooClose={tooClose}
            outOfBounds={outOfBounds}
            notFront={notFront}
          />
        </div>
      </div>
      {/* 하단 분석 버튼 (테스트용 또는 수동 fallback 용도, 프로덕션에서는 제거하거나 숨겨도 됨) */}
      <AnalysisActionButtons
        isCapturing={isCapturing}
        showCamera={showCamera}
        cameraReady={cameraReady}
        handleStartAnalysis={handleStartAnalysis}
        buttonText={buttonText}
        hasPermissionError={hasPermissionError}
        isAnalysisReady={isAnalysisReady}
      />
    </div>
  );
};

export default AnalysisPage;
