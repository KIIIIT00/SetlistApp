import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { getLiveById, Live } from '../database/db';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StarDisplay } from '../components/StarDisplay';

type MemoDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoDetail'>;

export const MemoDetailScreen = () => {
  const route = useRoute<MemoDetailScreenRouteProp>();
  const { liveId } = route.params;
  const [live, setLive] = useState<Live | null>(null);

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
          <MaterialCommunityIcons name="account-music" size={18} color="#555" />
          <Text style={styles.detailText}>{live.artistName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-sharp" size={18} color="#555" />
          <Text style={styles.detailText}>{live.venueName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={18} color="#555" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  liveName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  starReadOnlyContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  memoContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});