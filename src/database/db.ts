import * as SQLite from 'expo-sqlite';

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

const db = SQLite.openDatabaseSync('setlist.db');

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
};

/**
 * 新しいライブ情報をlivesテーブルに保存する
 * @param live 保存するライブ情報
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const addLive = async (live: Omit<Live, 'id'>): Promise<SQLite.SQLiteRunResult> => {
  return await db.runAsync(
    'INSERT INTO lives (liveName, liveDate, venueName, artistName, imagePath, tags) VALUES (?, ?, ?, ?, ?, ?);',
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
 * 保存されているライブ情報を取得する（検索・フィルター機能付き）
 * @param options 検索とフィルターのオプション
 * @returns Promise<Live[]>
 */
export const getLives = async (options: {
  searchQuery?: string;
  artistFilter?: string;
  yearFilter?: string;
}): Promise<Live[]> => {
  let query = 'SELECT * FROM lives';
  const conditions: string[] = [];
  const params: string[] = [];

  // 検索クエリによる絞り込み
  if (options.searchQuery && options.searchQuery.trim() !== '') {
    conditions.push('(liveName LIKE ? OR artistName LIKE ? OR venueName LIKE ? OR tags LIKE ?)');
    const fuzzyQuery = `%${options.searchQuery.trim()}%`;
    params.push(fuzzyQuery, fuzzyQuery, fuzzyQuery, fuzzyQuery);
  }

  // アーティスト名による絞り込み
  if (options.artistFilter && options.artistFilter.trim() !== '') {
    conditions.push('artistName = ?');
    params.push(options.artistFilter.trim());
  }
  
  // 年による絞り込み
  if (options.yearFilter && options.yearFilter.trim() !== '') {
    conditions.push("strftime('%Y', liveDate) = ?");
    params.push(options.yearFilter.trim());
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY liveDate DESC;';
  
  return await db.getAllAsync<Live>(query, ...params);
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
  return db.runAsync(
    'UPDATE lives SET liveName = ?, liveDate = ?, venueName = ?, artistName = ?, imagePath = ?, tags = ? WHERE id = ?;',
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
 * 登録されているすべてのユニークな会場名を取得する
 */
export const getDistinctVenues = async (): Promise<string[]> => {
  const result = await db.getAllAsync<{ venueName: string}>('SELECT DISTINCT venueName FROM lives WHERE venueName IS NOT NULL AND venueName != "";');
  return result.map(item => item.venueName);
};

/**
 * 登録されているすべてのユニークなアーティスト名を取得する
 */
export const getDistinctArtists = async (): Promise<string[]> => {
  const result = await db.getAllAsync<{ artistName: string }>('SELECT DISTINCT artistName FROM lives WHERE artistName IS NOT NULL AND artistName != "";');
  return result.map(item => item.artistName);
};

/**
 * 登録されているすべてのユニークなタグを取得する
 */
export const getDistinctTags = async (): Promise<string[]> => {
  const result = await db.getAllAsync<{ tags: string }>('SELECT tags FROM lives WHERE tags IS NOT NULL AND tags != "";');
  const allTags = new Set<string>();
  result.forEach(row => {
    row.tags.split(',').forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) allTags.add(trimmed);
    });
  });
  return Array.from(allTags);
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