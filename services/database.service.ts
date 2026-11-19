import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'fitnesstracker.db';

let database: SQLite.SQLiteDatabase | null = null;

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS photo_metadata (
  id TEXT PRIMARY KEY NOT NULL,
  local_id TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  captured_at TEXT NOT NULL,
  categories TEXT NOT NULL DEFAULT '[]'
);

`;

const INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_categories_created ON categories(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_captured ON photo_metadata(captured_at);
`;

export const getDatabase = () => {
  if (!database) database = SQLite.openDatabaseSync(DB_NAME);
  return database;
};

export const databaseService = {
  async init(): Promise<void> {
    const db = getDatabase();
    db.execSync(SCHEMA_SQL);
    const columns = (table: string) =>
      db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`).map(column => column.name);

    if (columns('categories').includes('user_id') || columns('photo_metadata').includes('user_id')) {
      db.execSync('BEGIN IMMEDIATE');
      try {
        db.execSync(`
          DROP INDEX IF EXISTS idx_categories_user;
          DROP INDEX IF EXISTS idx_categories_created;
          DROP INDEX IF EXISTS idx_photos_user;
          DROP INDEX IF EXISTS idx_photos_captured;

          ALTER TABLE categories RENAME TO categories_account_migration;
          CREATE TABLE categories (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
          INSERT INTO categories (id, name, color, icon, created_at)
            SELECT id, name, color, icon, created_at FROM categories_account_migration;
          DROP TABLE categories_account_migration;

          ALTER TABLE photo_metadata RENAME TO photo_metadata_account_migration;
          CREATE TABLE photo_metadata (
            id TEXT PRIMARY KEY NOT NULL,
            local_id TEXT NOT NULL,
            width INTEGER NOT NULL DEFAULT 0,
            height INTEGER NOT NULL DEFAULT 0,
            captured_at TEXT NOT NULL,
            categories TEXT NOT NULL DEFAULT '[]'
          );
          INSERT INTO photo_metadata (id, local_id, width, height, captured_at, categories)
            SELECT id, local_id, width, height, captured_at, categories FROM photo_metadata_account_migration;
          DROP TABLE photo_metadata_account_migration;
        `);
        db.execSync(INDEX_SQL);
        db.execSync('COMMIT');
      } catch (error) {
        db.execSync('ROLLBACK');
        throw error;
      }
    } else {
      db.execSync(INDEX_SQL);
    }
  },

  createId(): string {
    return Crypto.randomUUID();
  },
};
