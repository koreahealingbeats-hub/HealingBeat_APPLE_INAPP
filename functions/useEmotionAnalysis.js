import { useState } from 'react';
import * as faceapi from 'face-api.js';

export const useEmotionAnalysis = () => {
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  // 얼굴 감지 감도 설정을 위한 상수들 (너프 처리)
  const TRACKING_SENSITIVITY = {
    // 중심 이탈 감도 (1.5 -> 2.5로 더 확대)
    CENTER_ALLOWED_RADIUS_RATIO: 2.5,

    // 거리(크기) 감도 (더 멀리 있거나 더 가까이 있어도 허용하도록 대폭 확장)
    MIN_FACE_SIZE_RATIO: 0.05,
    MAX_FACE_SIZE_RATIO: 0.95,

    // 측면 감지 감도 (0.1 ~ 5.0 -> 0.05 ~ 20.0으로 대폭 완화)
    SIDE_VIEW_RATIO_MIN: 0.05,
    SIDE_VIEW_RATIO_MAX: 20.0,
  };

  const loadModels = async () => {
    try {
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      }
      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      }
      if (!faceapi.nets.faceExpressionNet.isLoaded) {
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      }
      if (!faceapi.nets.ageGenderNet.isLoaded) {
        await faceapi.nets.ageGenderNet.loadFromUri('/models');
      }
      setIsModelsLoaded(true);
    } catch (error) {
      console.error("모델 로드 실패:", error);
      throw error;
    }
  };

  const analyzeFace = async (imageDataUrl, measuredBpm) => {
    const img = new Image();
    img.src = imageDataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // face-api.js 모델을 이용해 얼굴 검출 및 감정/성별/나이 분석 (scoreThreshold 더 완화 0.4 -> 0.25)
    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.25 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (!detection) {
      throw new Error("얼굴이 감지되지 않았습니다. 얼굴이 명확히 보이는 사진을 다시 촬영해주세요.");
    }

    return formatAnalyzedResults(detection, imageDataUrl, measuredBpm);
  };

  // 실시간 얼굴 추적 (위치 및 크기 기반 상태 반환)
  // return: "PERFECT" | "TOO_FAR" | "TOO_CLOSE" | "OUT_OF_BOUNDS" | "SEARCHING"
  const trackFace = async (videoElement, extractEmotions = false) => {
    if (!videoElement || !isModelsLoaded) return "SEARCHING";

    let detection;
    if (extractEmotions) {
      detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.25 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
    } else {
      detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.25 }))
        .withFaceLandmarks();
    }
    
    if (!detection) return "SEARCHING";

    const box = detection.detection ? detection.detection.box : detection.box;
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // 중심좌표 계산
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;
    
    const viewportCenterX = videoWidth / 2;
    const viewportCenterY = videoHeight / 2;

    // 화면 렌더링이 1:1 비율의 원형(object-cover)이므로, 짧은 축(minDim)을 기준으로 계산
    const minDim = Math.min(videoWidth, videoHeight);
    
    // UI상 보여지는 실제 원형 영역의 반지름
    const visibleRadius = minDim / 2;

    // 얼굴 중심점이 화면 중심에서 벗어나는 거리를 계산
    const distFromCenter = Math.sqrt(
      Math.pow(faceCenterX - viewportCenterX, 2) + Math.pow(faceCenterY - viewportCenterY, 2)
    );

    // 허용 반경: 보이는 반지름의 임계값 내에 중심점이 있어야 함.
    const allowedRadius = visibleRadius * TRACKING_SENSITIVITY.CENTER_ALLOWED_RADIUS_RATIO;

    if (distFromCenter > allowedRadius) {
      return "OUT_OF_BOUNDS";
    }

    // 얼굴 크기 (비율) - 보이는 영역 대비 박스 너비
    const faceRatio = box.width / minDim;

    // 너무 가깝거나 먼 것을 감지
    if (faceRatio < TRACKING_SENSITIVITY.MIN_FACE_SIZE_RATIO) return "TOO_FAR";
    if (faceRatio > TRACKING_SENSITIVITY.MAX_FACE_SIZE_RATIO) return "TOO_CLOSE";

    // 측면 얼굴 방지 로직 (landmarks 데이터를 활용해 코와 양 끝 턱선의 거리를 비교)
    // 얼굴이 너무 가깝거나(distortion 발생 가능성) 위치가 불안정하면 정면 체크를 건너뜁니다.
    if (detection.landmarks && faceRatio < (TRACKING_SENSITIVITY.MAX_FACE_SIZE_RATIO * 0.8)) {
      const jawOutline = detection.landmarks.getJawOutline(); // 점 17개 배열
      const noseTip = detection.landmarks.getNose()[3]; // 코 끝

      const leftEdge = jawOutline[0]; // 왼쪽 가장자리
      const rightEdge = jawOutline[16]; // 오른쪽 가장자리

      const leftDist = Math.abs(noseTip.x - leftEdge.x);
      const rightDist = Math.abs(rightEdge.x - noseTip.x);

      // 한쪽이 다른 한쪽보다 지나치게 크면 비대칭(측면을 보는 중)으로 간주
      const ratio = leftDist / rightDist;
      
      // ratio가 1에 가까울수록 정면
      // 너무 좌측/우측을 바라보면 측정 제외
      if (ratio < TRACKING_SENSITIVITY.SIDE_VIEW_RATIO_MIN || ratio > TRACKING_SENSITIVITY.SIDE_VIEW_RATIO_MAX) {
        return "NOT_FRONT";
      }
    }

    // 위치도 맞고, 크기도 적당함
    return { status: "PERFECT", rawDetection: detection };
  };

  // N초간 수집한 감정 데이터를 평균내어 결과 생성하는 함수
  // aggregatedEmotions는 [{ expressions, age, gender, ... }] 형태의 배열
  const formatAverageEmotions = (aggregatedDataArray, lastImageDataUrl, avgBpm) => {
    if (!aggregatedDataArray || aggregatedDataArray.length === 0) {
      throw new Error("수집된 감정 데이터가 없습니다.");
    }

    // 가장 마지막의 나이, 성별, BBox 데이터 기준 사용
    const baseDetection = aggregatedDataArray[aggregatedDataArray.length - 1];
    
    // 평균 감정 수치 계산
    const allExpKeys = Object.keys(baseDetection.expressions);
    const avgExpressions = {};
    
    allExpKeys.forEach(key => {
      const sum = aggregatedDataArray.reduce((acc, curr) => acc + (curr.expressions[key] || 0), 0);
      avgExpressions[key] = sum / aggregatedDataArray.length;
    });

    // 평균 나이 계산
    const sumAge = aggregatedDataArray.reduce((acc, curr) => acc + (curr.age || 0), 0);
    const avgAge = sumAge / aggregatedDataArray.length;

    // baseDetection의 expressions와 age를 평균값으로 덮어씀
    const mergedDetection = {
       ...baseDetection,
       expressions: avgExpressions,
       age: avgAge
    };

    return formatAnalyzedResults(mergedDetection, lastImageDataUrl, avgBpm);
  };

  // 기존 API 포맷 및 데이터 구조를 만드는 공통 함수
  const formatAnalyzedResults = (detection, imageDataUrl, measuredBpm) => {
    const expressions = detection.expressions;
    // 가장 높은 확률의 감정 찾기
    const maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
    const confidence = expressions[maxExpression];

    const EMOTION_MAP = {
      happy: "기쁨",
      sad: "슬픔",
      angry: "분노",
      surprised: "놀람",
      fearful: "두려움",
      disgusted: "혐오",
      neutral: "평온",
    };

    const koreanEmotion = EMOTION_MAP[maxExpression] || "평온";

    const { age, gender, genderProbability } = detection;
    const preciseAge = Math.round(age);

    const rawEmotions = Object.keys(expressions).map(exp => ({
      key: exp,
      value: expressions[exp] * 100
    }));

    // 일단 반올림한 정수값들 계산
    let roundedEmotions = rawEmotions.map(e => ({
      ...e,
      rounded: Math.round(e.value)
    }));

    // 총합 계산
    const sum = roundedEmotions.reduce((acc, curr) => acc + curr.rounded, 0);
    const diff = 100 - sum;

    // 차이가 있다면 가장 수치가 높은 감정(주 감정)에 더해줌 (합이 100이 되도록 조정)
    if (diff !== 0 && roundedEmotions.length > 0) {
      const maxIdx = roundedEmotions.reduce((maxI, curr, i, arr) => 
        curr.rounded > arr[maxI].rounded ? i : maxI, 0);
      roundedEmotions[maxIdx].rounded += diff;
      
      // 만약 조정 후 음수가 되면 (이론상 희박하지만) 0으로 보정
      if (roundedEmotions[maxIdx].rounded < 0) roundedEmotions[maxIdx].rounded = 0;
    }

    const lowAge = Math.max(0, preciseAge - 2);
    const highAge = preciseAge + 2;

    const formattedResult = {
      age: { range: `${lowAge}-${highAge}`, value: preciseAge, low: lowAge, high: highAge },
      gender: { value: gender === 'male' ? "Male" : "Female", confidence: Math.round(genderProbability * 100) },
      emotion: {
         type: koreanEmotion,
         typeEn: maxExpression.toUpperCase(),
         // 주 감정의 수치도 조정된 값 사용
         confidence: roundedEmotions.find(e => e.key === maxExpression).rounded
      },
      allEmotions: roundedEmotions.map(e => ({
         type: EMOTION_MAP[e.key] || "평온",
         typeEn: e.key.toUpperCase(),
         confidence: e.rounded
      })),
      features: {
         smile: { value: maxExpression === 'happy', confidence: Math.round(expressions.happy * 100) },
         mouthOpen: { value: false, confidence: 0 },
         eyesOpen: { value: true, confidence: 100 },
         eyeglasses: { value: false, confidence: 0 },
      },
      pose: { pitch: 0, roll: 0, yaw: 0 },
      raw: detection
    };

    formattedResult.raw.Gender = { Value: formattedResult.gender.value, Confidence: formattedResult.gender.confidence };
    formattedResult.raw.age = { low: formattedResult.age.low, high: formattedResult.age.high };

    const isValidBpm = measuredBpm && !isNaN(measuredBpm) && measuredBpm !== "—" && measuredBpm > 0;
    formattedResult.heartRate = isValidBpm ? measuredBpm : 72;
    formattedResult.capturedImage = imageDataUrl;

    return formattedResult;
  };

  return {
    isModelsLoaded,
    loadModels,
    analyzeFace,
    trackFace,
    formatAverageEmotions
  };
};
