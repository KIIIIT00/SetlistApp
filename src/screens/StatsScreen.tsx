import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getArtistRankings,
  getVenueRankings,
  getSongRankings,
  getStatsSummary,
  getYearlyActivity,
  RankingItem,
  StatsSummary,
  YearlyActivity,
} from '../database/db';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatsCard } from '../components/StatsCard';
import { RankingList } from '../components/RankingList';
import { loadRankingLimit } from '../utils/setting';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';
import { RootStackParamList } from '../../App';

// export type RootStackParamList = {
//   LiveList: undefined;
//   AddLive: { liveId?: number };
//   LiveDetail: { liveId: number };
//   EditSetlist: { liveId: number; artistName?: string; };
//   Settings: undefined;
//   MemoDetail: {liveId: number};
//   Stats: undefined;
//   Graph: undefined;
//   Calendar: undefined;
//   ArtistSongs: { artistName: string };
//   VenueDetail: { venueName: string };
// };

export const StatsScreen = () => {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [artistRank, setArtistRank] = useState<RankingItem[]>([]);
  const [venueRank, setVenueRank] = useState<RankingItem[]>([]);
  const [songRank, setSongRank] = useState<RankingItem[]>([]);
  const [yearlyActivity, setYearlyActivity] = useState<YearlyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [rankingLimit, setRankingLimit] = useState(5);
  const [songRankingLimit, setSongRankingLimit] = useState(10);

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleArtistPress = (item: RankingItem) => {
    navigation.navigate('ArtistSongs', { artistName: item.name });
  };

  const handleVenuePress = (item: RankingItem) => {
    navigation.navigate('VenueDetail', { venueName: item.name });
  };

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        setIsLoading(true);
        try {
          const limit = await loadRankingLimit();
          setRankingLimit(limit);
          setSongRankingLimit(limit * 2);
          const [
            summaryData,
            artistData,
            venueData,
            songData,
            yearData,
          ] = await Promise.all([
            getStatsSummary(),
            getArtistRankings(limit),
            getVenueRankings(limit),
            getSongRankings(limit * 2),
            getYearlyActivity(),
          ]);
          setSummary(summaryData);
          setArtistRank(artistData);
          setVenueRank(venueData);
          setSongRank(songData);
          setYearlyActivity(yearData);
        } catch (error) {
          console.error("統計データの読み込みに失敗しました:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadStats();
    }, [])
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
          style={styles.graphButton}
          onPress={() => navigation.navigate('Graph')}
      >
        <Ionicons name="bar-chart-outline" size={20} color={theme.primary} />
        <Text style={styles.graphButtonText}>グラフで詳しく見る</Text>
      </TouchableOpacity>
      <StatsCard title="あなたのライブ記録">
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary?.totalLives ?? 0}</Text>
            <Text style={styles.summaryLabel}>通算参加数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              <Ionicons name="star" size={22} color="#ffb400" />
              {summary?.averageRating ?? 'N/A'}
            </Text>
            <Text style={styles.summaryLabel}>平均評価</Text>
          </View>
        </View>
      </StatsCard>
      
      <StatsCard title="年別のライブ参加数">
        <RankingList data={yearlyActivity.map(item => ({ name: `${item.year}年`, count: item.count }))} />
      </StatsCard>

      <StatsCard title={`アーティスト別 参加ライブ数 TOP${rankingLimit}`}>
        <RankingList data={artistRank} onItemPress={handleArtistPress} />
      </StatsCard>

      <StatsCard title={`会場別 参加ライブ数 TOP${rankingLimit}`}>
        <RankingList data={venueRank} onItemPress={handleVenuePress} />
      </StatsCard>

      <StatsCard title={`全楽曲 演奏回数 TOP${songRankingLimit}`}>
        <RankingList data={songRank} />
      </StatsCard>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: tokens.spacing.m, 
        paddingVertical: tokens.spacing.s, 
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', 
        paddingVertical: tokens.spacing.m,
    },
    summaryItem: {
        alignItems: 'center', 
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text, 
        marginBottom: tokens.spacing.xs,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.subtext, 
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: tokens.spacing.xxl,
        backgroundColor: theme.background,
    },
    emptyText: {
        fontSize: 18,
        color: theme.emptyText,
        textAlign: 'center',
    },
    graphButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      padding: tokens.spacing.l,
      margin: tokens.spacing.m,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.separator,
    },
    graphButtonText: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: tokens.spacing.s,
    }
});