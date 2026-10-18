-- Gestionale ordini Vault Crafted
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  serial INTEGER UNIQUE,
  edition INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nuovo',
  paid INTEGER NOT NULL DEFAULT 0,
  email TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  customer_note TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  card_name TEXT NOT NULL DEFAULT '',
  card_json TEXT NOT NULL DEFAULT '{}',
  art_pos TEXT NOT NULL DEFAULT '{"zoom":1,"px":0,"py":0}',
  case_id TEXT NOT NULL DEFAULT '',
  case_label TEXT NOT NULL DEFAULT '',
  case_price REAL NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  photo_key TEXT NOT NULL DEFAULT '',
  photo_name TEXT NOT NULL DEFAULT '',
  art_key TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  tracking TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'sito',
  legacy_json TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('serial_start', '1');
