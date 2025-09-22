import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getLivesByVenue, Live } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';
import { RootStackParamList } from '../../App';
import { LiveListItem } from '../components/LiveListItem';

type VenueDetailScreenRouteProp = RouteProp<RootStackParamList, 'VenueDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VenueDetail'>;

export const VenueDetailScreen = () => {
    const route = useRoute<VenueDetailScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { venueName } = route.params;

    const [lives, setLives] = useState<Live[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const loadLives = useCallback(async () => {
        setIsLoading(true);
        try {
            const venueLives = await getLivesByVenue(venueName);
            setLives(venueLives);
        } catch (error) {
            console.error("会場のライブ履歴読み込みに失敗:", error);
        } finally {
            setIsLoading(false);
        }
    }, [venueName]);

    useFocusEffect(
        useCallback(() => {
            loadLives();
        }, [loadLives])
    );

    const handleLivePress = (liveId: number) => {
        navigation.navigate('LiveDetail', { liveId });
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (lives.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>この会場でのライブ記録はありません</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={lives}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <LiveListItem
                    live={item}
                    onPress={() => handleLivePress(item.id)}
                />
            )}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    listContainer: {
        padding: tokens.spacing.m,
    },
    emptyText: {
        fontSize: 18,
        color: theme.emptyText,
        textAlign: 'center',
    },
});