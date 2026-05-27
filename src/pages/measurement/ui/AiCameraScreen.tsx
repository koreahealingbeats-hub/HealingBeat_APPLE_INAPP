import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubHeader } from '@/shared/ui';
import Svg, { Circle } from 'react-native-svg';
import { useAiCameraScreen } from '../model/useAiCameraScreen';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * [AI 카메라 측정 화면]
 * 실시간 얼굴 인식을 통해 자동으로 측정을 시작하며,
 * 원형 프로그레스 바를 통해 진행 상태를 표시합니다.
 */
export const AiCameraScreen = () => {
    const {
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
    } = useAiCameraScreen();

    const TensorCameraComponent = TensorCamera as any;

    if (!permission) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!permission.granted) {
        const needsInitialRequest = permission.status === 'undetermined' || permission.canAskAgain;
        return (
            <SafeAreaView style={[styles.container, styles.permissionContainer]}>
                <SubHeader style={{ paddingHorizontal: 20 }} />
                <View style={styles.permissionBody}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="camera" size={50} color="#fff" />
                    </View>
                    <Text style={styles.permissionTitle}>
                        {needsInitialRequest ? '카메라 권한이 필요합니다' : '카메라 권한을 켜주세요'}
                    </Text>
                    <Text style={styles.permissionSubtitle}>
                        AI 얼굴 분석을 위해 카메라 권한이 필요합니다.
                    </Text>
                </View>
                <TouchableOpacity 
                    style={styles.permissionButton} 
                    onPress={handleRequestPermission}
                >
                    <Text style={styles.permissionButtonText}>
                        {needsInitialRequest ? '권한 허용하기' : '설정으로 이동'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <TensorCameraComponent 
                style={styles.camera} 
                facing="front"
                onReady={handleCameraStream}
                autorender={true}
                resizeWidth={152}
                resizeHeight={200}
                resizeDepth={3}
            >
                <View style={styles.fullOverlay}>
                    <SafeAreaView style={styles.overlayInner}>
                        <SubHeader style={{ paddingHorizontal: 20 }} />

                        <View style={styles.maskContainer}>
                            {/* Circular Progress Mask */}
                            <View style={styles.maskWrapper}>
                                <Svg width={size} height={size} style={styles.svg}>
                                    {/* Background Circle */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="rgba(255, 255, 255, 0.2)"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                    />
                                    {/* Progress Circle */}
                                    <AnimatedCircle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke={isMeasuring ? "#00A3FF" : (isWithinROI ? "#4ADE80" : "#fff")}
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                    />
                                </Svg>

                                {/* Inner Guide/Status */}
                                <View style={[
                                    styles.innerCircle, 
                                    isMeasuring && styles.innerCircleActive,
                                    isWithinROI && !isMeasuring && styles.innerCircleDetected
                                ]}>
                                    {!isMeasuring && (
                                        <Image
                                            source={require('@assets/AI_camera/icon_faceGuide.png')} 
                                            style={styles.faceIcon}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                            </View>
                            
                            {/* 안내 문구 */}
                            <View style={styles.guideContainer}>
                                {!isModelReady ? (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator size="small" color="#fff" style={{marginRight: 10}} />
                                        <Text style={styles.guideText}>AI 엔진 초기화 중...</Text>
                                    </View>
                                ) : isMeasuring ? (
                                    <>
                                        <Text style={styles.countdownValue}>{countdown}</Text>
                                        <Text style={styles.guideText}>분석이 진행 중입니다. 움직이지 마세요.</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[styles.guideText, isWithinROI && styles.guideTextActive]}>
                                            {isWithinROI ? '인식되었습니다! 잠시만 기다려주세요.' : '원 안에 얼굴을 맞춰주세요'}
                                        </Text>
                                        {!isWithinROI && faceDetected && (
                                            <Text style={styles.subGuideText}>조금 더 가깝게 맞춰주세요</Text>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                        
                        <View style={{ height: 80 }} />
                    </SafeAreaView>
                </View>
            </TensorCameraComponent>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    fullOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    overlayInner: {
        flex: 1,
        justifyContent: 'space-between',
    },
    maskContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    maskWrapper: {
        width: width * 0.78,
        height: width * 0.78,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    svg: {
        position: 'absolute',
    },
    innerCircle: {
        width: width * 0.72,
        height: width * 0.72,
        borderRadius: (width * 0.72) / 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircleActive: {
        borderColor: 'rgba(0, 163, 255, 0.3)',
        backgroundColor: 'rgba(0, 163, 255, 0.05)',
    },
    innerCircleDetected: {
        borderColor: 'rgba(74, 222, 128, 0.3)',
    },
    faceIcon: {
        width: 60,
        height: 60,
        opacity: 0.7,
    },
    guideContainer: {
        marginTop: 50,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    guideText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    guideTextActive: {
        color: '#4ADE80',
    },
    subGuideText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        marginTop: 8,
    },
    countdownValue: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#13131E',
    },
    permissionBody: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    permissionSubtitle: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        marginHorizontal: 30,
        marginBottom: 40,
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
