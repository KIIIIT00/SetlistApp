import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@hasCompletedOnboarding';

/**
 * オンボーディングが完了したかどうかの状態を確認する
 * @returns {Promise<boolean>} 完了していればtrue, そうでなければfalse
 */
export const checkOnboardingStatus = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value !== null; 
    } catch (e) {
        console.error('Failed to check onboarding status', e);
        return false;
    }
};

/**
 * オンボーディングを完了した状態を保存する
 */
export const setOnboardingComplete = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
        console.error('Failed to set onboarding status', e);
    }
};