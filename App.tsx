import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { LiveListScreen } from './src/screens/LiveListScreen';
import { AddLiveScreen } from './src/screens/AddLiveScreen';
import { LiveDetailScreen } from './src/screens/LiveDetailScreen';
import { AddSongScreen } from './src/screens/AddSongScreen';
import { EditSetlistScreen } from './src/screens/EditSetlistScreen';

export type RootStackParamList = {
  LiveList: undefined;
  AddLive: undefined;
  LiveDetail: { liveId: number };
  AddSong: { liveId: number };
  EditSetlist: { liveId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LiveList">
          <Stack.Screen
            name="LiveList"
            component={LiveListScreen}
            options={{ title: 'ライブ一覧' }}
          />
          <Stack.Screen
            name="AddLive"
            component={AddLiveScreen}
            options={{ title: '新しいライブを記録', presentation: 'modal' }}
          />
          <Stack.Screen
            name="LiveDetail"
            component={LiveDetailScreen}
            options={{ title: 'ライブ詳細' }}
          />
          <Stack.Screen
            name="EditSetlist"
            component={EditSetlistScreen}
            options={{ title: 'セットリストを編集' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}