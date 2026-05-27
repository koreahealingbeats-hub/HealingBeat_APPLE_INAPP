import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

export interface AnalysisResult {
    bpm: number;
    stressLevel: number;
    hrv: number;
    confidence: number;
    timestamp: string;
}

export const useAiCameraResultScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const result = route.params as AnalysisResult;

    useEffect(() => {
        if (result) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 [AI Face Analysis Results Extracted]');
            console.table(result);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    }, [result]);

    const getStressStatus = (level: number) => {
        if (level < 30) return { label: '매우 양호', color: '#4ADE80' };
        if (level < 60) return { label: '보통', color: '#FACC15' };
        return { label: '주의', color: '#FB7185' };
    };

    const status = result ? getStressStatus(result.stressLevel) : { label: '', color: '' };

    const handleGoBackToMain = () => {
        navigation.navigate('MainTabs' as never);
    };

    return {
        result,
        status,
        handleGoBackToMain,
    };
};
