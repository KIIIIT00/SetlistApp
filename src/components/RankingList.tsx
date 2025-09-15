import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RankingItem } from '../database/db';

interface RankingListProps {
  data: RankingItem[];
  unit?: string;
}

export const RankingList = ({ data, unit = '回' }: RankingListProps) => {
  if (data.length === 0) {
    return <Text style={styles.noDataText}>データがありません</Text>;
  }
  return (
    <View>
      {data.map((item, index) => (
        <View key={index} style={styles.rankingItem}>
          <Text style={styles.rankingRank}>{index + 1}.</Text>
          <Text style={styles.rankingName}>{item.name}</Text>
          <Text style={styles.rankingCount}>{item.count}{unit}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    width: 30,
  },
  rankingName: {
    fontSize: 16,
    flex: 1,
  },
  rankingCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
});