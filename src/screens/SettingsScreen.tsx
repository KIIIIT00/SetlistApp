import React from 'react';
import { View, Button, StyleSheet, Alert} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllDataForExport } from '../database/db';

export const SettingsScreen = () => {
    const handleExport = async () => {
        try {
            // データベースから全データを取得
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
            <View style={styles.buttonContainer}>
                <Button title="全データをエクスポート" onPress={handleExport} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
  }
});