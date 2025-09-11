import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LiveForm } from '../components/LiveForm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Live, getLiveById } from '../database/db';
import { useHeaderHeight } from '@react-navigation/elements';

type AddLiveScreenProps = NativeStackScreenProps<RootStackParamList, 'AddLive'>;

export const AddLiveScreen = ({ route, navigation }: AddLiveScreenProps) => {
  const liveId = route.params?.liveId;
  const [initialData, setInitialData] = useState<Live | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const headerHeight = useHeaderHeight();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <LiveForm
          initialData={initialData}
          onSave={() => navigation.goBack()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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