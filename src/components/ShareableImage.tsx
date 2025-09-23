import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Live, Setlist } from '../database/db';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type Props = {
  live: Live | null;
  setlist: Setlist[];
};

export const ShareableImage: React.FC<Props> = ({ live, setlist }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  if (!live) return null;

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <Text style={styles.liveName}>{live.liveName}</Text>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="account-music" size={16} color={theme.subtext} />
        <Text style={styles.infoText}>{live.artistName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={theme.subtext} />
        <Text style={styles.infoText}>{live.liveDate}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={theme.subtext} />
        <Text style={styles.infoText}>{live.venueName}</Text>
      </View>

      {/* 区切り線 */}
      <View style={styles.divider} />

      {/* セットリスト */}
      <Text style={styles.sectionTitle}>Setlist</Text>
      {setlist.map(item => (
        item.type === 'header' ? (
          <Text key={item.id} style={styles.setlistHeader}>- {item.songName} -</Text>
        ) : (
          <Text key={item.id} style={styles.setlistItem}>{item.trackNumber}. {item.songName}</Text>
        )
      ))}

      {/* タグ */}
      {live.tags && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {live.tags.split(',').map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.trim()}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 感想メモ */}
      {live.memo && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Memo</Text>
          <Text style={styles.memoText}>{live.memo}</Text>
        </>
      )}

      {/* フッター */}
      <Text style={styles.footer}>via SetlistApp</Text>
    </View>
  );
};

// --- スタイル定義 ---
const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        width: 375,
        padding: 24,
        backgroundColor: '#F3F4F6', // 少し色を付ける
    },
    liveName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#111827',
    },
    artistName: {
        fontSize: 18,
        color: '#374151',
        marginBottom: tokens.spacing.xl,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: tokens.spacing.xs,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: tokens.spacing.s,
    },
    divider: {
        height: 1,
        backgroundColor: '#D1D5DB',
        marginVertical: tokens.spacing.xxl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: tokens.spacing.l,
    },
    setlistHeader: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
        marginTop: tokens.spacing.l,
        marginBottom: tokens.spacing.s,
    },
    setlistItem: {
        fontSize: 14,
        color: '#374151',
        paddingVertical: tokens.spacing.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#DBEAFE',
        borderRadius: 12,
        paddingVertical: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.m,
        marginRight: tokens.spacing.ss,
        marginBottom: tokens.spacing.ss,
    },
    tagText: {
        fontSize: 12,
        color: '#1E40AF',
        fontWeight: '500',
    },
    memoText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    footer: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
    },
});