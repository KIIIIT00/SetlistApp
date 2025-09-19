import React, { useCallback, useState, useLayoutEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList, 
  Button, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { getLiveById, getSetlistsForLive, Live, Setlist, duplicateLiveById, deleteLive } from '../database/db';
import { RootStackParamList } from '../../App';
import { StarRating } from '../components/StarRating';
import { HeaderMenu } from '../components/HeaderMenu';
import { ShareableImage } from '../components/ShareableImage';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type LiveDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveDetail'>;
type LiveDetailScreenRouteProp = RouteProp<RootStackParamList, 'LiveDetail'>;

export const LiveDetailScreen = () => {
  const navigation = useNavigation<LiveDetailScreenNavigationProp>();
  const route = useRoute<LiveDetailScreenRouteProp>();
  const { liveId } = route.params;

  const [live, setLive] = useState<Live | null>(null);
  const [setlist, setSetlist] = useState<Setlist[]>([]);

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const imageRef = useRef<ViewShot>(null);

  const handleCopyLive = async () => {
    Alert.alert(
      "ライブを複製",
      "このライブをコピーして新しい下書きを作成しますか？\n（日付は今日の日付になります）",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "コピーする",
          onPress: async () => {
            const newLiveId = await duplicateLiveById(liveId);
            if (newLiveId) {
              navigation.replace('LiveDetail', { liveId: newLiveId });
            } else {
              Alert.alert('エラー', 'ライブの複製に失敗しました。');
            }
          },
        },
      ]
    );
  };
  
  const handleDelete = () => {
    Alert.alert(
      "ライブの削除",
      "このライブの記録を本当に削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          onPress: async () => {
            const success = await deleteLive(liveId);
            if (success) {
              navigation.goBack();
            } else {
                Alert.alert("エラー", "削除に失敗しました。");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const shareAsText = () => {
    if (!live || !setlist ) return;

    const setlistText = setlist.map(item =>
      item.type === 'header' ? `\n- ${item.songName} -` : `${item.trackNumber}. ${item.songName}`
    ).join('\n');

    let message = `[Live Setlist]\n${live.liveName}\n\n■ Artist: ${live.artistName}\n■ Date: ${live.liveDate}\n■ Venue: ${live.venueName}\n\n- Setlist -\n${setlistText}`;

    if (live.tags) {
      const tagText = live.tags.split(',').map(t => `#${t.trim()}`).join(' ');
      message += `\n\n- Tags -\n${tagText}`;
    }

    if (live.memo) {
      message += `\n\n- Memo -\n${live.memo}`;
    }

    message += `\n\nvia SetlistApp`;
    Share.share({ message });
  };

  const shareAsImage = async () => {
    try {
      if (imageRef.current?.capture) {
        const uri = await imageRef.current.capture();
        await Share.share({ url: uri, title: 'セットリスト' });
      }
    } catch (error) {
      console.error("画像の共有に失敗しました。", error);
      Alert.alert("エラー", "画像の共有に失敗しました。");
    }
  };

  const handleShare = () => {
    Alert.alert(
      "共有方法を選択",
      "どの形式でセットリストを共有しますか？",
      [
        { text: "テキストとして共有", onPress: shareAsText },
        { text: "画像として共有", onPress: shareAsImage },
        { text: "キャンセル", style: "cancel" },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: live ? live.liveName : 'ライブ詳細',
      headerRight: () => (
        <HeaderMenu
          menuItems={[
            {
              text: 'このライブを編集',
              onPress: () => navigation.navigate('AddLive', { liveId }),
            },
            {
              text: 'コピーして新規作成',
              onPress: handleCopyLive,
            },
            {
              text: '共有する',
              onPress: handleShare,
            },
            {
              text: 'このライブを削除',
              onPress: handleDelete,
              isDestructive: true,
            },
          ]}
        />
      ),
    });
  }, [navigation, live, liveId]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const liveData = await getLiveById(liveId);
        const setlistData = await getSetlistsForLive(liveId);
        setLive(liveData);
        setSetlist(setlistData);
      };
      loadData();
    }, [liveId])
  );

  if (!live) {
    return (
      <View style={styles.loadingContainer}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  const renderSetlistItem = ({ item }: { item: Setlist }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.headerItem}>
          <View style={styles.headerLine} />
          <Text style={styles.headerText}>{item.songName.toUpperCase()}</Text>
          <View style={styles.headerLine} />
        </View>
      );
    }
    
    return (
      <View style={styles.setlistItem}>
        <Text style={styles.trackNumber}>{item.trackNumber}.</Text>
        <Text style={styles.songName}>{item.songName}</Text>
      </View>
    );
  };

  return (
    <>
    <View style={{ position: 'absolute', top: -10000, left: 0, right: 0, alignItems: 'center' }}>
        <ViewShot ref={imageRef} options={{ fileName: "setlist", format: "jpg", quality: 0.9 }}>
          <ShareableImage live={live} setlist={setlist} />
        </ViewShot>
      </View>

    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.liveName}>{live.liveName}</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-music" size={18} color={theme.icon} />
          <Text style={styles.detailText}>{live.artistName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-sharp" size={18} color={theme.icon} />
          <Text style={styles.detailText}>{live.venueName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={18} color={theme.icon} />
          <Text style={styles.detailText}>{live.liveDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <StarRating rating={live.rating} size={18} />
        </View>
        {live.tags && (
            <View style={styles.tagsContainer}>
              {live.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
      </View>
      {live.memo && (
        <View style={styles.memoContainer}>
          <Button
            title="感想メモを見る"
            onPress={() => navigation.navigate('MemoDetail', { liveId: live.id })}
          />
        </View>
      )}

      <View style={styles.setlistContainer}>
        <Text style={styles.sectionTitle}>セットリスト</Text>
        {setlist.length === 0 ? (
          <Text style={styles.emptyText}>まだセットリストが登録されていません。</Text>
        ) : (
          <FlatList
            data={setlist}
            renderItem={renderSetlistItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="セットリストを編集"
            onPress={() => navigation.navigate('EditSetlist', { liveId: live.id, artistName: live.artistName })}
          />
        </View>
      </View>
    </ScrollView>
    </>
  );
};


const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  section: {
    backgroundColor: theme.card,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.m,
  },
  image: {
    width: '100%',
    height: 250,
  },
  buttonContainer: {
    marginTop: tokens.spacing.xxl,
    marginBottom: 40,
  },

  header: {
    backgroundColor: theme.card,
    padding: tokens.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  liveName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    ...tokens.typography.title,
    color: theme.text,
    marginBottom: tokens.spacing.l,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.m,
  },
  icon: {
    fontSize: 20,
    color: theme.icon,
    marginRight: tokens.spacing.m,
  },
  detailText: {
    fontSize: 16,
    color: theme.subtext,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: tokens.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.inputBackground,
    paddingTop: tokens.spacing.l,
  },
  tag: {
    backgroundColor: theme.tagBackground,
    borderRadius: 12,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.m,
    marginRight: tokens.spacing.ss,
    marginBottom: tokens.spacing.ss,
  },
  tagText: {
    fontSize: 12,
    color: theme.tagText,
    fontWeight: '500',
  },

  setlistContainer: {
    marginTop: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xxl,
  },
  setlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: tokens.spacing.xl,
    borderRadius: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  songNumber: {
    fontSize: 16,
    color: theme.subtext,
    width: 30,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.subtext,
    marginRight: tokens.spacing.l,
    width: 30,
  },
  songName: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },

  memoContainer: {
    marginTop: tokens.spacing.xl,
    backgroundColor: theme.card,
    paddingHorizontal: tokens.spacing.xxl,
    paddingVertical: tokens.spacing.m,
  },
  memoPreview: {
    ...tokens.typography.body,
    color: theme.subtext,
    lineHeight: 22,
  },
  noDataText: {
    color: theme.subtext,
    paddingVertical: tokens.spacing.m,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.emptyText,
    marginTop: 20,
    fontSize: 16,
  },


  headerItem: {
    paddingVertical: tokens.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  headerText: {
    paddingHorizontal: tokens.spacing.m,
    fontWeight: 'bold',
    color: theme.subtext,
    fontSize: 16,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.separator,
  },
  title: {
    ...tokens.typography.title,
    color: theme.text,
    fontSize: 24,
    marginBottom: tokens.spacing.s,
  },

});