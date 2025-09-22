import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { initDatabase } from './src/database/db';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { navigationLightTheme, navigationDarkTheme } from './src/theme';

import { LiveListScreen } from './src/screens/LiveListScreen';
import { AddLiveScreen } from './src/screens/AddLiveScreen';
import { LiveDetailScreen } from './src/screens/LiveDetailScreen';
import { EditSetlistScreen } from './src/screens/EditSetlistScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MemoDetailScreen } from './src/screens/MemoDetailScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { GraphScreen } from './src/screens/GraphScreen';
import { ArtistSongScreen } from './src/screens/ArtistSongScreen';
import { VenueDetailScreen } from './src/screens/VenueDetail';
import { HowToUseScreen } from './src/screens/HowToUseScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { checkOnboardingStatus, setOnboardingComplete } from './src/utils/onboarding'; 

export type RootStackParamList = {
    LiveList: undefined;
    AddLive: { liveId?: number };
    LiveDetail: { liveId: number };
    AddSong: { liveId: number };
    EditSetlist: { liveId: number; artistName?: string; };
    Settings: undefined;
    MemoDetail: {liveId: number};
    Stats: undefined;
    Graph: undefined;
    ArtistSongs: { artistName: string };
    Calendar: undefined;
    VenueDetail: { venueName: string };
    HowToUse: undefined;
    Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { isDarkMode, theme } = useTheme();

    return (
        <NavigationContainer theme={isDarkMode ? navigationDarkTheme : navigationLightTheme}>
            <Stack.Navigator
                initialRouteName="LiveList"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.card,
                    },
                    headerTintColor: theme.text,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: theme.background,
                    }
                }}
            >
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
                options={{ title: 'ライブ詳細' }} />
                <Stack.Screen 
                name="EditSetlist" 
                component={EditSetlistScreen} 
                options={{ title: 'セットリストを編集' }} />
                <Stack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: '設定' }} />
                <Stack.Screen 
                name="MemoDetail" 
                component={MemoDetailScreen} 
                options={{ title: '感想メモ' }} />
                <Stack.Screen 
                name="Stats" 
                component={StatsScreen} 
                options={{ title: '統計・分析' }} />
                <Stack.Screen
                    name="Graph"
                    component={GraphScreen}
                    options={{ title: 'グラフ分析' }}
                />
                <Stack.Screen
                    name="ArtistSongs"
                    component={ArtistSongScreen}
                    options={({ route }) => ({ title: `${route.params.artistName}の楽曲分析` })}
                />
                <Stack.Screen
                    name="VenueDetail"
                    component={VenueDetailScreen}
                    options={({ route }) => ({ title: route.params.venueName })}
                />
                <Stack.Screen
                    name="HowToUse"
                    component={HowToUseScreen}
                    options={{ title: 'アプリの使い方' }}
                />
                <Stack.Screen 
                  name="Calendar" 
                  component={CalendarScreen} 
                  options={{ title: 'カレンダー' }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};


export default function App() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const prepareApp = async () => {
            try {
                await initDatabase();
                setDbInitialized(true);

                const hasCompleted = await checkOnboardingStatus();
                setHasCompletedOnboarding(hasCompleted);
            } catch (e) {
                console.warn(e);
            }
        };
        prepareApp();
    }, []);

    const handleOnboardingComplete = async () => {
        await setOnboardingComplete();
        setHasCompletedOnboarding(true);
    };

    if (!dbInitialized || hasCompletedOnboarding === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>準備中...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                {hasCompletedOnboarding ? (
                    <AppNavigator />
                ) : (
                    <OnboardingScreen onComplete={handleOnboardingComplete} />
                )}
                <Toast />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    }
});