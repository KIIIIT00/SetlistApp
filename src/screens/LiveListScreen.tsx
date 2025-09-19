import React, { useCallback, useState, useLayoutEffect, useEffect, useRef, useMemo, use, Children } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getLives, Live, deleteLive, getDistinctArtists, getDistinctVenues } from '../database/db';
import { RootStackParamList } from '../../App';
import { StarRating } from '../components/StarRating';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';
import { FilterModal, FilterSortOptions } from '../components/FilterModal';
import { ActiveFilters } from '../components/ActiveFilters';


const initialFilterSortOptions: FilterSortOptions = {
    artist: '',
    venue: '',
    year: '',
    minRating: 0,
    sortKey: 'liveDate',
    sortOrder: 'DESC',
};

const AnimatedCard = ({ item, index, children }: { item: Live, index: number, children: React.ReactNode }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, 
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
    }).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }], 
      }}
    >
      {children}
    </Animated.View>
  );
};

export const LiveListScreen = () => {
  const [lives, setLives] = useState<Live[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [filterSortOptions, setFilterSortOptions] = useState(initialFilterSortOptions);
  const [isModalVisible, setModalVisible] = useState(false);

  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [allVenues, setAllVenues] = useState<string[]>([]);

  // FABアニメーション用
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const isFabVisible = useRef(true);
  const EmptyState = ({ onAddNewLive, isFiltering }: { onAddNewLive: () => void; isFiltering: boolean }) => {

  if (isFiltering) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={60} color={theme.emptyText} />
        <Text style={styles.emptyTitle}>結果がありません</Text>
        <Text style={styles.emptySubtitle}>検索または絞り込みの条件に一致するライブ記録は見つかりませんでした。</Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={80} color={theme.emptyText} />
      <Text style={styles.emptyTitle}>最初のライブを記録しましょう</Text>
      <Text style={styles.emptySubtitle}>右下の「＋」ボタン、または下のボタンからライブ情報を簡単に追加できます。</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddNewLive}>
        <Text style={styles.emptyButtonText}>ライブ情報を追加する</Text>
      </TouchableOpacity>
    </View>
  );
};

  const loadLives = useCallback(async () => {
    try {
      setIsLoading(true);
      // const data = await getLives({ searchQuery, artistFilter, yearFilter });
      const data = await getLives({ filterSortOptions }); 
      setLives(data);
      
      if (data.length > 0) {
        console.log("LiveListScreen: データベースから取得したデータ:", data[0]);
      }

    } catch (error) {
        console.error("Failed to load lives:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterSortOptions]);

  useFocusEffect(
    useCallback(() => {
      loadLives();
      const loadSuggestions = async () => {
        setAllArtists(await getDistinctArtists());
        setAllVenues(await getDistinctVenues());
      };
      loadSuggestions();
    }, [loadLives])
  );
  
  const fabStyle = {
        opacity: fabAnimation,
        transform: [{ scale: fabAnimation }],
  };

  const handleRemoveFilter = (keyToRemove: keyof FilterSortOptions) => {
        setFilterSortOptions(prev => ({
            ...prev,
            // 指定されたキーの値を初期状態に戻す
            [keyToRemove]: initialFilterSortOptions[keyToRemove],
        }));
    };
  
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
      headerRight: () => (
        // <Button onPress={() => navigation.navigate('AddLive', {})} title="新規追加" />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      ),
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

  const onScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      if (scrollY > 50 && isFabVisible.current) {
          isFabVisible.current = false;
          Animated.timing(fabAnimation, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      } else if (scrollY <= 50 && !isFabVisible.current) {
          isFabVisible.current = true;
          Animated.timing(fabAnimation, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }
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

  const renderItem = ({ item, index }: { item: Live, index: number }) => (
    <AnimatedCard item={item} index={index}>
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
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <ActiveFilters options={filterSortOptions} onRemove={handleRemoveFilter} />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : lives.length === 0 ? (
        <EmptyState
          onAddNewLive={() => navigation.navigate('AddLive', {})}
          isFiltering={filterSortOptions.minRating > 0 || !!filterSortOptions.artist || !!filterSortOptions.venue || !!filterSortOptions.year}
        />
      ) : (
        <FlatList
          data={lives}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      <Animated.View style={[styles.fabContainer, fabStyle]}>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddLive', {})}>
            <Ionicons name="add" size={32} color={theme.buttonSelectedText} />
        </TouchableOpacity>
      </Animated.View>

      <FilterModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onApply={(options) => setFilterSortOptions(options)}
          initialOptions={filterSortOptions}
          artistSuggestions={allArtists}
          venueSuggestions={allVenues}
      />
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
    emptyText: { 
        fontSize: 18, 
        color: theme.emptyText, 
        textAlign: 'center' 
    },
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: tokens.spacing.xxl,
        backgroundColor: theme.background, // 背景色を明示
    },
    emptyTitle: {
        ...tokens.typography.title,
        color: theme.text,
        textAlign: 'center',
        marginTop: tokens.spacing.xl,
    },
    emptySubtitle: {
        ...tokens.typography.body,
        fontSize: 15,
        color: theme.subtext,
        textAlign: 'center',
        marginTop: tokens.spacing.s,
        lineHeight: 22,
    },
    emptyButton: {
        marginTop: tokens.spacing.xxl,
        backgroundColor: theme.primary,
        paddingVertical: tokens.spacing.l,
        paddingHorizontal: tokens.spacing.xxl,
        borderRadius: 24,
    },
    emptyButtonText: {
        ...tokens.typography.subtitle,
        color: theme.buttonSelectedText,
        fontWeight: 'bold',
    },
    filterButton: {
      paddingHorizontal: tokens.spacing.m
    },
    fabContainer: {
      position: 'absolute',
      bottom: 30,
      right: 30
    },
    fab: {
      backgroundColor: theme.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    }
});