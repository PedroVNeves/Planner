import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('planner.db');

export const getDB = () => db;

export const initDatabase = () => {
  try {
    // 1. Categorias
    db.execSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT
      );
    `);

    // 2. Tarefas
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        categoryId TEXT,
        type TEXT DEFAULT 'TASK',
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      );
    `);

    // 3. Templates de Hábitos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS habit_templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        archived INTEGER DEFAULT 0,
        createdAt TEXT
      );
    `);

    // 4. Metas (Goals)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        createdAt TEXT
      );
    `);

    // 5. Livros
    db.execSync(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        totalPages INTEGER,
        currentPage INTEGER DEFAULT 0,
        status TEXT DEFAULT 'TO_READ',
        rating INTEGER DEFAULT 0
      );
    `);

    // 6. Logs Diários
    db.execSync(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        date TEXT PRIMARY KEY,
        focus TEXT,
        metrics TEXT
      );
    `);

    // 7. Definições de Métricas (NOVA TABELA)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS metric_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
        icon TEXT DEFAULT 'bar-chart',
        target INTEGER DEFAULT 0,
        isVisible INTEGER DEFAULT 1
      );
    `);

    // 8. Gamificação
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        last_completed_date TEXT,
        freeze_days INTEGER DEFAULT 0,
        current_theme TEXT DEFAULT 'ocean'
      );
    `);

    db.execSync(`INSERT OR IGNORE INTO user_stats (id, current_streak, freeze_days) VALUES ('user', 0, 3)`);

    console.log('SQLite initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};