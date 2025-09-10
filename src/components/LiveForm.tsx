import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { addLive, updateLive, Live, getDistinctArtists, getDistinctVenues, getDistinctTags } from '../database/db';

type AutoCompleteInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
};

const AutoCompleteInput = ({ label, value, onChangeText, placeholder, suggestions, onSuggestionPress }: AutoCompleteInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ScrollView
          style={styles.suggestionList}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {suggestions.map(item => (
            <TouchableOpacity key={item} style={styles.suggestionItem} onPress={() => onSuggestionPress(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};


type LiveFormProps = { onSave: () => void; initialData?: Live; };

export const LiveForm = ({ onSave, initialData }: LiveFormProps) => {
  const [liveName, setLiveName] = useState(initialData?.liveName || '');
  const [venueName, setVenueName] = useState(initialData?.venueName || '');
  const [artistName, setArtistName] = useState(initialData?.artistName || '');
  const [tags, setTags] = useState(initialData?.tags || '');

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const monthInputRef = useRef<TextInput>(null);
  const dayInputRef = useRef<TextInput>(null);

  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [allVenues, setAllVenues] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);


  useEffect(() => {
    if (initialData?.liveDate) {
      const [y, m, d] = initialData.liveDate.split('-');
      setYear(y || '');
      setMonth(m ? String(parseInt(m, 10)) : '');
      setDay(d ? String(parseInt(d, 10)) : '');
    }
  }, [initialData]);

  useEffect(() => {
    const loadSuggestions = async () => {
      setAllArtists(await getDistinctArtists());
      setAllVenues(await getDistinctVenues());
      setAllTags(await getDistinctTags());
    };
    loadSuggestions();
  }, []);

  /**
   * 日付の妥当性をチェックする
   * @param y 年
   * @param m 月
   * @param d 日
   * @returns 妥当な日付であればtrue
   */
  const isValidDate = (y: string, m: string, d: string): boolean => {
    const yearNum = parseInt(y, 10);
    const monthNum = parseInt(m, 10);
    const dayNum = parseInt(d, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || y.length !== 4) {
      return false;
    }

    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);

    // 指定した日付と生成された日付が一致するかチェック
    return (
      date.getFullYear() === yearNum &&
      date.getMonth() === monthNum - 1 &&
      date.getDate() === dayNum
    );
  };

  const handleSaveLive = async () => {
    if (!isValidDate(year, month, day)) {
      Alert.alert('入力エラー', '日付を正しく入力してください。\n例: 2025 / 09 / 10');
      return;
    }
    const liveDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    if (!liveName.trim()) {
      Alert.alert('入力エラー', 'ライブ名は必須です。');
      return;
    }
    try {
      if (initialData) {
        await updateLive({ ...initialData, liveName, liveDate, venueName, artistName, tags });
        Toast.show({ type: 'success', text1: '更新しました' });
      } else {
        await addLive({ liveName, liveDate, venueName, artistName, tags });
        Toast.show({ type: 'success', text1: '保存しました' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: '保存に失敗しました' });
    }
  };

  /**
   * 入力値を数字のみに制限するハンドラ
   */
  const handleNumericInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    // 数字以外の入力を弾く
    if (/^\d*$/.test(value)) {
      setter(value);
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
      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.dateInput}
          value={year}
          onChangeText={(text) => {
            handleNumericInputChange(setYear, text);
            if (text.length === 4) {
              monthInputRef.current?.focus();
            }
          }}
          placeholder="YYYY"
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.dateSeparator}>年</Text>

        <TextInput
          ref={monthInputRef}
          style={styles.dateInput}
          value={month}
          onChangeText={(text) => {
            handleNumericInputChange(setMonth, text);
            if (text.length === 2) {
              dayInputRef.current?.focus();
            }
          }}
          placeholder="MM"
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={styles.dateSeparator}>月</Text>

        <TextInput
          ref={dayInputRef}
          style={styles.dateInput}
          value={day}
          onChangeText={(text) => handleNumericInputChange(setDay, text)}
          placeholder="DD"
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={styles.dateSeparator}>日</Text>
      </View>
      
      <AutoCompleteInput
        label="アーティスト名"
        value={artistName}
        onChangeText={(text) => {
          setArtistName(text);
          setArtistSuggestions(text ? allArtists.filter(name => name.toLowerCase().includes(text.toLowerCase())) : []);
        }}
        suggestions={artistSuggestions}
        onSuggestionPress={(suggestion) => {
          setArtistName(suggestion);
          setArtistSuggestions([]);
        }}
      />
      <AutoCompleteInput
        label="会場名"
        value={venueName}
        onChangeText={(text) => {
          setVenueName(text);
          setVenueSuggestions(text ? allVenues.filter(name => name.toLowerCase().includes(text.toLowerCase())) : []);
        }}
        suggestions={venueSuggestions}
        onSuggestionPress={(suggestion) => {
          setVenueName(suggestion);
          setVenueSuggestions([]);
        }}
      />
      <AutoCompleteInput
        label="タグ"
        value={tags}
        placeholder="カンマ区切りで入力"
        onChangeText={(text) => {
          setTags(text);
          const currentTag = text.split(',').pop()?.trim() || '';
          setTagSuggestions(currentTag ? allTags.filter(tag => tag.toLowerCase().includes(currentTag.toLowerCase())) : []);
        }}
        suggestions={tagSuggestions}
        onSuggestionPress={(suggestion) => {
          const tagParts = tags.split(',').map(t => t.trim());
          tagParts[tagParts.length - 1] = suggestion;
          setTags(tagParts.join(', '));
          setTagSuggestions([]);
        }}
      />

      <Button title={initialData ? "更新する" : "ライブ情報を保存"} onPress={handleSaveLive} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  inputWrapper: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#333' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  dateSeparator: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  suggestionList: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
});