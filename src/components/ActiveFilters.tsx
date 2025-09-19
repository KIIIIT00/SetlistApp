import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { FilterSortOptions } from './FilterModal';

type Props = {
  options: FilterSortOptions;
  onRemove: (keyToRemove: keyof FilterSortOptions) => void;
};

const sortKeyLabels: { [key in FilterSortOptions['sortKey']]: string } = {
    liveDate: '開催日',
    artistName: 'アーティスト名',
    rating: '評価',
    venueName: '会場名',
};

export const ActiveFilters = ({ options, onRemove}: Props ) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const activeFilters = [];
    if (options.year) activeFilters.push({ key: 'year', value: `${options.year}年`});
    if (options.artist) activeFilters.push({ key: 'artist', value: options.artist});
    if (options.venue) activeFilters.push({ key: 'venue', value: options.venue});
    if (options.tag) activeFilters.push({ key: 'tag', value: `タグ: ${options.tag}` });
    if (options.minRating > 0) activeFilters.push({ key: 'minRating', value: `評価 ★${options.minRating}以上` });

    // 並び替え順も表示
    const sortLabel = `${sortKeyLabels[options.sortKey]}の${options.sortOrder === 'DESC' ? '降順' : '昇順'}`;
    activeFilters.push({ key: 'sortKey', value: sortLabel });

  if (activeFilters.length <= 1 && activeFilters[0]?.key === 'sortKey') {
    return null;
  }
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeFilters.map(filter => (
          <View key={filter.key} style={styles.tag}>
            <Text style={styles.tagText}>{filter.value}</Text>
            {/* 並べ替え順は解除できないようにする */}
            {filter.key !== 'sortKey' && (
              <TouchableOpacity onPress={() => onRemove(filter.key as keyof FilterSortOptions)} style={styles.closeButton}>
                <Ionicons name="close" size={16} color={theme.tagText} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.m,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  scrollContent: {
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.tagBackground,
    borderRadius: 16,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.l,
    marginHorizontal: tokens.spacing.xs,
  },
  tagText: {
    color: theme.tagText,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: tokens.spacing.s,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});