import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Live } from '../database/db';
import { StarRating } from './StarRating';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';

interface Props {
  live: Live;
  onPress: () => void;
}

const formatDateForList = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const LiveListItem = ({ live, onPress }: Props) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.itemTitle}>{live.liveName}</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-music" size={16} color={theme.icon} />
          <Text style={styles.itemSubtitle}>{live.artistName || 'アーティスト未登録'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-sharp" size={16} color={theme.icon} />
          <Text style={styles.itemDetail}>{live.venueName || '会場未登録'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={theme.icon} />
          <Text style={styles.itemDetail}>{formatDateForList(live.liveDate)}</Text>
        </View>
        <View style={{ marginVertical: 4 }}>
          <StarRating rating={live.rating} />
        </View>
        {live.tags && (
          <View style={styles.tagsContainer}>
            {live.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    itemContainer: {
        backgroundColor: theme.card,
        padding: tokens.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.separator,
    },
    infoContainer: {
        flex: 1
    },
    itemTitle: {
        ...tokens.typography.title,
        color: theme.text,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: tokens.spacing.s,
    },
    itemSubtitle: {
        ...tokens.typography.subtitle,
        color: theme.subtext,
        marginLeft: tokens.spacing.s
    },
    itemDetail: {
        ...tokens.typography.body,
        color: theme.detailText,
        marginLeft: tokens.spacing.s
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: tokens.spacing.m
    },
    tag: {
        backgroundColor: theme.tagBackground,
        borderRadius: 12,
        paddingVertical: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.m,
        marginRight: tokens.spacing.s,
        marginBottom: tokens.spacing.s
    },
    tagText: {
        ...tokens.typography.caption,
        color: theme.tagText,
        fontWeight: '500'
    },
});