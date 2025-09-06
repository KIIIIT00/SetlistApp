import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getLives, Live } from '../database/db';

// ルートパラメータ型を定義（必要に応じて他のルートも追加）
// type RootStackParamList = {
//   LiveList: undefined;
//   AddLive: undefined;
//   // 他のルートがあればここに追加
// };

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 画面が表示されるたびにデータを再読み込みするためのフック
  useFocusEffect(
    useCallback(() => {
      const loadLives = async () => {
        const data = await getLives();
        setLives(data);
      };
      loadLives();
    }, [])
  );

  // 新規追加ボタンをヘッダーに配置
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => navigation.navigate('AddLive')} title="新規追加" />
      ),
    });
  }, [navigation]);

  // リストの各項目をレンダリング
  const renderItem = ({ item }: { item: Live }) => (
   <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => navigation.navigate('LiveDetail', { liveId: item.id })}
    >
      <View>
        <Text style={styles.itemTitle}>{item.liveName}</Text>
        <Text style={styles.itemSubtitle}>{item.artistName || 'アーティスト未登録'}</Text>
      </View>
      <Text style={styles.itemDate}>{item.liveDate}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {lives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>まだライブが登録されていません。</Text>
          <Text style={styles.emptySubText}>右上の「新規追加」から記録を始めましょう！</Text>
        </View>
      ) : (
        <FlatList
          data={lives}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

// UI/UXを意識したスタイル
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, // Android用の影
    shadowColor: '#000', // iOS用の影
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
});