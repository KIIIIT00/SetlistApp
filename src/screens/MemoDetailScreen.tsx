import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { getLiveById, Live } from '../database/db';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StarDisplay } from '../components/StarDisplay';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type MemoDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoDetail'>;

export const MemoDetailScreen = () => {
  const route = useRoute<MemoDetailScreenRouteProp>();
  const { liveId } = route.params;
  const [live, setLive] = useState<Live | null>(null);

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const loadLive = async () => {
      const data = await getLiveById(liveId);
      setLive(data);
    };
    loadLive();
  }, [liveId]);

  if (!live) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.liveName}>{live.liveName}</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-music" size={18} color={theme.subtext} />
          <Text style={styles.detailText}>{live.artistName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-sharp" size={18} color={theme.subtext} />
          <Text style={styles.detailText}>{live.venueName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={18} color={theme.subtext} />
          <Text style={styles.detailText}>{live.liveDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <StarDisplay rating={live.rating} size={18} />
        </View>
      </View>

      <View style={styles.memoContainer}>
        <Text style={styles.sectionTitle}>感想メモ</Text>
        <Text style={styles.memoText}>{live.memo || 'メモは登録されていません。'}</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.card,
    padding: tokens.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  liveName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: tokens.spacing.xl,
    color: theme.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  detailText: {
    fontSize: 16,
    color: theme.subtext,
    marginLeft: tokens.spacing.l,
  },
  starReadOnlyContainer: {
    flexDirection: 'row',
    marginLeft: tokens.spacing.l,
  },
  memoContainer: {
    marginTop: tokens.spacing.xl,
    backgroundColor: theme.card,
    padding: tokens.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: tokens.spacing.l,
    color: theme.text,
  },
  memoText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.subtext,
  },
});