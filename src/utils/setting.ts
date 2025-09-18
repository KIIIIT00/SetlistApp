import AsyncStorage from '@react-native-async-storage/async-storage';

const RANKING_LIMIT_KEY = 'ranking_limit';
const DEFAULT_LIMIT = 5;
const THEME_KEY = 'theme_preference';
export type ThemePreference = 'light' | 'dark';

/**
 * @function saveRankingLimit
 * @description ランキングの表示件数を保存する
 * @param {number} limit - 保存する件数
 * @returns {Promise<void>}
 */
export const saveRankingLimit = async (limit: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(RANKING_LIMIT_KEY, String(limit));
  } catch (e) {
    console.error('Failed to save ranking limit.', e);
  }
};

/**
 * @function loadRankingLimit
 * @description 保存されているランキングの表示件数を読み込む
 * @returns {Promise<number>} 保存されている件数。なければデフォルト値(5)を返す。
 */
export const loadRankingLimit = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(RANKING_LIMIT_KEY);
    if (value !== null) {
      return parseInt(value, 10);
    }
    return DEFAULT_LIMIT;
  } catch (e) {
    console.error('Failed to load ranking limit.', e);
    return DEFAULT_LIMIT;
  }
};

/**
 * @function saveThemePreference
 * @description テーマ設定（light/dark）を保存する
 * @param {ThemePreference} theme - 保存するテーマ
 * @returns {Promise<void>}
 */
export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme preference.', e);
  }
};

/**
 * @function loadThemePreference
 * @description 保存されているテーマ設定を読み込む
 * @returns {Promise<ThemePreference>} 保存されている設定。なければ'light'を返す。
 */
export const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    // 'system'のチェックを削除
    if (value === 'light' || value === 'dark') {
      return value;
    }
    return 'light'; // デフォルトを'light'に変更
  } catch (e) {
    console.error('Failed to load theme preference.', e);
    return 'light'; // デフォルトを'light'に変更
  }
};