import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RankingItem } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

interface RankingListProps {
  data: RankingItem[];
  unit?: string;
}

export const RankingList = ({ data }: RankingListProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>データがありません</Text>;
  }

  return (
    <View>
      {data.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.rank}>{index + 1}.</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.count}>{item.count}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.subtext,
    width: 30,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    marginHorizontal: tokens.spacing.s,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  noDataText: {
    color: theme.subtext,
    textAlign: 'center',
    padding: tokens.spacing.m,
  }
});
