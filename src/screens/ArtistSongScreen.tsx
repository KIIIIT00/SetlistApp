import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { getSongStatsForArtist, SongStatItem } from '../database/db';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { StatsCard } from '../components/StatsCard';
// TODO: ドーナツグラフと楽曲ランキンググラフのコンポーネントを作成してインポートする

export const ArtistSongScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'ArtistSongs'>>();
    const { artistName } = route.params;

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    const [songStats, setSongStats] = useState<SongStatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                const stats = await getSongStatsForArtist(artistName);
                setSongStats(stats);
                setIsLoading(false);
            };
            loadData();
        }, [artistName])
    );

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <StatsCard title="演奏回数 TOP5 (割合)">
                <Text style={styles.placeholderText}>（ここにドーナツグラフを表示）</Text>
            </StatsCard>

            <StatsCard title="全楽曲 演奏回数ランキング">
                <Text style={styles.placeholderText}>（ここに横棒グラフを表示）</Text>
            </StatsCard>
        </ScrollView>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        padding: tokens.spacing.m,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    placeholderText: {
        color: theme.subtext,
        textAlign: 'center',
        padding: tokens.spacing.xl,
    },
});