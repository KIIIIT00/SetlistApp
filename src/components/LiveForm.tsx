import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { addLive} from '../database/db';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// propsの型を定義
type LiveFormProps = {
  onSave: () => void; // 保存が成功したときに呼び出す関数
};

export const LiveForm = ({ onSave }: LiveFormProps) => {
  const [liveName, setLiveName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [artistName, setArtistName] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if(event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  /**
   * 日付をユーザー向けの表示形式（YYYY年M月D日）にフォーマットする関数
   */
  const formatDateForDisplay = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  /**
   * 日付をデータベース保存用の形式（YYYY-MM-DD）にフォーマットする関数
   */
  const formatDateForDatabase = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSaveLive = async () => {
    const liveDate = formatDateForDatabase(date);
    if (!liveName.trim()) {
      Alert.alert('入力エラー', 'ライブ名は必須です。');
      return;
    }

    try {
      // データベースに保存
      await addLive({ liveName, liveDate, venueName, artistName });
      
      Toast.show({
        type: 'success',
        text1: '保存しました',
        text2: `${liveName} の情報を記録しました。`,
      });

      // 保存が成功したら、一覧画面に戻る処理を呼び出す
      onSave();
    } catch (error) {
      // エラー時のToastメッセージ
      Toast.show({
        type: 'error',
        text1: '保存に失敗しました',
        text2: 'エラーが発生しました。もう一度お試しください。',
      });
      console.error(error);
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
      {/* ボタンのテキストは表示用の日付形式を使用 */}
      <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>{formatDateForDisplay(date)}</Text>
      </TouchableOpacity>
      

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          locale="ja-JP" // カレンダーを日本語表示にする
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

      <Button title="ライブ情報を保存" onPress={handleSaveLive} />
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