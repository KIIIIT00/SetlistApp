import * as SQLite from 'expo-sqlite';
import { FilterSortOptions } from '../components/FilterModal';

// --- 型定義 ---
export interface Live {
  id: number;
  liveName: string;
  liveDate: string;
  venueName?: string;
  artistName?: string;
  imagePath?: string;
  tags?: string;
  rating?: number;
  memo?: string;
}

export interface Setlist {
  id: number;
  liveId: number;
  trackNumber: number;
  songName: string;
  memo?: string;
  type: 'song' | 'header';
}

/**
 * @typedef {object} SongStatItem
 * @description 曲ごとの演奏回数
 * @property {string} name - 曲名
 * @property {number} count - 演奏回数
 */
export type SongStatItem = {
  name: string;
  count: number;
};

type GetLivesParams = {
    filterSortOptions?: FilterSortOptions;
};

const db = SQLite.openDatabaseSync('setlist_v2.db');

// --- データベース初期化関数 ---
export const initDatabase = async (): Promise<void> => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS lives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      liveName TEXT NOT NULL,
      liveDate TEXT NOT NULL,
      venueName TEXT,
      artistName TEXT,
      imagePath TEXT,
      tags TEXT,
      rating INTEGER,
      memo TEXT
    );

    CREATE TABLE IF NOT EXISTS setlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      liveId INTEGER NOT NULL,
      trackNumber INTEGER NOT NULL,
      songName TEXT NOT NULL,
      memo TEXT,
      type TEXT NOT NULL DEFAULT 'song',
      FOREIGN KEY (liveId) REFERENCES lives (id) ON DELETE CASCADE
    );
  `);
  try {
    await db.execAsync('ALTER TABLE lives ADD COLUMN rating INTEGER;');
    await db.execAsync('ALTER TABLE lives ADD COLUMN memo TEXT;');
    console.log('Columns "rating" and "memo" added.');
  } catch (e){
    console.log('Columns already exist, skipping');
  }
  console.log('Database initialized successfully.');

  console.log("--- 現在の'lives'テーブルの構造を確認 ---");
  const schema = await db.getAllAsync<{ name: string, type: string }>(`PRAGMA table_info(lives);`);
  console.log(schema.map(col => `${col.name} (${col.type})`).join(', '));
  console.log("------------------------------------");
};

/**
 * 新しいライブ情報をlivesテーブルに保存する
 * @param live 保存するライブ情報
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const addLive = async (live: Omit<Live, 'id'>): Promise<SQLite.SQLiteRunResult> => {
  return await db.runAsync(
    'INSERT INTO lives (liveName, liveDate, venueName, artistName, imagePath, tags, rating, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    live.liveName,
    live.liveDate,
    live.venueName || null,
    live.artistName || null,
    live.imagePath || null,
    live.tags || null,
    live.rating || null,
    live.memo || null
  );
};

/**
 *  すべてのライブ情報を取得する
 *  フィルタリングとソートのオプションを指定可能
 * @param filterSortOptions フィルタリングとソートのオプション
 * @returns 
 */
export const getLives = async ({ filterSortOptions }: GetLivesParams): Promise<Live[]> => {
    let query = `SELECT * FROM lives`;
    const params: (string | number)[] = [];

    const whereClauses: string[] = [];

    if (filterSortOptions) {
        // 評価による絞り込み
        if (filterSortOptions.minRating && filterSortOptions.minRating > 0) {
            whereClauses.push(`rating >= ?`);
            params.push(filterSortOptions.minRating);
        }
        // アーティスト名による絞り込み (部分一致)
        if (filterSortOptions.artist && filterSortOptions.artist.trim() !== '') {
            whereClauses.push(`artistName LIKE ?`);
            params.push(`%${filterSortOptions.artist.trim()}%`);
        }
        // 年による絞り込み (完全一致、4桁)
        if (filterSortOptions.year && filterSortOptions.year.trim().length === 4) {
            whereClauses.push(`strftime('%Y', liveDate) = ?`);
            params.push(filterSortOptions.year.trim());
        }
        // 会場名による絞り込み (部分一致)
        if (filterSortOptions.venue && filterSortOptions.venue.trim() !== '') {
            whereClauses.push(`venueName LIKE ?`);
            params.push(`%${filterSortOptions.venue.trim()}%`);
        }
        // タグによる絞り込み (部分一致)
        if (filterSortOptions.tag && filterSortOptions.tag.trim() !== '') {
            // カンマ区切りの文字列のいずれかに一致するかどうかをチェック
            whereClauses.push(`(',' || tags || ',' LIKE ?)`);
            params.push(`%,${filterSortOptions.tag.trim()},%`);
        }
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(' AND ');
    }

    // --- 並べ替え条件の構築 (ORDER BY句) ---
    if (filterSortOptions && filterSortOptions.sortKey) {
        // sortKeyが安全な値かチェック
        const validSortKeys = ['liveDate', 'artistName', 'rating', 'venueName'];
        if (validSortKeys.includes(filterSortOptions.sortKey)) {
            const order = filterSortOptions.sortOrder === 'ASC' ? 'ASC' : 'DESC';
            // 日本語の並べ替えに対応するためCOLLATE NOCASEを使用
            const sortColumn = filterSortOptions.sortKey === 'artistName' || filterSortOptions.sortKey === 'venueName'
                ? `${filterSortOptions.sortKey} COLLATE NOCASE`
                : filterSortOptions.sortKey;
            
            query += ` ORDER BY ${sortColumn} ${order}`;
        }
    } else {
        // デフォルトの並べ替え順
        query += ` ORDER BY liveDate DESC`;
    }

    // --- クエリ実行 ---
    try {
        const result = await db.getAllAsync<Live>(query, params);
        return result;
    } catch (error) {
        console.error("Failed to get lives from DB", error);
        throw error; // エラーを呼び出し元に伝える
    }
};

/**
 * IDを指定して単一のライブ情報を取得する
 * @param id 取得するライブのID
 * @returns Promise<Live | null>
 */
export const getLiveById = async (id: number): Promise<Live | null> => {
  return await db.getFirstAsync<Live>('SELECT * FROM lives WHERE id = ?;', id);
};

/**
 * 指定したライブIDに紐づくセットリストをすべて取得する
 * @param liveId ライブのID
 * @returns Promise<Setlist[]>
 */
export const getSetlistsForLive = async (liveId: number): Promise<Setlist[]> => {
  return await db.getAllAsync<Setlist>(
    'SELECT * FROM setlists WHERE liveId = ? ORDER BY trackNumber ASC;', 
    liveId
  );
};

/**
 * IDを指定してライブ情報を削除する
 * @param id 削除するライブのID
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const deleteLive = async (id: number): Promise<SQLite.SQLiteRunResult> => {
  return await db.runAsync('DELETE FROM lives WHERE id = ?;', id);
};

/**
 * IDを指定してライブ情報を更新する
 * @param live 更新するライブ情報（IDを含む）
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const updateLive = async (live: Live): Promise<SQLite.SQLiteRunResult> => {
  console.log("--- updateLive: 更新するデータ ---");
  console.log(live);
  console.log("-------------------------------");
  return db.runAsync(
    'UPDATE lives SET liveName = ?, liveDate = ?, venueName = ?, artistName = ?, imagePath = ?, tags = ?, rating = ?, memo = ? WHERE id = ?;',
    live.liveName,
    live.liveDate,
    live.venueName || null,
    live.artistName || null,
    live.imagePath || null,
    live.tags || null,
    live.rating || null,
    live.memo || null,
    live.id
  );
};

/**
 * 新しい曲をセットリストに追加する
 * @param item 追加するセットリストの項目
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const addSetlistItem = async (
  item: Omit<Setlist, 'id'>
): Promise<SQLite.SQLiteRunResult> => {
  return db.runAsync(
    'INSERT INTO setlists (liveId, trackNumber, songName, memo) VALUES (?, ?, ?, ?);',
    item.liveId,
    item.trackNumber,
    item.songName,
    item.memo || null
  );
};

/**
 * 指定したライブのセットリストを一度に更新する
 * @param liveId 更新するライブのID
 * @param setlist 新しいセットリストの配列
 */
export const updateSetlistForLive = async (
  liveId: number,
  setlist: Omit<Setlist, 'id' | 'liveId'>[]
): Promise<void> => {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM setlists WHERE liveId = ?;', liveId);

    for (const item of setlist) {
      await db.runAsync(
        'INSERT INTO setlists (liveId, trackNumber, songName, memo, type) VALUES (?, ?, ?, ?, ?);',
        liveId,
        item.trackNumber,
        item.songName,
        item.memo || null,
        item.type
      );
    }
  });
};

/*
* すべてのライブとセットリストをエクスポート用に取得する
*/
export const getAllDataForExport = async () => {
  const lives = await db.getAllAsync<Live>('SELECT * FROM lives;');
  const setlists = await db.getAllAsync<Setlist>('SELECT * FROM setlists;');
  return {
    lives,
    setlists,
  };
};

/**
 * @function getDistinctVenues
 * @description 登録されている全てのユニークな会場名を取得する
 * @returns {Promise<string[]>}
 */
export const getDistinctVenues = async (): Promise<string[]> => {
    try {
        const result = await db.getAllAsync<{ venueName: string }>(
            `SELECT DISTINCT venueName FROM lives WHERE venueName IS NOT NULL AND venueName != '' ORDER BY venueName COLLATE NOCASE ASC`
        );
        return result.map(item => item.venueName);
    } catch (error) {
        console.error("Failed to get distinct venues", error);
        return [];
    }
};

/**
 * @function getDistinctArtists
 * @description 登録されている全てのユニークなアーティスト名を取得する
 * @returns {Promise<string[]>}
 */
export const getDistinctArtists = async (): Promise<string[]> => {
    try {
        const result = await db.getAllAsync<{ artistName: string }>(
            `SELECT DISTINCT artistName FROM lives WHERE artistName IS NOT NULL AND artistName != '' ORDER BY artistName COLLATE NOCASE ASC`
        );
        return result.map(item => item.artistName);
    } catch (error) {
        console.error("Failed to get distinct artists", error);
        return [];
    }
};

/**
 * @function getDistinctTags
 * @description 登録されている全てのユニークなタグを取得する
 * @returns {Promise<string[]>}
 */
export const getDistinctTags = async (): Promise<string[]> => {
  try {
    const result = await db.getAllAsync<{ tags: string }>('SELECT tags FROM lives WHERE tags IS NOT NULL AND tags != "";');
    const allTags = new Set<string>();
    result.forEach(row => {
      row.tags.split(',').forEach(tag => {
        const trimmed = tag.trim();
        if (trimmed) allTags.add(trimmed);
      });
    });
    return Array.from(allTags).sort();
  } catch (error) {
    console.error("Failed to get distinct tags", error);
    return [];
  }
};

/**
 * 指定したアーティストの過去の曲名をすべて取得する
 * @param artistName アーティスト名
 */
export const getSongsByArtist = async (artistName: string): Promise<string[]> => {
  const result = await db.getAllAsync<{ songName: string }>(
    `SELECT DISTINCT T2.songName 
     FROM lives AS T1 
     INNER JOIN setlists AS T2 ON T1.id = T2.liveId 
     WHERE T1.artistName = ? AND T2.type = 'song';`,
    artistName 
  );
  return result.map(item => item.songName);
};

/**
 * 指定されたIDのライブとセットリストを複製（コピー）する
 * @param originalLiveId 複製元のライブID
 * @returns 新しく作成されたライブのID
 */
export const duplicateLiveById = async (originalLiveId: number): Promise<number | null> => {
  try {
    const originalLive = await db.getFirstAsync<Live>(
      'SELECT * FROM lives WHERE id = ?;',
      originalLiveId
    );

    if (!originalLive) {
      console.error("複製元のライブが見つかりません。");
      return null;
    }

    const newLiveDate = new Date().toISOString().split('T')[0]; // 今日の日付
    const result = await db.runAsync(
      'INSERT INTO lives (artistName, liveName, venueName, liveDate, memo, rating, imagePath, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [
        originalLive.artistName || null,
        originalLive.liveName,
        originalLive.venueName || null,
        newLiveDate,
        '',        
        0,          
        null,      
        originalLive.tags || null,
      ]
    );
    const newLiveId = result.lastInsertRowId;

    const originalSetlist = await db.getAllAsync<Setlist>(
      'SELECT * FROM setlists WHERE liveId = ? ORDER BY trackNumber ASC;',
      originalLiveId
    );

    if (originalSetlist.length > 0) {
      const valuesPlaceholder = originalSetlist.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const params = originalSetlist.flatMap(song => [
        newLiveId,
        song.trackNumber,
        song.songName,
        song.memo || null,
        song.type
      ]);
      
      await db.runAsync(
        `INSERT INTO setlists (liveId, trackNumber, songName, memo, type) VALUES ${valuesPlaceholder};`,
        params
      );
    }

    console.log(`ライブID:${originalLiveId} を複製し、新しいライブID:${newLiveId} を作成しました。`);
    return newLiveId;

  } catch (e) {
    console.error("ライブの複製に失敗しました。", e);
    return null;
  }
};

// 統計・分析機能用の関数
/**
 * @typedef {object} RankingItem
 * @description ランキングの各項目を表す型
 * @property {string} name - 項目名（アーティスト名，会場名，曲名など）
 * @property {number} count - 公演数
 */
export type RankingItem = {
  name: string;
  count: number;
};

/**
 * @function getArtistRankings
 * @description アーティスト別のライブ参加回数ランキングを取得する
 * @param {number} [limit=5] - 上位何件まで取得するか（任意）
 * @returns {Promise<RankingItem[]>} ランキングデータの配列
 */
export const getArtistRankings = async (limit: number = 5): Promise<RankingItem[]> => {
  const query = `
    SELECT artistName as name, COUNT(id) as count
    FROM lives
    WHERE artistName IS NOT NULL AND artistName != ''
    GROUP BY artistName
    ORDER BY count DESC
    LIMIT ?;
  `;
  return await db.getAllAsync<RankingItem>(query, limit);
};

/**
 * @function getVenueRankings
 * @description 会場別のライブ参加回数ランキングを取得する．
 * @param {number} [limit=5] - 上位何件まで取得するか（任意）
 * @returns {Promise<RankingItem[]>} ランキングデータの配列
 */
export const getVenueRankings = async (limit: number = 5): Promise<RankingItem[]> => {
  const query = `
    SELECT venueName as name, COUNT(id) as count
    FROM lives
    WHERE venueName IS NOT NULL AND venueName != ''
    GROUP BY venueName
    ORDER BY count DESC
    LIMIT ?;
  `;
  return await db.getAllAsync<RankingItem>(query, limit);
};

/**
 * @function getSongRankings
 * @description 全ライブを通して，最も多く演奏された曲のランキングを取得する．
 * @param {number} [limit=10] - 上位何件まで取得するか（任意）
 * @returns {Promise<RankingItem[]>} ランキングデータの配列
 */
export const getSongRankings = async (limit: number = 10): Promise<RankingItem[]> => {
  const query = `
    SELECT songName as name, COUNT(id) as count
    FROM setlists
    WHERE type = 'song'
    GROUP BY songName
    ORDER BY count DESC
    LIMIT ?;
  `;
  return await db.getAllAsync<RankingItem>(query, limit);
};

/**
 * @function getSongRankingsByArtist
 * @description 特定のアーティストに絞って、最も多く演奏された曲のランキングを取得する。
 * @param {string} artistName - 対象のアーティスト名
 * @param {number} [limit=10] - 上位何件まで取得するか (任意)
 * @returns {Promise<RankingItem[]>} ランキングデータの配列
 */
export const getSongRankingsByArtist = async (artistName: string, limit: number = 10): Promise<RankingItem[]> => {
  if (!artistName) return [];
  const query = `
    SELECT s.songName as name, COUNT(s.id) as count
    FROM setlists s
    JOIN lives l ON s.liveId = l.id
    WHERE l.artistName = ? AND s.type = 'song'
    GROUP BY s.songName
    ORDER BY count DESC
    LIMIT ?;
  `;
  return await db.getAllAsync<RankingItem>(query, artistName, limit);
};

/**
 * @typedef {object} StatsSummary
 * @description あなたのライブ記録のサマリー
 * @property {number} totalLives - 通算ライブ参加数
 * @property {number} averageRating - 評価の平均値 (小数点第一位まで)
 */
export type StatsSummary = {
  totalLives: number;
  averageRating: number;
};

/**
 * @function getStatsSummary
 * @description ライブ参加数や平均評価などのサマリー情報を取得する。
 * @returns {Promise<StatsSummary>}
 */
export const getStatsSummary = async (): Promise<StatsSummary> => {
    const totalResult = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(id) as total FROM lives;`
    );

    const ratingResult = await db.getFirstAsync<{ avg_rating: number }> (
        `SELECT AVG(rating) as avg_rating FROM lives WHERE rating > 0;`
    );

    return {
        totalLives: totalResult?.total || 0,
        averageRating: parseFloat(ratingResult?.avg_rating?.toFixed(1) || '0.0')
    };
};

