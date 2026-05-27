import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RESULT_THEME_COLORS } from "../constants/colors";
import useLocales from "../hooks/useLocales";
import './pages.css';
import loading_step01 from '../assets/images/ing_step01.png';
import loading_step02 from '../assets/images/ing_step02.png';
import loading_step03 from '../assets/images/ing_step03.png';
import loading_step04 from '../assets/images/ing_step04.png';
import Result from "./Result";


const { BACKGROUND, ANALYSIS, RESULT_PAGE } = RESULT_THEME_COLORS;

const AnalysisLoadingPage = () => {
  const { t, isKorean } = useLocales();
  const navigate = useNavigate();
  
  const { buttonText, capturing } = t("analysis", {
    returnObjects: true,
  });

  const [baseText, setBaseText] = useState(capturing?.creating || "힐링비트 생성중...");
  const [dots, setDots] = useState("");
  const [nextComponent, setNextComponent] = useState(false);
  const [timeoutValue, setTimeoutValue] = useState(3);

  useEffect(() => {
    // 2초 뒤에 기본 텍스트 변경
    const textTimer = setTimeout(() => {
      setBaseText(capturing?.changing || "전체 음원 변경중...");
    }, 2000);

    // 카운트다운 타이머 (1초마다 감소)
    const countdownTimer = setInterval(() => {
      setTimeoutValue((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setNextComponent(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 0.5초마다 점(.)이 늘어나는 애니메이션
    const dotTimer = setInterval(() => {
      // setDots((prev) => {
      //   if (prev === "...") return "";
      //   if (prev === "..") return "...";
      //   if (prev === ".") return "..";
      //   return ".";
      // });
    }, 250);

    // 컴포넌트 언마운트 시 타이머들 정리
    return () => {
      clearTimeout(textTimer);
      clearInterval(countdownTimer);
      clearInterval(dotTimer);
    };
  }, [navigate, capturing]);

  return (
    <div
      className="min-h-screen"
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100%",
        justifyContent: "center",
        transition: "all .3s",
      }}
    >
      {/* <Result/> */}
      {
        nextComponent ? 
        <Result/> :
        <div>
          <div className="countdown">
            <div
              key={timeoutValue}
              className="count-number animation-text"
              style={{
                background: RESULT_PAGE.TITLE,
                textShadow: `0 0 10px ${RESULT_PAGE.TITLE}44`,
                color: "transparent",
                backgroundClip: "text",
              }}
            >
              {timeoutValue}
            </div>
          </div>
          <div className="loading_container">
            <div className="loading_image_wrapper">
              <img src={loading_step01} className="icon_loading step01"/>
              <img src={loading_step02} className="icon_loading step02"/>
              <img src={loading_step03} className="icon_loading step03"/>
              <img src={loading_step04} className="icon_loading step04"/>
            </div>
            <p style={{color:"#333", textAlign:'center', fontSize:'18px', fontWeight:500}}>
              {baseText}{dots}
            </p>
          </div>

        </div>
      }
    </div>
  );
};

export default AnalysisLoadingPage;
