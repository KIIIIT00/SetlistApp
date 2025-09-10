import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { addSetlistItem } from '../database/db';
import { RootStackParamList } from '../../App';

type AddSongScreenRouteProp = RouteProp<RootStackParamList, 'AddSong'>;

export const AddSongScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<AddSongScreenRouteProp>();
  const { liveId } = route.params;

  const [trackNumber, setTrackNumber] = useState('');
  const [songName, setSongName] = useState('');
  const [memo, setMemo] = useState('');

  const handleSaveSong = async () => {
    if (!songName.trim() || !trackNumber.trim()) {
      Alert.alert('入力エラー', '曲順と曲名は必須です。');
      return;
    }

    const trackNum = parseInt(trackNumber, 10);
    if (isNaN(trackNum)) {
      Alert.alert('入力エラー', '曲順は数字で入力してください。');
      return;
    }

    try {
      await addSetlistItem({
        liveId: liveId,
        trackNumber: trackNum,
        songName: songName,
        memo: memo,
        type: 'song',
      });

      Toast.show({
        type: 'success',
        text1: '曲を追加しました',
      });

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '追加に失敗しました',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>曲順 *</Text>
      <TextInput
        style={styles.input}
        value={trackNumber}
        onChangeText={setTrackNumber}
        placeholder="例: 1"
        keyboardType="number-pad" // 数字キーボードを表示
      />

      <Text style={styles.label}>曲名 *</Text>
      <TextInput
        style={styles.input}
        value={songName}
        onChangeText={setSongName}
        placeholder="例: Hello, World!"
      />

      <Text style={styles.label}>メモ</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={memo}
        onChangeText={setMemo}
        placeholder="例: イントロのギターが最高"
        multiline
      />

      <Button title="この曲を保存" onPress={handleSaveSong} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Androidでテキストを上揃えにする
  },
});