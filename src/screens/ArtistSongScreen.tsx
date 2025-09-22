import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PieChart } from "react-native-gifted-charts";

import { getSongStatsForArtist, SongStatItem } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';
import { RootStackParamList } from '../../App';

type ArtistSongScreenRouteProp = RouteProp<RootStackParamList, 'ArtistSongs'>;

const PIE_CHART_COLORS = [
    '#177AD5', '#79D2DE', '#ED6665', '#FFC952', '#8BC34A', '#9C27B0', '#009688',
    '#F44336', '#E91E63', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50',
    '#CDDC39', '#FFEB3B', '#FF9800', '#795548', '#9E9E9E', '#607D8B'
];

export const ArtistSongScreen = () => {
    const route = useRoute<ArtistSongScreenRouteProp>();
    const { artistName } = route.params;

    const [songStats, setSongStats] = useState<SongStatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'ratio' | 'count'>('ratio');

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const stats = await getSongStatsForArtist(artistName);
                setSongStats(stats);
            } catch (error) {
                console.error("楽曲データの読み込みに失敗:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [artistName]);

    const pieChartData = useMemo(() => {
        if (songStats.length === 0) return [];
        const topItems = songStats.slice(0, 20);
        const otherItems = songStats.slice(20);
        const chartData = topItems.map((item, index) => ({
            value: item.count,
            label: `${item.name} (${item.count})`,
            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
            text: item.count.toString(),
        }));
        if (otherItems.length > 0) {
            const otherCount = otherItems.reduce((sum, item) => sum + item.count, 0);
            chartData.push({
                value: otherCount,
                label: `その他 (${otherCount})`,
                color: '#BDBDBD',
                text: otherCount.toString(),
            });
        }
        return chartData;
    }, [songStats]);

    const maxCount = useMemo(() => {
        if (songStats.length === 0) return 0;
        return Math.max(...songStats.map(s => s.count));
    }, [songStats]);


    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (songStats.length === 0) {
        return <View style={styles.centered}><Text style={styles.emptyText}>このアーティストの演奏記録がありません</Text></View>
    }
    
    const screenWidth = Dimensions.get('window').width;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.artistName}>{artistName}</Text>
                <Text style={styles.totalSongsText}>全{songStats.length}曲</Text>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'ratio' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('ratio')}
                >
                    <Text style={[styles.toggleButtonText, viewMode === 'ratio' && styles.toggleButtonTextActive]}>割合</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'count' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('count')}
                >
                    <Text style={[styles.toggleButtonText, viewMode === 'count' && styles.toggleButtonTextActive]}>回数</Text>
                </TouchableOpacity>
            </View>

            {viewMode === 'ratio' ? (
                <View style={styles.chartContainerCentered}>
                    <Text style={styles.chartTitle}>演奏曲の割合</Text>
                    <PieChart
                        data={pieChartData}
                        donut
                        showText
                        textColor={theme.card}
                        radius={screenWidth / 3.5}
                        innerRadius={screenWidth / 7}
                        textSize={14}
                        focusOnPress
                        centerLabelComponent={() => <Text style={styles.chartCenterLabel}>TOP 20</Text>}
                    />
                    <View style={styles.legendContainer}>
                        {pieChartData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText} numberOfLines={1}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>楽曲別の演奏回数</Text>
                    <View style={styles.barChartListContainer}>
                        {songStats.map((item, index) => {
                            const barAreaWidth = (screenWidth - tokens.spacing.l * 2) * 0.45;
                            const valueTextWidth = 40;
                            const trackWidth = barAreaWidth - valueTextWidth;
                            const barWidthValue = maxCount > 0 ? (item.count / maxCount) * trackWidth : 0;
                            
                            return (
                                <View key={index} style={styles.barRow}>
                                    <View style={styles.barLabelContainer}>
                                        <Text style={styles.barLabel} numberOfLines={2}>{item.name}</Text>
                                    </View>
                                    <View style={styles.barContainer}>
                                        <View style={styles.barTrack}>
                                            <View style={[styles.bar, { width: barWidthValue }]} />
                                        </View>
                                        <Text style={styles.barValue}>{item.count}回</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    centered: {
         flex: 1, 
         justifyContent: 'center', 
         alignItems: 'center', 
         backgroundColor: theme.background 
        },
    container: { 
        flex: 1, 
        backgroundColor: theme.background 
    },
    header: { 
        paddingHorizontal: tokens.spacing.l, 
        paddingTop: tokens.spacing.l, 
        paddingBottom: tokens.spacing.m, 
        borderBottomWidth: 1, 
        borderColor: theme.separator 
    },
    artistName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: theme.text 
    },
    totalSongsText: { 
        fontSize: 16, 
        color: theme.subtext, 
        marginTop: tokens.spacing.xs 
    },
    toggleContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginVertical: tokens.spacing.m, 
        backgroundColor: theme.card, 
        borderRadius: 8, 
        marginHorizontal: tokens.spacing.l, 
        overflow: 'hidden' 
    },
    toggleButton: { 
        flex: 1, 
        padding: tokens.spacing.m, 
        alignItems: 'center' 
    },
    toggleButtonActive: { 
        backgroundColor: theme.primary 
    },
    toggleButtonText: { 
        fontSize: 16, 
        color: theme.subtext 
    },
    toggleButtonTextActive: { 
        color: theme.card, 
        fontWeight: 'bold' 
    },
    chartContainer: {
        paddingVertical: tokens.spacing.xl,
    },
    chartContainerCentered: {
        paddingVertical: tokens.spacing.xl,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: tokens.spacing.xl,
        textAlign: 'center',
    },
    chartCenterLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    legendContainer: {
        width: '100%',
        paddingHorizontal: tokens.spacing.l,
        marginTop: tokens.spacing.xl,
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: tokens.spacing.s,
        width: '80%',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: tokens.spacing.m,
    },
    legendText: {
        fontSize: 14,
        color: theme.subtext,
        flexShrink: 1,
    },
    emptyText: {
        fontSize: 18,
        color: theme.emptyText,
        textAlign: 'center',
        padding: tokens.spacing.l,
    },

    barChartListContainer: {
        paddingHorizontal: tokens.spacing.l,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing.m,
        minHeight: 40,
    },
    barLabelContainer: {
        flex: 1,
        paddingRight: tokens.spacing.m,
    },
    barLabel: {
        fontSize: 14,
        color: theme.text,
    },
    barContainer: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    barTrack: {
        flex: 1,
        height: 20,
        backgroundColor: theme.inputBackground,
        borderRadius: 4,
    },
    bar: {
        height: '100%',
        backgroundColor: theme.primary,
        borderRadius: 4,
    },
    barValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.subtext,
        textAlign: 'right',
        width: 40,
        paddingLeft: tokens.spacing.s,
    },
});