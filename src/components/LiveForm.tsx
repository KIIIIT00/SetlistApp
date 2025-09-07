import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { addLive, updateLive, Live } from '../database/db';

type LiveFormProps = {
  onSave: () => void;
  initialData?: Live;
};

export const LiveForm = ({ onSave, initialData }: LiveFormProps) => {
  const [liveName, setLiveName] = useState(initialData?.liveName || '');
  const [venueName, setVenueName] = useState(initialData?.venueName || '');
  const [artistName, setArtistName] = useState(initialData?.artistName || '');
  const [date, setDate] = useState(initialData?.liveDate ? new Date(initialData.liveDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => setShowDatePicker(true);
  
  const formatDateForDisplay = (d: Date): string => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

  const formatDateForDatabase = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSaveLive = async () => {
    const liveDate = formatDateForDatabase(date);
    if (!liveName.trim()) {
      Alert.alert('入力エラー', 'ライブ名は必須です。');
      return;
    }

    try {
      if (initialData) {
        // 編集モードの場合：updateLiveを呼び出す
        await updateLive({
          ...initialData,
          liveName,
          liveDate,
          venueName,
          artistName,
        });
        Toast.show({ type: 'success', text1: '更新しました' });
      } else {
        // 新規追加モードの場合：addLiveを呼び出す
        await addLive({ liveName, liveDate, venueName, artistName });
        Toast.show({ type: 'success', text1: '保存しました' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: '保存に失敗しました' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ライブ名 *</Text>
      <TextInput
        style={styles.input}
        value={liveName}
        onChangeText={setLiveName}
        placeholder="例：React Native Tour 2025"
      />
      
      <Text style={styles.label}>日付 *</Text>
      <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>{formatDateForDisplay(date)}</Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          locale="ja-JP"
        />
      )}

      <Text style={styles.label}>会場名</Text>
      <TextInput
        style={styles.input}
        value={venueName}
        onChangeText={setVenueName}
        placeholder="例：東京ドーム"
      />

      <Text style={styles.label}>アーティスト名</Text>
      <TextInput
        style={styles.input}
        value={artistName}
        onChangeText={setArtistName}
        placeholder="例：Expo Band"
      />

      <Button
        title={initialData ? "更新する" : "ライブ情報を保存"}
        onPress={handleSaveLive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
});