/**
 * @typedef {object} YearlyActivity
 * @description 年別のライブ参加記録
 * @property {string} year - 年
 * @property {number} count - その年の参加回数
 */
export type YearlyActivity = {
    year: string;
    count: number;
};

/**
 * @function getYearlyActivity
 * @description 年別のライブ参加数を取得する。
 * @returns {Promise<YearlyActivity[]>}
 */
export const getYearlyActivity = async (): Promise<YearlyActivity[]> => {
    const query = `
        SELECT strftime('%Y', liveDate) as year, COUNT(id) as count
        FROM lives
        GROUP BY year
        ORDER BY year DESC;
    `;
    return await db.getAllAsync<YearlyActivity>(query);
};

/**
 * @typedef {object} MonthlyActivity
 * @description 指定された年の月別ライブ参加記録
 * @property {string} month - 月 (e.g., "01", "02")
 * @property {number} count - その月の参加回数
 */
export type MonthlyActivity = {
    month: string;
    count: number;
};

/**
 * @function getMonthlyActivity
 * @description 指定された年の月別参加数を取得する
 * @param {string} year - 取得したい年 (e.g., "2025")
 * @returns {Promise<MonthlyActivity[]>}
 */
export const getMonthlyActivity = async (year: string): Promise<MonthlyActivity[]> => {
    try {
        const query = `
            SELECT strftime('%m', liveDate) as month, COUNT(id) as count
            FROM lives
            WHERE strftime('%Y', liveDate) = ?
            GROUP BY month
            ORDER BY month ASC;
        `;
        const result = await db.getAllAsync<MonthlyActivity>(query, [year]);
        return result;
    } catch (error) {
        console.error(`Failed to get monthly activity for year ${year}`, error);
        throw error;
    }
};

