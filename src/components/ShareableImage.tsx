import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Live, Setlist } from '../database/db';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  live: Live | null;
  setlist: Setlist[];
};

export const ShareableImage: React.FC<Props> = ({ live, setlist }) => {
  if (!live) return null;

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <Text style={styles.liveName}>{live.liveName}</Text>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="account-music" size={16} color="#555" />
        <Text style={styles.infoText}>{live.artistName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.infoText}>{live.liveDate}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#555" />
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
const styles = StyleSheet.create({
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
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#D1D5DB',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    setlistHeader: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 8,
    },
    setlistItem: {
        fontSize: 14,
        color: '#374151',
        paddingVertical: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#DBEAFE',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
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