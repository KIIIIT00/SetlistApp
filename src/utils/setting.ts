import AsyncStorage from '@react-native-async-storage/async-storage';

const RANKING_LIMIT_KEY = 'ranking_limit';
const DEFAULT_LIMIT = 5;

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