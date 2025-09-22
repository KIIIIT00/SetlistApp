import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

const IMAGES = {
    slide1: require('../../assets/onboarding_slide1.png'),
    slide2: require('../../assets/onboarding_slide2.png'),
    slide3: require('../../assets/onboarding_slide3.png'),
};

const slides = [
    {
        image: IMAGES.slide1,
        title: 'ライブの感動を、かんたんに記録',
        text: 'セットリストや会場、その日の感想をその場で手軽に残せます。あなたの体験が、大切な思い出に変わります。',
    },
    {
        image: IMAGES.slide2,
        title: 'あなたのライブ履歴を、美しく可視化',
        text: '参加したライブの回数や、よく聴く曲のランキングを自動で分析。自分だけの音楽データを発見しよう。',
    },
    {
        image: IMAGES.slide3,
        title: 'さあ、最初の思い出を記録しよう',
        text: '右下の「＋」ボタンから、あなたの忘れられない一夜を記録してみてください。',
    },
];

type Props = {
    onComplete: () => void;
};

export const OnboardingScreen = ({ onComplete }: Props) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <SafeAreaView style={styles.container}>
            <Swiper
                loop={false}
                dot={<View style={styles.dot} />}
                activeDot={<View style={styles.activeDot} />}
            >
                {slides.map((slide, index) => (
                    <View key={index} style={styles.slide}>
                        <Image source={slide.image} style={styles.image} resizeMode="contain" />
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.text}>{slide.text}</Text>
                    </View>
                ))}
            </Swiper>
            <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
                <Text style={styles.completeButtonText}>アプリを始める</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const screenHeight = Dimensions.get('window').height;

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: tokens.spacing.xl,
    },
    image: {
        width: '100%',
        height: screenHeight * 0.5,
        borderRadius: tokens.spacing.m,
        marginBottom: tokens.spacing.xxl,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
        marginBottom: tokens.spacing.m,
    },
    text: {
        fontSize: 16,
        color: theme.subtext,
        textAlign: 'center',
        lineHeight: 24,
    },
    dot: {
        backgroundColor: theme.separator,
        width: 8,
        height: 8,
        borderRadius: 4,
        margin: 3,
    },
    activeDot: {
        backgroundColor: theme.primary,
        width: 8,
        height: 8,
        borderRadius: 4,
        margin: 3,
    },
    completeButton: {
        backgroundColor: theme.primary,
        padding: tokens.spacing.l,
        margin: tokens.spacing.xl,
        borderRadius: tokens.spacing.m,
        alignItems: 'center',
    },
    completeButtonText: {
        color: theme.buttonSelectedText,
        fontSize: 18,
        fontWeight: 'bold',
    },
});