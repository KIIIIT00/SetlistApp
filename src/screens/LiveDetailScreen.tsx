import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getLiveById, getSetlistsForLive, Live, Setlist, duplicateLiveById, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StarRating } from '../components/StarRating';
import { HeaderMenu } from '../components/HeaderMenu';

type LiveDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveDetail'>;
type LiveDetailScreenRouteProp = RouteProp<RootStackParamList, 'LiveDetail'>;

export const LiveDetailScreen = () => {
  const navigation = useNavigation<LiveDetailScreenNavigationProp>();
  const route = useRoute<LiveDetailScreenRouteProp>();
  const { liveId } = route.params;

  const [live, setLive] = useState<Live | null>(null);
  const [setlist, setSetlist] = useState<Setlist[]>([]);

  const loadData = useCallback(async () => {
    const liveData = await getLiveById(liveId);
    const setlistData = await getSetlistsForLive(liveId);
    setLive(liveData);
    setSetlist(setlistData);
  }, [liveId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // コピー処理を実行する関数
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

  // 削除処理の関数
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

  if (!live) {
    return <View style={styles.container}><Text>読み込み中...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{live.liveDate}</Text>
        <Text style={styles.artistName}>{live.artistName}</Text>
        <Text style={styles.liveName}>{live.liveName}</Text>
        <View style={styles.venueContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.venueName}>{live.venueName}</Text>
        </View>
        <View style={styles.ratingContainer}>
            <StarRating rating={live.rating || 0} />
        </View>
        {live.tags && (
          <View style={styles.tagsContainer}>
            {live.tags.split(',').map(tag => tag.trim()).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {live.memo && (
        <View style={styles.memoContainer}>
            <Text>{live.memo}</Text>
        </View>
      )}

      <View style={styles.setlistContainer}>
        <Text style={styles.sectionTitle}>セットリスト</Text>
        <FlatList
          data={setlist}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            if (item.type === 'header') {
                return (
                    <View style={styles.headerItem}>
                        <View style={styles.headerLine} />
                        <Text style={styles.headerText}>{item.songName}</Text>
                        <View style={styles.headerLine} />
                    </View>
                );
            }
            return (
              <View style={styles.setlistItem}>
                <Text style={styles.trackNumber}>{item.trackNumber}.</Text>
                <View>
                    <Text style={styles.songName}>{item.songName}</Text>
                    {item.memo && <Text style={styles.songMemo}>{item.memo}</Text>}
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f8f8',
    },
    header: {
      backgroundColor: '#fff',
      padding: 20,
    },
    date: {
      fontSize: 14,
      color: '#666',
    },
    artistName: {
      fontSize: 16,
      color: '#333',
      marginTop: 8,
    },
    liveName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 4,
    },
    venueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    venueName: {
      fontSize: 14,
      color: '#666',
      marginLeft: 4,
    },
    ratingContainer: {
        marginTop: 8,
        alignItems: 'flex-start',
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
      paddingBottom: 40,
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
        textAlign: 'center',
        color: '#888',
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    trackNumber: {
      width: 30,
      fontSize: 16,
      color: '#888',
    },
    songName: {
      fontSize: 16,
    },
    songMemo: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    separator: {
      height: 8,
    },
});