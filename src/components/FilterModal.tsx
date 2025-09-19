import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Button, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { StarRating } from './StarRating';
import { TextInput } from 'react-native-gesture-handler';

export type FilterSortOptions = {
  artist: string;
  venue: string;
  year: string;
  minRating: number;
  sortKey: 'liveDate' | 'artistName' | 'rating' | 'venueName';
  sortOrder: 'DESC' | 'ASC';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (options: FilterSortOptions) => void;
  initialOptions: FilterSortOptions;
  artistSuggestions: string[];
  venueSuggestions: string[];
};

const sortOptions = [
    { key: 'liveDate', label: '開催日' },
    { key: 'artistName', label: 'アーティスト名' },
    { key: 'rating', label: '評価' },
    { key: 'venueName', label: '会場名' },
] as const;

export const FilterModal = ({ visible, onClose, onApply, initialOptions, artistSuggestions, venueSuggestions }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [options, setOptions] = useState<FilterSortOptions>(initialOptions);

  const handleApply = () => {
    onApply(options);
    onClose();
  };

  const handleReset = () => {
    setOptions(initialOptions);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>絞り込み・並べ替え</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/** 絞り込み機能 **/}
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>絞り込み</Text>
            <TextInput
            style={styles.input}
            placeholder='アーティスト名で絞り込み'
            placeholderTextColor={theme.subtext}
            value={options.artist}
            onChangeText={(text) => setOptions(prev=> ({...prev, artist: text}))}
            />
            <TextInput
            style={styles.input}
            placeholder='会場名で絞り込み'
            placeholderTextColor={theme.subtext}
            value={options.venue}
            onChangeText={(text) => setOptions(prev=> ({...prev, venue: text}))}
            />

            <TextInput
              style={styles.input}
              placeholder="年で絞り込み (例: 2025)"
              placeholderTextColor={theme.subtext}
              value={options.year}
              onChangeText={(text) => setOptions(prev => ({...prev, year: text.replace(/[^0-9]/g, '')}))}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.sectionTitle}>評価</Text>
            <View style={styles.ratingContainer}>
            <StarRating rating={options.minRating} onRate={(r) => setOptions(prev => ({...prev, minRating: r}))} size={36} />
            {options.minRating > 0 && (
                <TouchableOpacity onPress={() => setOptions(prev => ({...prev, minRating: 0}))}>
                    <Text style={styles.clearRatingText}>クリア</Text>
                </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>並べ替え</Text>
          <View style={styles.sortKeyContainer}>
            {sortOptions.map(opt => (
                <TouchableOpacity
                    key={opt.key}
                    style={[styles.sortButton, options.sortKey === opt.key && styles.sortButtonSelected]}
                    onPress={() => setOptions(prev => ({...prev, sortKey: opt.key}))}
                >
                    <Text style={[styles.sortButtonText, options.sortKey === opt.key && styles.sortButtonTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
          </View>
          <View style={styles.sortOrderContainer}>
            <TouchableOpacity onPress={() => setOptions(prev => ({...prev, sortOrder: 'DESC'}))} style={styles.sortOrderButton}>
                <Ionicons name="arrow-down" size={18} color={options.sortOrder === 'DESC' ? theme.primary : theme.text} />
                <Text style={[styles.sortOrderText, options.sortOrder === 'DESC' && styles.sortOrderTextSelected]}>降順</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOptions(prev => ({...prev, sortOrder: 'ASC'}))} style={styles.sortOrderButton}>
                <Ionicons name="arrow-up" size={18} color={options.sortOrder === 'ASC' ? theme.primary : theme.text} />
                <Text style={[styles.sortOrderText, options.sortOrder === 'ASC' && styles.sortOrderTextSelected]}>昇順</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

          <View style={styles.buttonContainer}>
            <Button title="リセット" onPress={handleReset} color={theme.subtext} />
            <Button title="この条件で表示" onPress={handleApply} color={theme.primary}/>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: tokens.spacing.xl,
    height: '60%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
    paddingBottom: tokens.spacing.m,
  },
  title: {
    ...tokens.typography.title,
    color: theme.text,
  },
  sectionTitle: {
      ...tokens.typography.subtitle,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: tokens.spacing.xl,
      marginBottom: tokens.spacing.m,
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
    marginBottom: tokens.spacing.ss,
  },
  subLabel :{
    color: theme.subtext,
    marginBottom: tokens.spacing.s,
    fontSize: 14,
  },
  sortKeyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.l,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.separator,
    marginRight: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
  },
  sortButtonSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  sortButtonText: {
    color: theme.text,
  },
  sortButtonTextSelected: {
    color: theme.buttonSelectedText,
    fontWeight: 'bold',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: tokens.spacing.m,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.spacing.xl,
  },
  sortOrderText: {
    color: theme.text,
    fontSize: 16,
    marginLeft: tokens.spacing.xs,
  },
  sortOrderTextSelected: {
        color: theme.primary,
        fontWeight: 'bold',
},
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  clearRatingText: {
      color: theme.primary,
      fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto', 
  },
});