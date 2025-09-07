import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';

import { getLives, Live, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      // 中でasync関数を定義して...
      const loadLives = async () => {
        const data = await getLives();
        setLives(data);
      };

      loadLives();
    }, [])
  );

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
        <View>
          <Text style={styles.itemTitle}>{item.liveName}</Text>
          <Text style={styles.itemSubtitle}>{item.artistName || 'アーティスト未登録'}</Text>
        </View>
        <Text style={styles.itemDate}>{item.liveDate}</Text>
      </TouchableOpacity>
    </Swipeable>
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
  itemContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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