import React, { useCallback, useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { getLives, Live, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadLives = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLives(searchQuery);
      setLives(data);
    } catch (error) {
      console.error("Failed to load lives:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLives();
    }, 300); // ユーザーの入力を待つために少し遅延させる

    return () => clearTimeout(timer);
  }, [loadLives]);

  useFocusEffect(
    useCallback(() => {
      loadLives();
    }, [loadLives])
  );

  const formatDateForList = (dataString: string) => {
    const date = new Date(dataString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button onPress={() => navigation.navigate('Settings')} title="設定" />
      ),
      headerRight: () => <Button onPress={() => navigation.navigate('AddLive', {})} title="新規追加" />,
    });
  }, [navigation]);

  const handleDelete = (liveId: number) => {
    Alert.alert(
      "削除の確認",
      "このライブ情報を削除しますか？\n関連するセットリストもすべて削除されます。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            await deleteLive(liveId);
            const data = await getLives();
            setLives(data);
          },
        },
      ]
    );
  };

  const renderRightActions = (liveId: number) => {
    return (
      <TouchableOpacity
        onPress={() => handleDelete(liveId)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>削除</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Live }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('LiveDetail', { liveId: item.id })}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.itemTitle}>{item.liveName}</Text>
          

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-music" size={16} color="#666" />
            <Text style={styles.itemSubtitle}>{item.artistName || 'アーティスト未登録'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-sharp" size={16} color="#666" />
            <Text style={styles.itemDetail}>{item.venueName || '会場未登録'}</Text>
          </View>
           <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.itemDetail}>{formatDateForList(item.liveDate)}</Text>
          </View>

          {item.tags && (
            <View style={styles.tagsContainer}>
              {item.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ライブ名, アーティスト, タグ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : lives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? '検索結果がありません' : 'まだライブが登録されていません。'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={lives}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
   detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 5 
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6
  },
  tagText: {
    fontSize: 12,
    color: '#555'
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
});