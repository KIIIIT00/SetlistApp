import React, { useState, useCallback, useLayoutEffect, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Keyboard, ScrollView, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { getSetlistsForLive, Setlist, updateSetlistForLive, getSongsByArtist } from '../database/db';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type EditSetlistScreenRouteProp = RouteProp<RootStackParamList, 'EditSetlist'>;
type EditSetlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditSetlist'>;

type SongOrHeader = Omit<Setlist, 'id' | 'liveId'> & { id: number | string };

type SetlistItemForUpdate = Omit<Setlist, 'id' | 'liveId'> & {
  clientId: string;
};

export const EditSetlistScreen = () => {
  const navigation = useNavigation<EditSetlistScreenNavigationProp>();
  const route = useRoute<EditSetlistScreenRouteProp>();
  const { liveId, artistName } = route.params;

  const [items, setItems] = useState<SongOrHeader[]>([]);
  const [inputText, setInputText] = useState('');

  const [setlist, setSetlist] = useState<SetlistItemForUpdate[]>([]);

  const [songSuggestions, setSongSuggestions] = useState<string[]>([]);
  const [allSongsForArtist, setAllSongsForArtist] = useState<string[]>([]);
  const [allSongs, setAllSongs] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const flatListRef = useRef<FlatList<SetlistItemForUpdate>>(null);
  const headerHeight = useHeaderHeight();

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSave = useCallback(async () => {
    try{
      const setlistForDb = setlist.map(({ clientId, ...rest}) => rest);
      await updateSetlistForLive(liveId, setlistForDb);
      Toast.show({ type: 'success', text1: 'セットリストを更新しました' });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: '更新に失敗しました' });
    }
  }, [liveId, setlist, navigation]);

    useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => 
      <Button onPress={handleSave} title="保存" color={theme.primary}/>,
    });
  }, [navigation, handleSave, theme]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getSetlistsForLive(liveId);
      const reorderedData = data.map((item, index) => ({
        ...item,
        trackNumber: index + 1,
        clientId: `db-${item.id}-${Math.random()}`
      }));
      setSetlist(reorderedData);

      if (artistName) {
        const songs = await getSongsByArtist(artistName);
        setAllSongs(songs);
      }
    };
    loadData();
  }, [liveId, artistName]);

  useEffect(() => {
    if (focusedIndex !== null && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: focusedIndex,
          animated: true,
          viewPosition: 0.2
        });
      }, 300);
    }
  }, [focusedIndex]);

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

  const updateItem = (index: number, newSongName: string) => {
    const newList = [...setlist];
    newList[index].songName = newSongName;
    setSetlist(newList);
  };

  const addItem = (type: 'song' | 'header') => {
    const newItem: SetlistItemForUpdate = {
      trackNumber: setlist.length + 1,
      songName: type === 'header' ? 'ENCORE' : '',
      type: type,
      clientId: `new-${Date.now()}-${Math.random()}`
    };
    setSetlist(prev => {
      const newSetlist = [...prev, newItem];
      // State更新が完了した直後にスクロールを実行する
      setTimeout(() => {
          setFocusedIndex(newSetlist.length - 1);
      }, 100);
      return newSetlist;
    });
  };

  const addHeader = () => addItem('header');
  const addSong = () => addItem('song');
  
  const removeItem = (index: number) => {
    Alert.alert("削除の確認", "この項目を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => {
        const newList = setlist.filter((_, i) => i !== index).map((item, i) => ({ ...item, trackNumber: i + 1 }));
        setSetlist(newList);
      }}
    ]);
  };

  const onDragEnd = ({ data }: { data: SetlistItemForUpdate[] }) => {
    const reorderedData = data.map((item, index) => ({
      ...item,
      trackNumber: index + 1,
    }));
    setSetlist(reorderedData);
  };

  const renderItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<SetlistItemForUpdate>) => {
    const index = getIndex() ?? 0;
    const isHeader = item.type === 'header';

    return (
      <View style={[styles.itemContainer, isActive && styles.itemActive]}>
        <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
          <Ionicons name="menu" size={24} color={theme.icon} />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={isHeader ? styles.headerInput : styles.songInput}
            value={item.songName}
            placeholder={isHeader ? 'ヘッダー (例: ENCORE)' : `${item.trackNumber}. 曲名`}
            placeholderTextColor={theme.subtext}
            onChangeText={(text) => {
              updateItem(index, text);
              if (!isHeader) {
                // 明示的に文字が空でないことをチェック
                if (text && text.trim() !== ''){
                  const suggestions = allSongs.filter(s => s.toLowerCase().includes(text.toLowerCase()));
                  setSongSuggestions(suggestions);
                } else {
                  setSongSuggestions([]);
                }
              }
            }}
             onFocus={() => {
              setFocusedIndex(index);
              if (item.songName.trim() === '') {
                setSongSuggestions([]);
              }
            }}
            // onBlur={() => setTimeout(() => setFocusedIndex(null), 200)}
            // onBlur={() => setFocusedIndex(null)}
          />
          {focusedIndex === index && songSuggestions.length > 0 && !isHeader && (
            <ScrollView 
              style={styles.suggestionList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {songSuggestions.map((suggestion, i) => (
                <TouchableOpacity
                  key={`${suggestion}-${i}`}
                  style={styles.suggestionItem}
                  onPressIn={() => {
                    updateItem(index, suggestion);
                    setSongSuggestions([]);
                    setFocusedIndex(null);
                    Keyboard.dismiss();
                  }}
                >
                  <Text>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteButton}>
          <Ionicons name="remove-circle" size={24} color={theme.danger} />
        </TouchableOpacity>
      </View>
    );
  }, [setlist, allSongs, songSuggestions, focusedIndex, theme]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.buttonsContainer}>
        <Button title="+ 曲を追加" onPress={addSong} />
        <Button title="+ 区切りを追加" onPress={addHeader} />
      </View>
      <DraggableFlatList
        ref={flatListRef as any}
        data={setlist}
        onDragEnd={onDragEnd}
        keyExtractor={(item) => item.clientId}
        renderItem={renderItem}
        containerStyle={{ flex: 1 }}
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: tokens.spacing.m,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.m,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  itemActive: {
    backgroundColor: theme.inputBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    paddingHorizontal: tokens.spacing.m,
  },
  inputWrapper: {
    flex: 1,
    zIndex: 1,
  },
  songInput: {
    fontSize: 16,
    padding: tokens.spacing.s,
    color: theme.text,
  },
  headerInput: {
    fontSize: 16,
    padding: tokens.spacing.s,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  deleteButton: {
    padding: tokens.spacing.m,
  },
  suggestionList: {
    maxHeight: 150,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.separator,
    borderRadius: 8,
    marginTop: tokens.spacing.xs,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
  },
  suggestionItem: {
    padding: tokens.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  suggestionText: {
    fontSize: 16,
    color: theme.text,
  },
});

