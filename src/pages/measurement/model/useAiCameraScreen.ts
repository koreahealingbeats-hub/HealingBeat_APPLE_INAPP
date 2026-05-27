import { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions, Linking } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useAIAnalyzer } from '@/features/measure-stress/model/useAIAnalyzer';

const { width } = Dimensions.get('window');

export const useAiCameraScreen = () => {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    // AI Analyzer Hook
    const { isModelReady, faceDetected, isWithinROI, handleCameraStream, TensorCamera } = useAIAnalyzer();

    // Animation values
    const progressAnim = useRef(new Animated.Value(0)).current;
    
    // SVG Circular Progress Constants
    const size = width * 0.78;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    // 자동 시작 로직: 얼굴이 원 안에 들어오면 0.8초 대기 후 시작
    useEffect(() => {
        let autoStartTimeout: NodeJS.Timeout;
        
        if (isModelReady && isWithinROI && !isMeasuring) {
            autoStartTimeout = setTimeout(() => {
                startMeasurement();
            }, 800); // 0.8초간 유지되면 시작
        }

        return () => clearTimeout(autoStartTimeout);
    }, [isWithinROI, isMeasuring, isModelReady]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startMeasurement = () => {
        if (isMeasuring) return;
        
        setIsMeasuring(true);
        setCountdown(5);
        progressAnim.setValue(0);
        
        // 프로그레스 바 애니메이션 시작 (5초)
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
        }).start();

        // 5초 카운트다운 시작
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    finishMeasurement();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const finishMeasurement = () => {
        setIsMeasuring(false);
        
        // 분석 데이터 생성
        const simulatedData = {
            bpm: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
            stressLevel: Math.floor(Math.random() * (70 - 20 + 1)) + 20,
            hrv: Math.floor(Math.random() * (65 - 45 + 1)) + 45,
            confidence: 0.94 + Math.random() * 0.05,
            timestamp: new Date().toISOString(),
        };

        // 결과 화면으로 이동
        (navigation as any).navigate('AiCameraResultScreen', simulatedData);
    };

    const strokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    const handleRequestPermission = async () => {
        const needsInitialRequest = permission?.status === 'undetermined' || permission?.canAskAgain;
        if (needsInitialRequest) {
            await requestPermission();
        } else {
            Linking.openSettings();
        }
    };

    return {
        permission,
        isMeasuring,
        countdown,
        isModelReady,
        faceDetected,
        isWithinROI,
        handleCameraStream,
        TensorCamera,
        size,
        strokeWidth,
        radius,
        circumference,
        strokeDashoffset,
        handleRequestPermission,
    };
};
