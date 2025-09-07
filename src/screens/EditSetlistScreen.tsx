import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Keyboard, Modal } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import { getSetlistsForLive, Setlist, updateSetlistForLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type EditSetlistScreenRouteProp = RouteProp<RootStackParamList, 'EditSetlist'>;
type EditSetlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditSetlist'>;

type Song = Omit<Setlist, 'id' | 'liveId'> & { id?: number | string };

export const EditSetlistScreen = () => {
  const navigation = useNavigation<EditSetlistScreenNavigationProp>();
  const route = useRoute<EditSetlistScreenRouteProp>();
  const { liveId } = route.params;

  const [songs, setSongs] = useState<Song[]>([]);
  const [newSongName, setNewSongName] = useState('');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentlyEditingSong, setCurrentlyEditingSong] = useState<Song | null>(null);
  const [editedSongName, setEditedSongName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadSetlist = async () => {
        const data = await getSetlistsForLive(liveId);
        setSongs(data);
      };
      loadSetlist();
    }, [liveId])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button onPress={handleSave} title="保存" />,
    });
  }, [navigation, songs]);

  const handleAddSong = () => {
    if (!newSongName.trim()) return;
    const newSong: Song = {
      id: `new_${Date.now()}`,
      songName: newSongName.trim(),
      trackNumber: songs.length + 1,
    };
    setSongs([...songs, newSong]);
    setNewSongName('');
    Keyboard.dismiss();
  };

  const handleDeleteSong = (songIdToDelete: number | string) => {
    setSongs((currentSongs) =>
      currentSongs.filter((song) => song.id !== songIdToDelete)
    );
  };

  const handleSave = async () => {
    const updatedSetlist = songs.map((song, index) => ({
      ...song,
      trackNumber: index + 1,
    }));
    try {
      await updateSetlistForLive(liveId, updatedSetlist);
      Toast.show({ type: 'success', text1: 'セットリストを更新しました' });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: '更新に失敗しました' });
    }
  };

  const openEditModal = (song: Song) => {
    setCurrentlyEditingSong(song);
    setEditedSongName(song.songName);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setCurrentlyEditingSong(null);
    setEditedSongName('');
  };

  const handleUpdateSongName = () => {
    if (!currentlyEditingSong || !editedSongName.trim()) return;
    
    setSongs(currentSongs => 
      currentSongs.map(song => 
        song.id === currentlyEditingSong.id 
          ? { ...song, songName: editedSongName.trim() } 
          : song
      )
    );
    
    closeEditModal();
  };


  const renderItem = ({ item, drag, isActive }: RenderItemParams<Song>) => {
    const currentIndex = songs.findIndex((song) => song.id === item.id);
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          onLongPress={drag}
          disabled={isActive}
          style={[styles.songItem, { backgroundColor: isActive ? '#f0f0f0' : '#fff' }]}
        >
          <View style={styles.songInfo}>
            <Text style={styles.trackNumber}>{currentIndex + 1}.</Text>
            <Text style={styles.songName}>{item.songName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteSong(item.id!)}
            style={styles.deleteButton}
          >
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
          placeholder="曲名を入力"
          value={newSongName}
          onChangeText={setNewSongName}
          onSubmitEditing={handleAddSong}
        />
        <Button title="追加" onPress={handleAddSong} />
      </View>

      <DraggableFlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => `draggable-item-${item.id}`}
        onDragEnd={({ data }) => setSongs(data)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>下のフォームから曲を追加してください</Text>
          </View>
        }
      />

      {/* 編集用 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>曲名を編集</Text>
            <TextInput
              style={styles.modalInput}
              value={editedSongName}
              onChangeText={setEditedSongName}
              autoFocus={true}
            />
            <View style={styles.modalButtonContainer}>
              <Button title="キャンセル" onPress={closeEditModal} color="#888" />
              <Button title="更新" onPress={handleUpdateSongName} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  addSongContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
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
  deleteButtonText: {
    fontSize: 22,
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888' },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});