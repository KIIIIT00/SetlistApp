import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { getLives, Live } from '../database/db';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

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

    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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
                        backgroundColor: theme.tagBackground,
                    },
                    text: {
                        color: theme.tagText,
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
                    selectedDayBackgroundColor: theme.primary,
                    todayTextColor: theme.primary,
                    arrowColor: theme.primary,
                    textSectionTitleColor: theme.subtext,
                    backgroundColor: theme.card,
                    calendarBackground: theme.card,
                    monthTextColor: theme.text,
                    textMonthFontWeight: 'bold',
                    dayTextColor: theme.text
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: theme.separator,
    },
    liveItem: {
        backgroundColor: theme.card,
        paddingVertical: tokens.spacing.l,
        paddingHorizontal: tokens.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.inputBackground,
        color: theme.text,
    },
    liveItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.text,
    },
    liveItemArtist: {
        fontSize: 14,
        color: theme.subtext,
        marginTop: tokens.spacing.xs,
    },
    noDataText: {
        color: theme.emptyText,
        fontSize: 16,
    },
});