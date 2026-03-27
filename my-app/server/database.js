const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'app.db');

// folder check
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enforce foreign keys. Need this for ON DELETE CASCADE.
db.pragma('foreign_keys = ON');
db.exec(`
    CREATE TABLE IF NOT EXISTS cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycleId INTEGER NOT NULL,
    flowId TEXT NOT NULL,
    nodeType TEXT,
    positionX REAL NOT NULL,
    positionY REAL NOT NULL,
    jsonData TEXT NOT NULL,
    FOREIGN KEY (cycleId) REFERENCES cycles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycleId INTEGER NOT NULL,
    flowId TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    FOREIGN KEY (cycleId) REFERENCES cycles(id) ON DELETE CASCADE
    );
`);

console.log("Database made successfully");

module.exports = db;
