import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getLiveById, getSetlistsForLive, Live, Setlist, duplicateLiveById, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StarRating } from '../components/StarRating';
import { Alert } from 'react-native';
import { HeaderMenu } from '../components/HeaderMenu';

type LiveDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveDetail'>;
type LiveDetailScreenRouteProp = RouteProp<RootStackParamList, 'LiveDetail'>;

export const LiveDetailScreen = () => {
  const navigation = useNavigation<LiveDetailScreenNavigationProp>();
  const route = useRoute<LiveDetailScreenRouteProp>();
  const { liveId } = route.params;

  const [live, setLive] = useState<Live | null>(null);
  const [setlist, setSetlist] = useState<Setlist[]>([]);

  const handleCopyLive = async () => {
    Alert.alert(
      "ライブを複製",
      "このライブをコピーして新しい下書きを作成しますか？\n（日付は今日の日付になります）",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "コピーする",
          onPress: async () => {
            const newLiveId = await duplicateLiveById(liveId);
            if (newLiveId) {
              navigation.replace('LiveDetail', { liveId: newLiveId });
            } else {
              Alert.alert('エラー', 'ライブの複製に失敗しました。');
            }
          },
        },
      ]
    );
  };
  
  const handleDelete = () => {
    Alert.alert(
      "ライブの削除",
      "このライブの記録を本当に削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          onPress: async () => {
            const success = await deleteLive(liveId);
            if (success) {
              navigation.goBack();
            } else {
                Alert.alert("エラー", "削除に失敗しました。");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: live ? live.liveName : 'ライブ詳細',
      headerRight: () => (
        <HeaderMenu
          menuItems={[
            {
              text: 'このライブを編集',
              onPress: () => navigation.navigate('AddLive', { liveId }),
            },
            {
              text: 'コピーして新規作成',
              onPress: handleCopyLive,
            },
            {
              text: 'このライブを削除',
              onPress: handleDelete,
              isDestructive: true,
            },
          ]}
        />
      ),
    });
  }, [navigation, live, liveId]);

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

  const renderSetlistItem = ({ item }: { item: Setlist }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.headerItem}>
          <View style={styles.headerLine} />
          <Text style={styles.headerText}>{item.songName.toUpperCase()}</Text>
          <View style={styles.headerLine} />
        </View>
      );
    }
    
    return (
      <View style={styles.setlistItem}>
        <Text style={styles.trackNumber}>{item.trackNumber}.</Text>
        <Text style={styles.songName}>{item.songName}</Text>
      </View>
    );
  };

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
          <StarRating rating={live.rating} size={18} />
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
      {live.memo && (
        <View style={styles.memoContainer}>
          <Button
            title="感想メモを見る"
            onPress={() => navigation.navigate('MemoDetail', { liveId: live.id })}
          />
        </View>
      )}

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
            onPress={() => navigation.navigate('EditSetlist', { liveId: live.id, artistName: live.artistName })}
          />
        </View>
      </View>
    </ScrollView>
  );
};

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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  tag: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#4338ca',
    fontWeight: '500',
  },
  memoContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  },
  headerItem: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  headerText: {
    paddingHorizontal: 10,
    fontWeight: 'bold',
    color: '#555',
    fontSize: 16,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginRight: 12,
    width: 30,
  },
  songName: {
    fontSize: 16,
    flex: 1,
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