import * as SQLite from 'expo-sqlite';

// --- 型定義 ---
export interface Live {
  id: number;
  liveName: string;
  liveDate: string;
  venueName?: string;
  artistName?: string;
  imagePath?: string;
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
      imagePath TEXT
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
  console.log('Database initialized successfully.');
};

/**
 * 新しいライブ情報をlivesテーブルに保存する
 * @param live 保存するライブ情報
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export const addLive = async (live: Omit<Live, 'id'>): Promise<SQLite.SQLiteRunResult> => {
  return await db.runAsync(
    'INSERT INTO lives (liveName, liveDate, venueName, artistName, imagePath) VALUES (?, ?, ?, ?, ?);',
    live.liveName,
    live.liveDate,
    live.venueName || null,
    live.artistName || null,
    live.imagePath || null
  );
};

/**
 * 保存されているすべてのライブ情報を取得する
 * @returns Promise<Live[]>
 */
export const getLives = async (): Promise<Live[]> => {
  return await db.getAllAsync<Live>('SELECT * FROM lives ORDER BY liveDate DESC;');
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
    'UPDATE lives SET liveName = ?, liveDate = ?, venueName = ?, artistName = ?, imagePath = ? WHERE id = ?;',
    live.liveName,
    live.liveDate,
    live.venueName || null,
    live.artistName || null,
    live.imagePath || null,
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