import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getLiveById, getSetlistsForLive, Live, Setlist } from '../database/db';
import { RootStackParamList } from '../../App';

// スクリーンが受け取るprops全体の型を定義
type LiveDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'LiveDetail'>;

export const LiveDetailScreen = ({ route, navigation }: LiveDetailScreenProps) => {
  const { liveId } = route.params;

  const [live, setLive] = useState<Live | null>(null);
  const [setlist, setSetlist] = useState<Setlist[]>([]);

  useLayoutEffect(() => {
    if (live) {
      navigation.setOptions({
        title: live.liveName,
        headerRight: () => (
          <Button
            onPress={() => navigation.navigate('AddLive', { liveId: live.id })}
            title="編集"
          />
        ),
      });
    }
  }, [navigation, live]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const liveData = await getLiveById(liveId);
        const setlistData = await getSetlistsForLive(liveId);
        setLive(liveData);
        setSetlist(setlistData);
      };
      loadData();
    }, [liveId])
  );

  if (!live) {
    return (
      <View style={styles.loadingContainer}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  const renderSetlistItem = ({ item }: { item: Setlist }) => (
    <View style={styles.setlistItem}>
      <Text style={styles.trackNumber}>{item.trackNumber}.</Text>
      <Text style={styles.songName}>{item.songName}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.liveName}>{live.liveName}</Text>
        <Text style={styles.detailText}>{live.artistName}</Text>
        <Text style={styles.detailText}>{live.venueName} / {live.liveDate}</Text>
      </View>

      <View style={styles.setlistContainer}>
        <Text style={styles.sectionTitle}>セットリスト</Text>
        {setlist.length === 0 ? (
          <Text style={styles.emptyText}>まだセットリストが登録されていません。</Text>
        ) : (
          <FlatList
            data={setlist}
            renderItem={renderSetlistItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="セットリストを編集"
            onPress={() => navigation.navigate('EditSetlist', { liveId: live.id })}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// ... (stylesは変更ありません)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  liveName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  setlistContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  setlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginRight: 12,
    width: 30, // 曲順の表示幅を揃える
  },
  songName: {
    fontSize: 16,
    flex: 1, // 曲名が長くても改行されるように
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});