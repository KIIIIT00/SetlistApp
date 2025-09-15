import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { Ionicons } from '@expo/vector-icons';
import { StatsCard } from '../components/StatsCard';
import { RankingList } from '../components/RankingList';
import { loadRankingLimit } from '../utils/setting';

export const StatsScreen = () => {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [artistRank, setArtistRank] = useState<RankingItem[]>([]);
  const [venueRank, setVenueRank] = useState<RankingItem[]>([]);
  const [songRank, setSongRank] = useState<RankingItem[]>([]);
  const [yearlyActivity, setYearlyActivity] = useState<YearlyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [rankingLimit, setRankingLimit] = useState(5);
  const [songRankingLimit, setSongRankingLimit] = useState(10);

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
        <RankingList data={artistRank} />
      </StatsCard>

      <StatsCard title={`会場別 参加ライブ数 TOP${rankingLimit}`}>
        <RankingList data={venueRank} />
      </StatsCard>

      <StatsCard title={`全楽曲 演奏回数 TOP${songRankingLimit}`}>
        <RankingList data={songRank} />
      </StatsCard>
    </ScrollView>
  );
};

// --- スタイル定義 ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});