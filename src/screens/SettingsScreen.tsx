import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllDataForExport } from '../database/db';
import { saveRankingLimit, loadRankingLimit } from '../utils/setting';
import Toast from 'react-native-toast-message';

export const SettingsScreen = () => {
    const [rankingLimit, setRankingLimit] = useState(5);

    useFocusEffect(
        useCallback(() => {
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

    const handleExport = async () => {
        try {
            const data = await getAllDataForExport();
            const jsonString = JSON.stringify(data, null, 2);
            const fileUri = FileSystem.cacheDirectory + 'setlist_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, jsonString);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('エラー', 'このデバイスでは共有機能を利用できません。');
                return;
            }
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error(error);
            Alert.alert('エクスポート失敗', 'データのエクスポート中にエラーが発生しました。');
        }
    };

    return (
        <View style={styles.container}>
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

            <View style={styles.settingItem}>
                <Text style={styles.label}>データ管理</Text>
                <Button title="全データをエクスポート" onPress={handleExport} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 20,
    },
    settingItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20, 
        borderWidth: 1,
        borderColor: '#007aff',
    },
    optionButtonSelected: {
        backgroundColor: '#007aff',
    },
    optionText: {
        color: '#007aff',
        fontSize: 16,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#fff',
    },
});