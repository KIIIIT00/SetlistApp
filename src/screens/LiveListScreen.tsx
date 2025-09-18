import React, { useCallback, useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getLives, Live, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { StarRating } from '../components/StarRating';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadLives = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getLives({ searchQuery, artistFilter, yearFilter });
      setLives(data);
      
      if (data.length > 0) {
        console.log("LiveListScreen: データベースから取得したデータ:", data[0]);
      }

    } catch (error) {
        console.error("Failed to load lives:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, artistFilter, yearFilter]);

  useFocusEffect(
    useCallback(() => {
      loadLives();
    }, [loadLives])
  );
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            style={{ marginRight: 20 }}
          >
            <Ionicons name="settings-outline"  size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Stats')}
            style={{ marginRight: 20 }}
          >
            <Ionicons name="bar-chart-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Ionicons name="calendar-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => <Button onPress={() => navigation.navigate('AddLive', {})} title="新規追加" />,
    });
  }, [navigation, theme]);

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
            await loadLives();
          },
        },
      ]
    );
  };
  
  const renderRightActions = (liveId: number) => (
    <TouchableOpacity onPress={() => handleDelete(liveId)} style={styles.deleteButton}>
      <Text style={styles.deleteButtonText}>削除</Text>
    </TouchableOpacity>
  );

  const formatDateForList = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const renderItem = ({ item }: { item: Live }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('LiveDetail', { liveId: item.id })}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.itemTitle}>{item.liveName}</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-music" size={16} color={theme.icon} />
            <Text style={styles.itemSubtitle}>{item.artistName || 'アーティスト未登録'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-sharp" size={16} color={theme.icon} />
            <Text style={styles.itemDetail}>{item.venueName || '会場未登録'}</Text>
          </View>
           <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.icon} />
            <Text style={styles.itemDetail}>{formatDateForList(item.liveDate)}</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <StarRating rating={item.rating} />
          </View>
          {item.tags && (
            <View style={styles.tagsContainer}>
              {item.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="キーワードで検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          placeholderTextColor={theme.subtext}
        />
        <View style={styles.filterRow}>
          <TextInput
            style={[styles.searchInput, styles.filterInput]}
            placeholder="アーティスト名で絞り込み"
            value={artistFilter}
            onChangeText={setArtistFilter}
            clearButtonMode="while-editing"
            placeholderTextColor={theme.subtext}
          />
          <TextInput
            style={[styles.searchInput, styles.filterInput, { flex: 0.5 }]}
            placeholder="年 (例: 2025)"
            value={yearFilter}
            onChangeText={setYearFilter}
            keyboardType="number-pad"
            clearButtonMode="while-editing"
            placeholderTextColor={theme.subtext}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : lives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || artistFilter || yearFilter ? '検索・絞り込み結果がありません' : 'まだライブが登録されていません。'}
          </Text>
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: theme.background 
    },
    searchContainer: { 
        padding: tokens.spacing.m, 
        backgroundColor: theme.card,
        borderBottomWidth: 1, 
        borderBottomColor: theme.separator 
    },
    searchInput: { 
        backgroundColor: theme.inputBackground, 
        borderRadius: 8, 
        padding: tokens.spacing.l, 
        fontSize: 16,
        color: theme.text,
    },
    filterRow: {
        flexDirection: 'row',
        marginTop: tokens.spacing.m,
        alignItems: 'center',
    },
    filterInput: {
        flex: 1,
        marginRight: tokens.spacing.m,
    },
    itemContainer: { 
        backgroundColor: theme.card, 
        padding: tokens.spacing.xl 
    },
    infoContainer: { 
        flex: 1 
    },
    itemTitle: { 
        ...tokens.typography.title,
        color: theme.text,
    },
    detailRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: tokens.spacing.s,
    },
    itemSubtitle: { 
        ...tokens.typography.subtitle,
        color: theme.subtext, 
        marginLeft: tokens.spacing.s 
    },
    itemDetail: { 
        ...tokens.typography.body,
        color: theme.detailText, 
        marginLeft: tokens.spacing.s 
    },
    tagsContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginTop: tokens.spacing.m 
    },
    tag: { 
        backgroundColor: theme.tagBackground,
        borderRadius: 12, 
        paddingVertical: tokens.spacing.xs, 
        paddingHorizontal: tokens.spacing.m, 
        marginRight: tokens.spacing.s, 
        marginBottom: tokens.spacing.s
    },
    tagText: { 
        ...tokens.typography.caption,
        color: theme.tagText, 
        fontWeight: '500' 
    },
    separator: { 
        height: 1, 
        backgroundColor: theme.separator 
    },
    deleteButton: { 
        backgroundColor: theme.danger, 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: 100 
    },
    deleteButtonText: { 
        color: theme.buttonSelectedText, 
        fontWeight: 'bold' 
    },
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: tokens.spacing.xxl
    },
    emptyText: { 
        fontSize: 18, 
        color: theme.emptyText, 
        textAlign: 'center' 
    },
});