/**
 * @function getSongStatsForArtist
 * @description 特定のアーティストの楽曲ごとの演奏回数を取得する
 * @param {string} artistName - アーティスト名
 * @returns {Promise<SongStatItem[]>}
 */
export const getSongStatsForArtist = async (artistName: string): Promise<SongStatItem[]> => {
    try {
        const query = `
            SELECT s.songName as name, COUNT(s.id) as count
            FROM setlists s
            JOIN lives l ON s.liveId = l.id
            WHERE l.artistName = ? AND s.type = 'song' AND s.songName IS NOT NULL AND s.songName != ''
            GROUP BY s.songName
            ORDER BY count DESC, name ASC;
        `;
        const results = await db.getAllAsync<SongStatItem>(query, [artistName]);
        return results;
    } catch (error) {
        console.error(`Failed to get song stats for artist ${artistName}`, error);
        throw error;
    }
};

/**
 * @function getLivesByVenue
 * @description 特定の会場で開催されたライブの一覧を取得する
 * @param {string} venueName - 会場名
 * @returns {Promise<Live[]>}
 */
export const getLivesByVenue = async (venueName: string): Promise<Live[]> => {
    try {
        const query = `
            SELECT *
            FROM lives
            WHERE venueName = ?
            ORDER BY liveDate DESC;
        `;
        const results = await db.getAllAsync<Live>(query, [venueName]);
        return results;
    } catch (error) {
        console.error(`Failed to get lives for venue ${venueName}`, error);
        throw error;
    }
};