import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('planner.db');

export const getDB = () => db;

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        categoryId TEXT,
        type TEXT DEFAULT 'TASK',
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      );
      CREATE TABLE IF NOT EXISTS habit_templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT,
        frequency TEXT,
        archived INTEGER DEFAULT 0,
        createdAt TEXT
      );
      CREATE TABLE IF NOT EXISTS habit_completions (
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        PRIMARY KEY (habit_id, date),
        FOREIGN KEY (habit_id) REFERENCES habit_templates (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        period TEXT,
        completed INTEGER DEFAULT 0,
        createdAt TEXT
      );
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        totalPages INTEGER,
        currentPage INTEGER DEFAULT 0,
        status TEXT DEFAULT 'TO_READ',
        rating INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS daily_logs (
        date TEXT PRIMARY KEY,
        focus TEXT,
        notes TEXT
      );
      CREATE TABLE IF NOT EXISTS metric_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        unit TEXT,
        target REAL,
        isVisible INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS metric_logs (
        id TEXT PRIMARY KEY,
        metric_id TEXT NOT NULL,
        date TEXT NOT NULL,
        value REAL NOT NULL,
        FOREIGN KEY (metric_id) REFERENCES metric_definitions (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        last_completed_date TEXT,
        freeze_days INTEGER DEFAULT 0,
        display_name TEXT
      );
    `);

    // Migration logic
    try {
      const dailyLogsInfo = await db.getAllAsync('PRAGMA table_info(daily_logs)');
      
      // 1. Ensure 'notes' column exists before attempting migration
      const notesColumnExists = dailyLogsInfo.some((column: any) => column.name === 'notes');
      if (!notesColumnExists) {
        await db.execAsync('ALTER TABLE daily_logs ADD COLUMN notes TEXT');
      }

      // 2. Now, handle the 'metrics' column migration
      const metricsColumnExists = dailyLogsInfo.some((column: any) => column.name === 'metrics');
      if (metricsColumnExists) {
        console.warn("Dropping 'metrics' column from 'daily_logs' for schema alignment. Old data in this column will be lost.");
        
        // The 'notes' column is now guaranteed to exist
        await db.execAsync(`
          CREATE TABLE daily_logs_temp AS SELECT date, focus, notes FROM daily_logs;
          DROP TABLE daily_logs;
          ALTER TABLE daily_logs_temp RENAME TO daily_logs;
        `);
      }

      // Migration for goals.period
      const goalsInfo = await db.getAllAsync('PRAGMA table_info(goals)');
      const periodColumnExists = goalsInfo.some((column: any) => column.name === 'period');
      if (!periodColumnExists) {
        await db.execAsync('ALTER TABLE goals ADD COLUMN period TEXT');
      }

      // Migration for habits
      const habitsInfo = await db.getAllAsync('PRAGMA table_info(habit_templates)');
      const colorColumnExists = habitsInfo.some((column: any) => column.name === 'color');
      const frequencyColumnExists = habitsInfo.some((column: any) => column.name === 'frequency');
      if (!colorColumnExists) {
        await db.execAsync("ALTER TABLE habit_templates ADD COLUMN color TEXT DEFAULT '#8B5CF6'");
      }
      if (!frequencyColumnExists) {
        await db.execAsync("ALTER TABLE habit_templates ADD COLUMN frequency TEXT DEFAULT '[0,1,2,3,4,5,6]'");
      }

    } catch (e) {
      console.warn("Migration for daily_logs failed, proceeding with current schema:", e);
    }

    await db.execAsync(`INSERT OR IGNORE INTO user_stats (id, current_streak, freeze_days, display_name) VALUES ('user', 0, 3, 'Usuário')`);

    console.log('SQLite initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // Re-throw to be caught by the caller
  }
};