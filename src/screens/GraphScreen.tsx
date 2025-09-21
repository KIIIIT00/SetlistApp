import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import { getYearlyActivity, getMonthlyActivity, getArtistRankings, YearlyActivity, MonthlyActivity, RankingItem } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { StatsCard } from '../components/StatsCard';
import { YearlyActivityChart } from '../components/YearlyActivityChart';
import { MonthlyActivityChart } from '../components/MonthlyActivityChart';
import { ArtistRankingChart } from '../components/ArtistRankingChart';
import { loadRankingLimit } from '../utils/setting';


export const GraphScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    const [yearlyActivity, setYearlyActivity] = useState<YearlyActivity[]>([]);
    const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);
    const [selectedYear, setSelectedYear] = useState<string | null>(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [artistRank, setArtistRank] = useState<RankingItem[]>([]);
    const [rankingLimit, setRankingLimit] = useState(5);

    const loadMonthlyData = async (year: string) => {
        setSelectedYear(year);
        const monthData = await getMonthlyActivity(year);
        setMonthlyActivity(monthData);
    };

    useFocusEffect(
        useCallback(() => {
            const loadGraphData = async () => {
                setIsLoading(true);
                const limit = await loadRankingLimit();
                setRankingLimit(limit);

                const [yearData, artistData] = await Promise.all([
                    getYearlyActivity(),
                    getArtistRankings(limit)
                ]);

                setYearlyActivity(yearData);
                setArtistRank(artistData);

                // 直近の年の月別データをデフォルトで表示
                if (yearData.length > 0) {
                    const latestYear = yearData.sort((a, b) => parseInt(b.year) - parseInt(a.year))[0].year;
                    await loadMonthlyData(latestYear);
                }
                setIsLoading(false);
            };
            loadGraphData();
        }, [])
    );

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <StatsCard title="年別のライブ参加数">
                <YearlyActivityChart 
                    data={yearlyActivity} 
                    onBarPress={loadMonthlyData}
                    selectedYear={selectedYear}
                />
            </StatsCard>

            {selectedYear && (
                <StatsCard title={`${selectedYear}年の月別ライブ参加数`}>
                    <MonthlyActivityChart data={monthlyActivity} />
                </StatsCard>
            )}

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
    noDataText: {
        color: theme.emptyText,
        textAlign: 'center',
        padding: tokens.spacing.xl,
    },
});