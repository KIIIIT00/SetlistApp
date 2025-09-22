import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    getArtistRankings,
    getVenueRankings,
    getSongRankings,
    RankingItem,
} from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';
import { StatsCard } from '../components/StatsCard';
import { RankingList } from '../components/RankingList';
import { YearlyActivityChart } from '../components/YearlyActivityChart';
import { MonthlyActivityChart } from '../components/MonthlyActivityChart';

export const GraphScreen = () => {
    const [artistRank, setArtistRank] = useState<RankingItem[]>([]);
    const [venueRank, setVenueRank] = useState<RankingItem[]>([]);
    const [songRank, setSongRank] = useState<RankingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const [
                        artistData,
                        venueData,
                        songData,
                    ] = await Promise.all([
                        getArtistRankings(),
                        getVenueRankings(),
                        getSongRankings(20),
                    ]);
                    setArtistRank(artistData);
                    setVenueRank(venueData);
                    setSongRank(songData);
                } catch (error) {
                    console.error("グラフデータの読み込みに失敗:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }, [])
    );
    
    const handleYearSelect = (year: string | null) => {
        setSelectedYear(year);
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <StatsCard title="年別のライブ参加数">
                <YearlyActivityChart onYearSelect={handleYearSelect} />
            </StatsCard>

            {selectedYear && (
                <StatsCard title={`${selectedYear}年 月別のライブ参加数`}>
                    <MonthlyActivityChart year={selectedYear} />
                </StatsCard>
            )}

            <StatsCard title="アーティスト別 参加ライブ数ランキング">
                <RankingList data={artistRank} />
            </StatsCard>

            <StatsCard title="会場別 参加ライブ数ランキング">
                <RankingList data={venueRank} />
            </StatsCard>

            <StatsCard title="全楽曲 演奏回数ランキング TOP20">
                <RankingList data={songRank} />
            </StatsCard>
        </ScrollView>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
});