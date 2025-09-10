import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import { getSetlistsForLive, Setlist, updateSetlistForLive, getSongsByArtist } from '../database/db';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type EditSetlistScreenRouteProp = RouteProp<RootStackParamList, 'EditSetlist'>;
type EditSetlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditSetlist'>;

type SongOrHeader = Omit<Setlist, 'id' | 'liveId'> & { id: number | string };

export const EditSetlistScreen = () => {
  const navigation = useNavigation<EditSetlistScreenNavigationProp>();
  const route = useRoute<EditSetlistScreenRouteProp>();
  const { liveId, artistName } = route.params;

  const [items, setItems] = useState<SongOrHeader[]>([]);
  const [inputText, setInputText] = useState('');
  const [songSuggestions, setSongSuggestions] = useState<string[]>([]);
  const [allSongsForArtist, setAllSongsForArtist] = useState<string[]>([]);
  
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const setlistData = await getSetlistsForLive(liveId);
        setItems(setlistData);
        if (artistName) {
          const songs = await getSongsByArtist(artistName);
          setAllSongsForArtist(songs);
        }
      };
      loadData();
    }, [liveId, artistName])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button onPress={handleSave} title="保存" />,
    });
  }, [navigation, items]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (text && artistName) {
      const suggestions = allSongsForArtist.filter(song => 
        song.toLowerCase().includes(text.toLowerCase()) && 
        !items.some(item => item.songName === song)
      );
      setSongSuggestions(suggestions);
    } else {
      setSongSuggestions([]);
    }
  };
  
  const handleAddItem = (type: 'song' | 'header', suggestion?: string) => {
    const name = suggestion || inputText.trim();
    if (!name) return;
    const newItem: SongOrHeader = {
      id: `new_${Date.now()}`,
      songName: name,
      trackNumber: items.length + 1,
      type: type,
    };
    setItems([...items, newItem]);
    setInputText('');
    setSongSuggestions([]);
    Keyboard.dismiss();
  };

  const handleDeleteItem = (itemIdToDelete: number | string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemIdToDelete)
    );
  };

  const handleSave = async () => {
    const updatedItems = items.map((item, index) => ({
      ...item,
      trackNumber: index + 1,
    }));
    try {
      await updateSetlistForLive(liveId, updatedItems);
      Toast.show({ type: 'success', text1: 'セットリストを更新しました' });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: '更新に失敗しました' });
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<SongOrHeader>) => {
    if (item.type === 'header') {
      return (
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={[styles.headerItem, { backgroundColor: isActive ? '#e0e0e0' : '#f0f0f0' }]}
          >
            <View style={styles.headerLine} />
            <Text style={styles.headerText}>{item.songName.toUpperCase()}</Text>
            <View style={styles.headerLine} />
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButtonAbsolute}>
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </ScaleDecorator>
      );
    }
    
    const songIndex = items.slice(0, items.findIndex(i => i.id === item.id)).filter(i => i.type === 'song').length;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.songItem, { backgroundColor: isActive ? '#f9f9f9' : '#fff' }]}
        >
          <View style={styles.songInfo}>
            <Text style={styles.trackNumber}>{songIndex + 1}.</Text>
            <Text style={styles.songName}>{item.songName}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.addSongContainer}>
        <TextInput
          style={styles.input}
          placeholder="曲名 または 区切り名"
          value={inputText}
          onChangeText={handleInputChange}
        />
        {songSuggestions.length > 0 && (
          <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="handled">
            {songSuggestions.map(song => (
              <TouchableOpacity key={song} style={styles.suggestionItem} onPress={() => handleAddItem('song', song)}>
                <Text>{song}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.buttonGroup}>
          <Button title="曲を追加" onPress={() => handleAddItem('song')} />
          <View style={{ width: 10 }} />
          <Button title="区切りを追加" onPress={() => handleAddItem('header')} color="#555" />
        </View>
      </View>

      <DraggableFlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => `draggable-item-${item.id}`}
        onDragEnd={({ data }) => setItems(data)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>下のフォームから曲や区切りを追加してください</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    addSongContainer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor: '#f9f9f9',
      zIndex: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    suggestionList: {
      maxHeight: 150,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 10,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    songItem: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor: '#fff'
    },
    headerItem: {
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
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
    songInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    trackNumber: { 
      fontSize: 16, 
      color: '#888', 
      marginRight: 16,
      width: 30,
    },
    songName: { 
      fontSize: 18,
      flex: 1,
    },
    deleteButton: {
      padding: 10,
      marginLeft: 10,
    },
    deleteButtonAbsolute: {
      position: 'absolute',
      right: 10,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      padding: 10,
    },
    deleteButtonText: {
      fontSize: 22,
      color: '#aaa',
      fontWeight: '300',
    },
    emptyContainer: { 
      padding: 40, 
      alignItems: 'center' 
    },
    emptyText: { 
      color: '#888' 
    },
  });