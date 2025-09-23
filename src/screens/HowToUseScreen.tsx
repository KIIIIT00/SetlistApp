import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';

const IMAGES = {
    addLive: require('../../assets/usage_add_design.png'),
    editLive: require('../../assets/usage_delete.png'),
    copyLive: require('../../assets/usage_copy_design.png'),
    shareSetlist: require('../../assets/usage_share.png'),
    searchFilter: require('../../assets/usage_filter.png'),
    stats: require('../../assets/usage_stats.png'),
};

const sections = [
    {
        icon: 'musical-notes-outline',
        title: 'ライブの記録',
        content: 'ホーム画面右下の「＋」ボタンから、ライブ情報を記録できます。セットリストや会場、その日の感想などを簡単に入力できます。',
        image: IMAGES.addLive,
    },
    {
        icon: 'pencil-outline',
        title: '編集と削除',
        content: '記録したライブ情報は、詳細画面からいつでも編集できます。ホーム画面で項目を左にスワイプすると、削除ボタンが表示されます。',
        image: IMAGES.editLive,
    },
    {
        icon: 'copy-outline',
        title: 'ライブのコピー',
        content: '同じアーティストのツアーなど、似た内容のライブを記録する際に便利です。ライブ詳細画面のメニューから「コピーして新規作成」を選ぶと、セットリストごとコピーできます。',
        image: IMAGES.copyLive,
    },
    {
        icon: 'share-social-outline',
        title: 'セットリスト共有',
        content: 'ライブ詳細画面の共有ボタンから、セットリストをおしゃれな画像として書き出してSNSなどで友人と共有できます。',
        image: IMAGES.shareSetlist,
    },
    {
        icon: 'search-outline',
        title: '検索とフィルター',
        content: 'ホーム画面右上のフィルターアイコンから、アーティスト名、年、会場、タグなどで記録を絞り込めます。特定のライブをすぐに見つけたい時に便利です。',
        image: IMAGES.searchFilter,
    },
    {
        icon: 'bar-chart-outline',
        title: '統計と分析',
        content: '「統計」タブでは、あなたのライブ参加履歴を様々な角度から分析できます。アーティスト別の参加回数や、よく聴く曲のランキングなどをグラフで分かりやすく表示します。',
        image: IMAGES.stats,
    },
];

const screenWidth = Dimensions.get('window').width;

const HowToUseSection = ({ icon, title, content, image }: { icon: any; title: string; content: string; image?: any }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={22} color={theme.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionContent}>{content}</Text>
            {image && (
                <Image
                    source={image}
                    style={styles.sectionImage}
                />
            )}
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
                    image={section.image}
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
    sectionImage: {
        width: '100%',
        height: (screenWidth - tokens.spacing.m * 2 - tokens.spacing.l * 2) * 1.7,
        borderRadius: tokens.spacing.s,
        marginTop: tokens.spacing.m,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
});