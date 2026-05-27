import { useNavigation } from '@react-navigation/native';

export const useAiCameraGuideScreen = () => {
  const navigation = useNavigation();

  const startMeasurement = () => {
    (navigation as any).navigate('AiCameraScreen');
  };

  return {
    startMeasurement,
  };
};
