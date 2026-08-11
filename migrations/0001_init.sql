-- users：固定三个账户，username 不可改，nickname/password 可改
CREATE TABLE IF NOT EXISTS users (
  username  TEXT PRIMARY KEY,
  nickname  TEXT NOT NULL DEFAULT '',
  password  TEXT NOT NULL DEFAULT ''
);

-- payments：还款记录
CREATE TABLE IF NOT EXISTS payments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL,
  amount     REAL NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_payments_date       ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);
