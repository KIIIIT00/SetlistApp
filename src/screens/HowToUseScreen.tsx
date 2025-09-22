import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';

// 各セクションのコンテンツを定義
const sections = [
    {
        icon: 'musical-notes-outline',
        title: 'ライブの記録',
        content: 'ホーム画面右下の「＋」ボタンから、新しいライブ情報を記録できます。ライブ名、アーティスト、日付、会場、セットリストなどを簡単に入力できます。',
    },
    {
        icon: 'pencil-outline',
        title: '編集と削除',
        content: '記録したライブ情報は、詳細画面からいつでも編集できます。ホーム画面で項目を左にスワイプすると、削除ボタンが表示されます。',
    },
    {
        icon: 'search-outline',
        title: '検索とフィルター',
        content: 'ホーム画面右上のフィルターアイコンから、アーティスト名、年、会場、タグなどでライブ記録を絞り込めます。特定のライブをすぐに見つけたい時に便利です。',
    },
    {
        icon: 'bar-chart-outline',
        title: '統計と分析',
        content: '「統計」タブでは、あなたのライブ参加履歴を様々な角度から分析できます。アーティスト別の参加回数や、会場ランキング、さらには特定のアーティストが演奏した曲の割合や回数まで、グラフで分かりやすく表示します。',
    },
];

const HowToUseSection = ({ icon, title, content }: { icon: any; title: string; content: string }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={22} color={theme.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );
};

export const HowToUseScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <ScrollView style={styles.container}>
            {sections.map((section, index) => (
                <HowToUseSection
                    key={index}
                    icon={section.icon as any}
                    title={section.title}
                    content={section.content}
                />
            ))}
        </ScrollView>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    sectionContainer: {
        backgroundColor: theme.card,
        marginHorizontal: tokens.spacing.m,
        marginVertical: tokens.spacing.s,
        padding: tokens.spacing.l,
        borderRadius: tokens.spacing.m,
        borderWidth: 1,
        borderColor: theme.separator,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: tokens.spacing.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginLeft: tokens.spacing.m,
    },
    sectionContent: {
        fontSize: 15,
        color: theme.subtext,
        lineHeight: 22,
    },
});