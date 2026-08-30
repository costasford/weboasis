-- Run once against the FORUM_DB D1 database (dashboard > Workers & Pages >
-- D1 > your database > Console) before the Worker's forum endpoints are used.

CREATE TABLE IF NOT EXISTS threads (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	body TEXT NOT NULL,
	author_name TEXT NOT NULL DEFAULT 'Anonymous',
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS replies (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	thread_id INTEGER NOT NULL REFERENCES threads(id),
	body TEXT NOT NULL,
	author_name TEXT NOT NULL DEFAULT 'Anonymous',
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON replies(thread_id);
