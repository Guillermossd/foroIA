const Database = require("better-sqlite3");
const path = require("path");
const BOARDS = require("./boards");

const db = new Database(path.join(__dirname, "forum.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS boards(
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  logo        TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS posts(
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  board_id   INTEGER REFERENCES boards(id),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// Migración: bases de datos anteriores no tenían board_id
if (!db.prepare("PRAGMA table_info(posts)").all().some((c) => c.name === "board_id")) {
  db.exec("ALTER TABLE posts ADD COLUMN board_id INTEGER REFERENCES boards(id)");
}
db.exec("CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board_id, id)");

// Sincroniza boards.js con la base de datos
const upsert = db.prepare(`INSERT INTO boards(slug,name,description,logo,position)
  VALUES(@slug,@name,@description,@logo,@position)
  ON CONFLICT(slug) DO UPDATE SET name=excluded.name, description=excluded.description,
    logo=excluded.logo, position=excluded.position`);
BOARDS.forEach((b, i) => upsert.run({ ...b, position: i }));

// Las publicaciones antiguas pasan a "General"
db.exec(`UPDATE posts SET board_id = (SELECT id FROM boards WHERE slug = 'general') WHERE board_id IS NULL`);

module.exports = db;
