const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('dev.db');
console.log('DB type:', typeof db);
console.log('DB constructor:', db.constructor.name);
console.log('DB keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(db)));
const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
const rows = stmt.all();
console.log('Tables:', rows);
