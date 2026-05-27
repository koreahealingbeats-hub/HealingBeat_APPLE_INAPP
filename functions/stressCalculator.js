/**
 * Calculates a dynamic stress index based on BPM and a list of all detected emotions.
 * @param {number} bpm - Heart rate in beats per minute
 * @param {Array} allEmotions - Array of { type: string, typeEn: string, confidence: number }
 * @returns {Object} { score: number, label: string }
 */
export const calculateStressIndex = (bpm, allEmotions) => {
  // 1. BPM Component (Non-linear scaling around baseline 70)
  const numericBpm = Number(bpm);
  let bpmScore = 50; // Baseline at 72 BPM
  if (!isNaN(numericBpm) && numericBpm > 0) {
    const diff = numericBpm - 72;
    // Positive difference has higher impact, negative difference reduces score
    bpmScore += diff * (diff > 0 ? 1.5 : 1.0);
  }

  // 2. Emotion Component with Weighted Sensitivity
  // Differentiating intensity of emotions for better variation
  const weights = {
    // High Stress
    ANGRY: 1.5, FEAR: 1.5, FEARFUL: 1.5,
    // Moderate Stress
    SAD: 1.0, DISGUSTED: 1.0, CONFUSED: 1.0, SURPRISED: 0.5,
    // High Stability (Subtracts more)
    HAPPY: 1.5, CALM: 1.5,
    // Baseline Stability (Subtracts less)
    NEUTRAL: 0.6
  };

  let emotionImpact = 0;

  if (Array.isArray(allEmotions)) {
    allEmotions.forEach(emotion => {
      const typeEn = (emotion.typeEn || emotion.key || "").toUpperCase();
      const confidence = Number(emotion.confidence || emotion.value) || 0;
      const weight = weights[typeEn] || 0;

      if (["ANGRY", "FEAR", "FEARFUL", "SAD", "DISGUSTED", "CONFUSED", "SURPRISED"].includes(typeEn)) {
        emotionImpact += confidence * weight;
      } else if (["HAPPY", "CALM", "NEUTRAL"].includes(typeEn)) {
        emotionImpact -= confidence * weight;
      }
    });
  }

  // 3. Final Calculation
  // Balanced combination of BPM and Emotion (halved emotion sum impact)
  let rawScore = Math.round(bpmScore + (emotionImpact / 2.5));
  rawScore = Math.max(0, Math.min(100, rawScore));

  // Scale down to 0 ~ 10 for the UI (Rounded)
  const score = Math.round(rawScore / 10);
  
  // 4. Determine Level and Label
  let label = "Normal";
  let level = "normal";
  
  if (score <= 2) {
    label = "Low";
    level = "low";
  } else if (score <= 5) {
    label = "Normal";
    level = "normal";
  } else if (score <= 8) {
    label = "High";
    level = "high";
  } else {
    label = "Dangerous";
    level = "dangerous";
  }

  return { score, label, level };
};
