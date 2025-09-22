import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { RankingItem } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type Props = {
  data: RankingItem[];
  onItemPress?: (item: RankingItem) => void;
  unit?: string;
}

// interface RankingListProps {
//   data: RankingItem[];
//   unit?: string;
// }

export const RankingList = ({ data, onItemPress, unit = '回' }: Props) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>データがありません</Text>;
  }

  const renderItem = ({ item }: { item: RankingItem }) => {
    const content = (
      <>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCount}>{item.count}{unit}</Text>
      </>
    );

    if (onItemPress) {
      return (
        <TouchableOpacity onPress={() => onItemPress(item)} style={styles.itemContainer}>
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.itemContainer}>
        {content}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      scrollEnabled={false}
    />
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
  itemName: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    marginHorizontal: tokens.spacing.s,
  },
  itemCount: {
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
