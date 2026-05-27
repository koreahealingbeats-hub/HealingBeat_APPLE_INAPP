import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import { useMusicContext } from "../contexts/MusicContext";
import { MOBILE } from "../constants/mobile";
import { EMOTION_IMAGES } from "../constants/emotionImages";
import { Header } from "../components/atoms/layout/Header";
import { setStorageBPMdatas } from "../utils/storageManage";
import { RESULT_THEME_COLORS } from "../constants/colors";
import useLocales from "../hooks/useLocales";
import ShareableCard from "../components/molecules/share/ShareableCard";
import AnalysisLoadingView from "../components/organisms/analysis/AnalysisLoadingView";
import { calculateStressIndex } from "../utils/stressCalculator";
import StressGauge from "../components/molecules/analysis/StressGauge";
// import MusicList from "../components/organisms/music/MusicList";

const { BACKGROUND, ANALYSIS } = RESULT_THEME_COLORS;

const AnalysisResultPage = () => {
  const { t, isKorean } = useLocales();
  const navigate = useNavigate();
  const { buttonText, capturing } = t("analysis", {
    returnObjects: true,
  });

  const {
    emotions: emotionsTexts,
    title,
    AIarg,
    Reliability,
    StressScore,
    emotionText,
    gender: genderText,
  } = t("analysis.result", {
    returnObjects: true,
  });

  const {
    analysisResults,
    clearAnalysisResults,
    updateUserProfile,
    userProfile, // We need userProfile here
  } = useAnalysisContext();

  const { setCurrentBpm, playlist } = useMusicContext();
  const [loaded, setLoaded] = useState(false);
  const [saveGallery, setSaveGallery] = useState(false);
  const captureRef = useRef(null);

  // 더미 데이터 정의
  const DUMMY_DATA = {
    heartRate: 78,
    emotion: {
      type: "행복",
      typeEn: "HAPPY",
      confidence: 92.5
    },
    allEmotions: [
      { type: "행복", typeEn: "HAPPY", confidence: 92.5 },
      { type: "평온", typeEn: "CALM", confidence: 5.2 },
      { type: "놀람", typeEn: "SURPRISED", confidence: 1.1 },
      { type: "공포", typeEn: "FEAR", confidence: 0.8 },
      { type: "슬픔", typeEn: "SAD", confidence: 0.2 },
      { type: "분노", typeEn: "ANGRY", confidence: 0.1 },
      { type: "혼란", typeEn: "CONFUSED", confidence: 0.1 },
      { type: "혐오", typeEn: "DISGUSTED", confidence: 0.0 },
    ],
    age: { range: "20-30" },
    gender: { value: "Male" },
    capturedImage: null, // 이미지가 없으면 이모지/기본아이콘 표시
    raw: {
      Gender: { Value: "Male" }
    }
  };

  // 테스트 모드 플래그 (true일 경우 데이터가 없으면 더미 데이터 사용)
  // const USE_TEST_DATA = false;
  const USE_TEST_DATA = false;

  console.log(analysisResults,'analysisResults')
  const currentResults = analysisResults || (USE_TEST_DATA ? DUMMY_DATA : null);

  // If no analysis result, redirect to analysis page
  useEffect(() => {
    if (!currentResults && !USE_TEST_DATA && loaded) {
      console.log("No analysis results, redirecting to /analysis");
      navigate("/analysis");
    }
  }, [currentResults, navigate, USE_TEST_DATA, loaded]);

  const bpm =
    currentResults?.vitals?.heartRate || currentResults?.heartRate || 0;

  useEffect(() => {
    if (bpm) {
      setCurrentBpm(bpm);
    }
  }, [bpm, setCurrentBpm]);

  // 페이지 진입 후 로드 애니메이션을 위해
  useEffect(() => {
    if (currentResults) {
      const timer = setTimeout(() => setLoaded(true), 150);
      return () => clearTimeout(timer);
    } else {
      // 데이터가 아예 없는 경우 리다이렉트를 위해 로드 상태를 true로 만듦 (지연 후)
      const timer = setTimeout(() => setLoaded(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentResults]);

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

  if (!currentResults) {
    return <AnalysisLoadingView capturing={capturing} />;
  }

  const stressIndex = calculateStressIndex(bpm, currentResults.allEmotions);

  const resultCol1 = currentResults?.allEmotions?.slice(0, 4);
  const resultCol2 = currentResults?.allEmotions?.slice(4);

  // 가장 큰 confidence를 가진 감정 찾기 (highlight용)
  const maxConfidenceEmotionTypeEn = currentResults?.allEmotions?.reduce(
    (max, emotion) => (emotion.confidence > max.confidence ? emotion : max),
    currentResults?.allEmotions[0]
  )?.typeEn;

  // 표정에 따른 이모티콘 출력 함수
  const getEmotionEmoji = () => {
    const currentEmotion = currentResults.emotion?.type || currentResults.emotion;
    let resultEmotion =
    currentEmotion === "기쁨" || currentEmotion === "행복"
        ? "😊"
        : currentEmotion === "슬픔"
        ? "😢"
        : currentEmotion === "분노"
        ? "😠"
        : currentEmotion === "놀람"
        ? "😲"
        : currentEmotion === "평온"
        ? "😌"
        : currentEmotion === "혼란"
        ? "😵"
        : currentEmotion === "혐오"
        ? "🤢"
        : currentEmotion === "공포" || currentEmotion === "두려움"
        ? "😨"
        : "😊";

    return resultEmotion;
  };

  return (
    <div
      className="min-h-screen"
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: `70px 16px ${playlist && playlist.length ? "120px" : "20px"}`,
        transition: "opacity 0.6s ease-in-out",
        opacity: loaded ? 1 : 0,
        background: BACKGROUND.MAIN,
      }}
    >
      <Header result={true} bpm={bpm} />
      {/* 신뢰도 */}
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          {/* <div
            className="text-[15px] font-[500] leading-5 tracking-tight  mb-6 pl-2 text-right"
            style={{ opacity: 0.5, color: ANALYSIS.RESULT.RELIABILITY }}
          >
            {Reliability} {Math.round(currentResults.confidence)}%
          </div> */}
          {/* 결과 콘텐츠 */}
          <div ref={captureRef} className="flex flex-col items-center">
            <h2
              className="mb-3 text-center"
              style={{
                color: ANALYSIS.RESULT.TITLE,
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {title}
            </h2>
            {/* 캡처된 이미지 (원형) */}
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full overflow-hidden border-4 bg-gray-700"
                style={{ borderColor: ANALYSIS.RESULT.IMAGE_BORDER }}
              >
                {/* 닉네임 대신 캡처된 이미지 표시 */}
                <img
                  src={
                    saveGallery
                      ? EMOTION_IMAGES[currentResults.emotion?.type || currentResults.emotion] ||
                        EMOTION_IMAGES["행복"]
                      : currentResults.capturedImage ||
                        EMOTION_IMAGES[currentResults.emotion?.type || currentResults.emotion] ||
                        EMOTION_IMAGES["행복"]
                  }
                  alt="캡처된 얼굴" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
            {/*  */}
            {/* 메인 결과 카드 - 순차적 레이아웃 */}
            <div className="w-full  mx-auto mb-5">
              {/* 전체 카드 컨테이너 */}
              <div
                className="w-full rounded-[12px]  px-[16px] py-[12px]"
                style={{ background: BACKGROUND.BOX }}
              >
                {/* 1. 감정 요약 정보 */}
                <div className="flex items-center gap-[10px] mb-[15px]">
                  {/* 감정 이미지 */}
                  <div className="w-[60px] h-[60px] relative rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        EMOTION_IMAGES[currentResults.emotion?.type || currentResults.emotion] ||
                        EMOTION_IMAGES["행복"]
                      }
                      style={{
                        position: " absolute",
                        width: "130%",
                        height: "130%",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                      }}
                      alt={currentResults.emotion?.type || currentResults.emotion}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 이모지 표시
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = getEmotionEmoji();
                      }}
                    />
                  </div>

                  {/* 텍스트 영역 */}
                  <div className="flex flex-col align-center  flex-1">
                    <div className="flex flex-1">
                      <h3
                        className="font-[500] text-[16px] leading-5 tracking-tight text-left"
                        style={{ color: ANALYSIS.RESULT.TITLE }}
                      >
                        Heart Rate :
                      </h3>
                      <p
                        className="text-[20px] leading-5 tracking-tight pl-[10px] font-[700] text-center"
                        style={{ color: ANALYSIS.RESULT.HRV }}
                      >
                        {bpm || "--"}
                        <span
                          className="text-[18px] font-[600] pl-[5px]"
                          style={{
                            color: ANALYSIS.RESULT.BPM,
                            fontWeight: 600,
                          }}
                        >
                          BPM
                        </span>
                      </p>
                    </div>

                    <h3
                      className="font-[500] text-[16px] leading-7 tracking-tight text-left"
                      style={{ color: ANALYSIS.RESULT.TITLE }}
                    >
                      {emotionText} :
                      <span
                        className="text-[18px] font-[700] pl-[10px]"
                        style={{
                          color: ANALYSIS.RESULT.BPM,
                        }}
                      >
                        {emotionsTexts[
                          currentResults?.emotion?.typeEn ||
                            userProfile?.raw?.emotion?.typeEn ||
                            currentResults?.rawEmotionData?.emotion?.typeEn
                        ] || currentResults.emotion?.type || currentResults.emotion}
                      </span>
                    </h3>
                  </div>
                </div>
                {/* 3. 감정 상세 정보 - 실제 API 데이터 사용 */}
                <div>
                  {/* 분석 차트 */}
                  {/* 예측 나이, 성별 */}
                  <div>
                    <div className="flex gap-2" style={{ marginBottom: "6px" }}>
                      <div
                        className="flex flex-col justify-center items-center flex-1 h-[72px] py-2 gap-1.5 "
                        style={{
                          padding: "12px",
                          background: ANALYSIS.BOX,
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          className="text-center font-bold text-sm leading-4"
                          style={ANALYSIS.RESULT.COLUMN.DEFAULT}
                        >
                          {AIarg.title}
                        </div>
                        <div
                          className="text-center font-bold text-base leading-5"
                          style={ANALYSIS.RESULT.COLUMN.DEFAULT_BOLD}
                        >
                          {isKorean
                            ? `${userProfile?.ageGroup || "?"}${AIarg.old}`
                            : `${userProfile?.ageGroup || "?"} ${AIarg.old}`}
                        </div>
                      </div>
                      <div
                        className="flex flex-col justify-center items-center flex-1 h-[72px] py-2 gap-1.5 "
                        style={{
                          padding: "12px",
                          background: ANALYSIS.BOX,
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          className="text-center font-bold text-sm leading-4"
                          style={ANALYSIS.RESULT.COLUMN.DEFAULT}
                        >
                          {genderText.title}
                        </div>
                        <div
                          className="text-center font-bold text-base leading-5"
                          style={ANALYSIS.RESULT.COLUMN.DEFAULT_BOLD}
                        >
                          {genderText[userProfile?.raw?.raw?.Gender?.Value || currentResults?.gender?.value] ||
                            userProfile?.gender ||
                            currentResults?.gender?.value}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 스트레스 지수 */}
                  <div 
                  style={{
                    marginBottom:'6px', padding: "12px",
                    background: ANALYSIS.BOX,
                    borderRadius: "8px"
                    }}>
                    <div
                      className="text-center font-bold text-md leading-4"
                      style={ANALYSIS.RESULT.COLUMN.DEFAULT}
                    >
                      {StressScore}
                    </div>
                    <div>
                      <StressGauge score={stressIndex.score} />
                    </div>
                  </div>
                  {/* 평온,슬픔,분노,혼란 */}
                  <div
                    style={{
                      background: ANALYSIS.BOX,
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {resultCol1?.map((emotionData, index) => (
                        <div
                          key={index}
                          className="flex flex-col justify-center items-center flex-1 h-12 py-2 gap-1.5"
                        >
                          {/* ANALYSIS.RESULT.COLUMN  */}
                          <div
                            style={{
                              ...ANALYSIS.RESULT.COLUMN.DEFAULT,
                              ...(emotionData.typeEn === maxConfidenceEmotionTypeEn && {
                                color: "rgb(255, 128, 60)",
                                fontWeight: 700,
                              }),
                            }}
                            className="text-center font-bold text-sm leading-4"
                          >
                            {emotionsTexts[emotionData.typeEn] || emotionsTexts[emotionData.type] || emotionData.type}
                          </div>
                          <div
                            style={{
                              ...ANALYSIS.RESULT.COLUMN.DEFAULT_BOLD,
                              ...(emotionData.typeEn === maxConfidenceEmotionTypeEn && {
                                color: "rgb(255, 128, 60)",
                                fontWeight: 700,
                              }),
                            }}
                            className="text-center text-base leading-5"
                          >
                            {emotionData.confidence}%
                          </div>
                        </div>
                      )) || (
                        // 백업: rawEmotionData가 없는 경우 기본 표시
                        <>
                          <div className="flex flex-col justify-center items-center flex-1 h-16 py-3 gap-1.5">
                            <div className="text-center font-bold text-sm leading-4 text-orange-400">
                              {currentResults.emotion?.type || currentResults.emotion}
                            </div>
                            <div className="text-center font-bold text-base leading-5 text-orange-400">
                              {Math.round(currentResults.emotion?.confidence || currentResults.confidence)}%
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-center flex-1 h-16 py-3 gap-1.5">
                            <div className="text-center text-white text-sm leading-4 font-medium">
                              기타
                            </div>
                            <div className="text-center text-white text-base leading-5 font-semibold">
                              {Math.round(100 - (currentResults.emotion?.confidence || currentResults.confidence))}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* 혐오,행복,놀람,두려움 */}
                  <div
                    style={{
                      background: ANALYSIS.BOX,
                      marginTop: "6px",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {resultCol2?.map((emotionData, index) => (
                        <div
                          key={index}
                          className="flex flex-col justify-center items-center flex-1 h-12 py-2 gap-1.5"
                        >
                          <div
                            style={{
                              ...ANALYSIS.RESULT.COLUMN.DEFAULT,
                              ...(emotionData.typeEn === maxConfidenceEmotionTypeEn && {
                                color: "rgb(255, 128, 60)",
                                fontWeight: 700,
                              }),
                            }}
                            className="text-center font-bold text-sm leading-4"
                          >
                            {emotionsTexts[emotionData.typeEn] || emotionsTexts[emotionData.type] || emotionData.type}
                          </div>
                          <div
                            style={{
                              ...ANALYSIS.RESULT.COLUMN.DEFAULT_BOLD,
                              ...(emotionData.typeEn === maxConfidenceEmotionTypeEn && {
                                color: "rgb(255, 128, 60)",
                                fontWeight: 700,
                              }),
                            }}
                            className="text-center font-bold text-base leading-5"
                          >
                            {emotionData.confidence}%
                          </div>
                        </div>
                      )) || (
                        // 백업: rawEmotionData가 없는 경우 기본 표시
                        <>
                          <div className="flex flex-col justify-center items-center flex-1 h-16 py-3 gap-1.5">
                            <div className="text-center font-bold text-sm leading-4 text-orange-400">
                              {currentResults.emotion?.type || currentResults.emotion}
                            </div>
                            <div className="text-center font-bold text-base leading-5 text-orange-400">
                              {Math.round(currentResults.emotion?.confidence || currentResults.confidence)}%
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-center flex-1 h-16 py-3 gap-1.5">
                            <div className="text-center text-white text-sm leading-4 font-medium">
                              기타
                            </div>
                            <div className="text-center text-white text-base leading-5 font-semibold">
                              {Math.round(100 - (currentResults.emotion?.confidence || currentResults.confidence))}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 공유 및 저장 버튼 */}
          {/* {!saveGallery && <ShareableCard setSaveGallery={setSaveGallery} />} */}
          {/* 버튼들 */}
        </div>
        <div className="w-full flex gap-[8px]">
          <button
            onClick={() => {
              clearAnalysisResults();
              navigate("/analysis");
            }}
            className="flex-1 rounded-[8px] active_btn text-[#037CFF] text-[15px] h-[52px]"
            style={{
              ...ANALYSIS.RESULT.BUTTON_STYLES.RESTART,
              padding: "10px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {buttonText.reStart}
          </button>
          <Link
            to="/analysis/loading"
            className="flex-1 active_btn"
            state={{ BPMupdate: true }}
            onClick={(e) => {
              e.stopPropagation();
              // 분석 결과를 userProfile에 반영
              if (currentResults) {
                updateUserProfile({
                  emotion: currentResults.emotion,
                  stressLevel: currentResults.stressLevel,
                  // 성별과 연령대는 기존 값 유지하거나 분석 결과가 있으면 업데이트
                  gender:
                    currentResults.demographics?.gender || userProfile.gender,
                  ageGroup:
                    currentResults.demographics?.ageGroup ||
                    userProfile.ageGroup,
                  heartRate:
                    currentResults.vitals?.heartRate || userProfile.heartRate,
                  rowData: currentResults,
                });

                // 실제 API에서 받은 BPM 데이터 사용
                const actualBpm =
                  currentResults.vitals?.heartRate ||
                  currentResults.rawEmotionData?.bpm ||
                  0;

                // 실제 BPM이 있으면 사용, 없으면 기본값 80
                const recommendedBpm = actualBpm > 0 ? actualBpm : 80;
                // setCurrentBpm(recommendedBpm);
              }
              setStorageBPMdatas({ bpm });

              // Note: AnalysisResultPage checks for analysisResults, but Result page seems to be a transition page.
              // We are navigating to /result here, which is the original Result.jsx.
            }}
          >
            <button
              className="w-full rounded-[8px] text-[#050F1E] text-[15px] h-[52px]"
              style={{
                ...ANALYSIS.RESULT.BUTTON_STYLES.SUCCESS,
                padding: "10px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {buttonText.success}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
