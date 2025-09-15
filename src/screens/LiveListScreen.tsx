import React, { useCallback, useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getLives, Live, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { StarRating } from '../components/StarRating';

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadLives = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getLives({ searchQuery, artistFilter, yearFilter });
      setLives(data);
      
      if (data.length > 0) {
        console.log("LiveListScreen: データベースから取得したデータ:", data[0]);
      }

    } catch (error) {
        console.error("Failed to load lives:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, artistFilter, yearFilter]);

  useFocusEffect(
    useCallback(() => {
      loadLives();
    }, [loadLives])
  );
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Button onPress={() => navigation.navigate('Settings')} title="設定" />,
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
            await loadLives();
          },
        },
      ]
    );
  };
  
  const renderRightActions = (liveId: number) => (
    <TouchableOpacity onPress={() => handleDelete(liveId)} style={styles.deleteButton}>
      <Text style={styles.deleteButtonText}>削除</Text>
    </TouchableOpacity>
  );

  const formatDateForList = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
          <View style={{ marginBottom: 4 }}>
            <StarRating rating={item.rating} />
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
          placeholder="キーワードで検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <View style={styles.filterRow}>
          <TextInput
            style={[styles.searchInput, styles.filterInput]}
            placeholder="アーティスト名で絞り込み"
            value={artistFilter}
            onChangeText={setArtistFilter}
            clearButtonMode="while-editing"
          />
          <TextInput
            style={[styles.searchInput, styles.filterInput, { flex: 0.5 }]}
            placeholder="年 (例: 2025)"
            value={yearFilter}
            onChangeText={setYearFilter}
            keyboardType="number-pad"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : lives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || artistFilter || yearFilter ? '検索・絞り込み結果がありません' : 'まだライブが登録されていません。'}
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
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  searchContainer: { 
    padding: 10, 
    backgroundColor: '#fff',
     borderBottomWidth: 1, 
     borderBottomColor: '#eee' 
  },
  searchInput: { 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16 
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterInput: {
    flex: 1,
    marginRight: 10,
  },
  itemContainer: { 
    backgroundColor: '#fff', 
    padding: 16 
  },
  infoContainer: { 
    flex: 1 
  },
  itemTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
  },
  itemSubtitle: { 
    fontSize: 16, 
    color: '#555', 
    marginLeft: 8 
  },
  itemDetail: { 
    fontSize: 14, 
    color: '#777', 
    marginLeft: 8 
  },
  tagsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 10 
  },
  tag: { 
    backgroundColor: '#eef2ff',
    borderRadius: 12, 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    marginRight: 6, 
    marginBottom: 6 
  },
  tagText: { 
    fontSize: 12, 
    color: '#4338ca', 
    fontWeight: '500' 
  
  },
  separator: { 
    height: 1, 
    backgroundColor: '#eee' 
  },
  deleteButton: { 
    backgroundColor: '#ff3b30', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 100 
  },
  deleteButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  emptyText: { 
    fontSize: 18, 
    color: '#888', 
    textAlign: 'center' 
  },
});