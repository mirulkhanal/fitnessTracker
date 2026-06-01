import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

import { authSessionService } from '@/services/auth-session.service';

const DB_NAME = 'fitnesstracker.db';

let database: SQLite.SQLiteDatabase | null = null;

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

CREATE TABLE IF NOT EXISTS photo_metadata (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  local_id TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  captured_at TEXT NOT NULL,
  categories TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_photos_user ON photo_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_captured ON photo_metadata(user_id, captured_at);
`;

export const getDatabase = () => {
  if (!database) {
    database = SQLite.openDatabaseSync(DB_NAME);
  }
  return database;
};

export const databaseService = {
  async init(): Promise<void> {
    const db = getDatabase();
    db.execSync(SCHEMA_SQL);
  },

  async getRequiredUserId(): Promise<string> {
    const session = await authSessionService.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error('Sign in required');
    }
    return userId;
  },

  createId(): string {
    return Crypto.randomUUID();
  },
};
