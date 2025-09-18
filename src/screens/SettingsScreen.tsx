import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { saveRankingLimit, loadRankingLimit, ThemePreference } from '../utils/setting';
import { useTheme } from '../context/ThemeContext';
import { tokens, AppTheme } from '../theme';

export const SettingsScreen = () => {
    const { theme, themePreference, setThemePreference } = useTheme();
    const styles = createStyles(theme);
    const [rankingLimit, setRankingLimit] = React.useState(5);

    useFocusEffect(
        React.useCallback(() => {
            const loadSettings = async () => {
                const limit = await loadRankingLimit();
                setRankingLimit(limit);
            };
            loadSettings();
        }, [])
    );

    const handleLimitChange = async (newLimit: number) => {
        setRankingLimit(newLimit);
        await saveRankingLimit(newLimit);
        Toast.show({
            type: 'success',
            text1: '設定を保存しました',
            text2: `ランキングが上位${newLimit}件まで表示されます。`,
        });
    };
    
    const handleThemeChange = (newTheme: ThemePreference) => {
        setThemePreference(newTheme);
        Toast.show({
            type: 'success',
            text1: 'テーマを変更しました',
        });
    };

return (
        <View style={styles.container}>
            {/* テーマ設定 */}
            <View style={styles.settingItem}>
                <Text style={styles.label}>テーマ設定</Text>
                <View style={[styles.optionsContainer, { justifyContent: 'space-around' }]}>
                    {(['light', 'dark'] as ThemePreference[]).map((t) => {
                        const isSelected = themePreference === t;
                        const iconColor = isSelected ? theme.buttonSelectedText : theme.buttonText;

                        return (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.optionButtonSelected,
                                ]}
                                onPress={() => handleThemeChange(t)}
                            >
                                <View style={styles.optionButtonContent}>
                                    <Ionicons
                                        name={t === 'light' ? 'sunny-outline' : 'moon-outline'}
                                        size={22}
                                        color={iconColor}
                                    />
                                    <Text
                                        style={[
                                            styles.optionText,
                                            isSelected && styles.optionTextSelected,
                                        ]}
                                    >
                                        {t === 'light' ? 'ライト' : 'ダーク'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            

            <View style={styles.settingItem}>
                <Text style={styles.label}>ランキングの表示件数</Text>
                <View style={styles.optionsContainer}>
                    {[3, 5, 10, 20].map((limit) => (
                        <TouchableOpacity
                            key={limit}
                            style={[
                                styles.optionButton,
                                rankingLimit === limit && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleLimitChange(limit)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    rankingLimit === limit && styles.optionTextSelected,
                                ]}
                            >
                                TOP {limit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};
const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: tokens.spacing.xxl,
    },
    settingItem: {
        backgroundColor: theme.card,
        padding: tokens.spacing.xl,
        marginBottom: tokens.spacing.xl,
    },
    label: {
        fontSize: tokens.typography.subtitle.fontSize,
        fontWeight: 'bold',
        marginBottom: tokens.spacing.l,
        color: theme.text,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    optionButton: {
        paddingVertical: tokens.spacing.m,
        paddingHorizontal: tokens.spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionButtonSelected: {
        backgroundColor: theme.buttonSelected,
    },
    optionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        color: theme.buttonText,
        fontSize: 16,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: theme.buttonSelectedText,
    },
});