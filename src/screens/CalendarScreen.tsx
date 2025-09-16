import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { getLives, Live } from '../database/db';
import { RootStackParamList } from '../../App';

LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveDetail'>;

type MarkedDateCustomStyles = {
    customStyles: {
        container: { backgroundColor: string };
        text: { color: string; fontWeight: 'bold' };
    };
};

export const CalendarScreen = () => {
    const [lives, setLives] = useState<Live[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation<CalendarScreenNavigationProp>();

    useFocusEffect(
        useCallback(() => {
            const loadLivesForCalendar = async () => {
                setIsLoading(true);
                const allLives = await getLives({});
                setLives(allLives);
                setIsLoading(false);
            };
            loadLivesForCalendar();
        }, [])
    );

    const markedDates = useMemo(() => {
        const marks: { [key: string]: MarkedDateCustomStyles } = {};
        lives.forEach(live => {
            marks[live.liveDate] = {
                customStyles: {
                    container: {
                        backgroundColor: '#eef2ff',
                    },
                    text: {
                        color: '#4338ca',
                        fontWeight: 'bold',
                    },
                },
            };
        });
        return marks;
    }, [lives]);

    const livesOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return lives.filter(live => live.liveDate === selectedDate);
    }, [selectedDate, lives]);
    

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    const renderLiveItem = ({ item }: { item: Live }) => (
        <TouchableOpacity 
            style={styles.liveItem}
            onPress={() => navigation.navigate('LiveDetail', { liveId: item.id })}
        >
            <Text style={styles.liveItemTitle}>{item.liveName}</Text>
            <Text style={styles.liveItemArtist}>{item.artistName}</Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <Calendar
                markedDates={markedDates}
                onDayPress={onDayPress}
                markingType={'custom'}
                monthFormat={'yyyy年 M月'}
                theme={{
                    selectedDayBackgroundColor: '#007aff',
                    todayTextColor: '#007aff',
                    arrowColor: '#007aff',
                }}
            />
            <View style={styles.listContainer}>
                {livesOnSelectedDate.length > 0 ? (
                    <FlatList
                        data={livesOnSelectedDate}
                        renderItem={renderLiveItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                ) : (
                    <View style={styles.centered}>
                        <Text style={styles.noDataText}>
                            {selectedDate ? 'この日のライブ記録はありません' : 'カレンダーの日付を選択してください'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    liveItem: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    liveItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    liveItemArtist: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    noDataText: {
        color: '#888',
        fontSize: 16,
    },
});