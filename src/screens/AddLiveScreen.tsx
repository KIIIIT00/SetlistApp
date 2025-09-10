import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LiveForm } from '../components/LiveForm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Live, getLiveById } from '../database/db';

// スクリーンが受け取るprops全体の型を定義
type AddLiveScreenProps = NativeStackScreenProps<RootStackParamList, 'AddLive'>;

export const AddLiveScreen = ({ route, navigation }: AddLiveScreenProps) => {
  const liveId = route.params?.liveId;

  const [initialData, setInitialData] = useState<Live | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: liveId ? 'ライブ情報を編集' : '新しいライブを記録',
    });

    if (liveId) {
      const loadLive = async () => {
        const data = await getLiveById(liveId);
        if (data) { setInitialData(data); }
        setIsLoading(false);
      };
      loadLive();
    } else {
      setIsLoading(false);
    }
  }, [liveId, navigation]);

  if (isLoading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" /></View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      extraScrollHeight={30} 
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <LiveForm
        initialData={initialData}
        onSave={() => navigation.goBack()}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});