import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { addLive, updateLive, Live, getDistinctArtists, getDistinctVenues, getDistinctTags } from '../database/db';
import { StarRating } from './StarRating';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
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

  const [rating, setRating] = useState(initialData?.rating || 0);
  const [memo, setMemo] = useState(initialData?.memo || '');

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        await updateLive({ ...initialData, liveName, liveDate, venueName, artistName, tags, rating, memo });
        Toast.show({ type: 'success', text1: '更新しました' });
      } else {
        await addLive({ liveName, liveDate, venueName, artistName, tags, rating, memo });
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
      <View style={styles.formGroup}>
        <Text style={styles.label}>ライブ名 *</Text>
        <TextInput
          style={styles.input}
          value={liveName}
          onChangeText={setLiveName}
          placeholder="例：〇〇 Tour 2025"
          placeholderTextColor={theme.subtext}
        />
      </View>

      <View style={styles.formGroup}>
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
            placeholderTextColor={theme.subtext}
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
            placeholderTextColor={theme.subtext}
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
            placeholderTextColor={theme.subtext}
          />
          <Text style={styles.dateSeparator}>日</Text>
        </View>
      </View>
      
      <View style={styles.formGroup}>
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
      </View>

      <View style={styles.formGroup}>
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
      </View>
      
      <View style={styles.formGroup}>
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
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>評価</Text>
        <StarRating rating={rating} onRate={setRating} size={32} />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>感想メモ</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          value={memo}
          onChangeText={setMemo}
          placeholder="ライブの感想などを記録できます"
          placeholderTextColor={theme.subtext}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <Button 
        title={initialData ? "更新する" : "ライブ情報を保存"} 
        onPress={handleSaveLive}
        color={theme.primary} />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    padding: tokens.spacing.xl,
    backgroundColor: theme.background,
  },
  inputWrapper: {
    marginBottom: tokens.spacing.xxl,
  },
  formGroup: {
    marginBottom: tokens.spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: tokens.spacing.s,
    color: theme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.separator,
    backgroundColor: theme.inputBackground,
    color: theme.text,
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.m,
    borderRadius: 8,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.separator,
    backgroundColor: theme.inputBackground, 
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.m,
    color: theme.text,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  dateSeparator: {
    fontSize: 16,
    color: theme.subtext,
    marginHorizontal: tokens.spacing.m,
  },
  suggestionList: {
    maxHeight: 150,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.separator,
    borderRadius: 8,
    marginTop: tokens.spacing.xs,
  },
  suggestionItem: {
    padding: tokens.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  suggestionText: {
    fontSize: 16,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginBottom: tokens.spacing.xxl,
  },
  memoInput: {
    height: 120,
    textAlignVertical: 'top',
  }
});