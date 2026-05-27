import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/shared/ui';
import { useAiCameraResultScreen } from '../model/useAiCameraResultScreen';

export const AiCameraResultScreen = () => {
    const { result, status, handleGoBackToMain } = useAiCameraResultScreen();

    if (!result) return null;

    const ResultCard = ({ icon, label, value, unit }: any) => (
        <View style={styles.card}>
            <View style={styles.cardIcon}>
                <Ionicons name={icon} size={24} color="rgba(255,255,255,0.7)" />
            </View>
            <View>
                <Text style={styles.cardLabel}>{label}</Text>
                <View style={styles.cardValueContainer}>
                    <Text style={styles.cardValue}>{value}</Text>
                    <Text style={styles.cardUnit}>{unit}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFill}
            />
            
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>분석 결과</Text>
                    <TouchableOpacity onPress={handleGoBackToMain}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Stress Score Section */}
                    <View style={styles.scoreSection}>
                        <View style={styles.scoreCircle}>
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                style={styles.scoreGradient}
                            />
                            <Text style={styles.scoreLabel}>스트레스 지수</Text>
                            <Text style={styles.scoreValue}>{result.stressLevel}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                <Text style={styles.statusText}>{status.label}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Details Grid */}
                    <View style={styles.grid}>
                        <ResultCard 
                            icon="heart" 
                            label="평균 심박수" 
                            value={result.bpm} 
                            unit="BPM" 
                        />
                        <ResultCard 
                            icon="pulse" 
                            label="심박 변이도(HRV)" 
                            value={result.hrv} 
                            unit="ms" 
                        />
                        <ResultCard 
                            icon="checkmark-circle" 
                            label="분석 신뢰도" 
                            value={Math.round(result.confidence * 100)} 
                            unit="%" 
                        />
                        <ResultCard 
                            icon="time" 
                            label="측정 시각" 
                            value={new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            unit="" 
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.infoText}>
                            얼굴 혈류 신호를 분석하여 산출된 지표입니다. 수치는 참고용으로만 사용해 주세요.
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button 
                        title="확인" 
                        onPress={handleGoBackToMain} 
                        style={{ width: '100%' }}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    scoreSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    scoreCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    scoreGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        opacity: 0.15,
    },
    scoreLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 8,
    },
    scoreValue: {
        color: '#fff',
        fontSize: 64,
        fontWeight: 'bold',
    },
    statusBadge: {
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 50) / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        marginRight: 12,
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 4,
    },
    cardValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    cardValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardUnit: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginLeft: 2,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    infoText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        marginLeft: 10,
        flex: 1,
    },
    footer: {
        padding: 20,
        paddingBottom: 10,
    },
});
