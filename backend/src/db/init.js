const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/ngo_tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH);
  }
  return db;
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    
    database.serialize(() => {
      // Reports table - stores individual NGO monthly reports
      database.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ngo_id TEXT NOT NULL,
          month TEXT NOT NULL,
          people_helped INTEGER NOT NULL DEFAULT 0,
          events_conducted INTEGER NOT NULL DEFAULT 0,
          funds_utilized REAL NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(ngo_id, month)
        )
      `, (err) => {
        if (err) console.error('Error creating reports table:', err);
      });

      // Jobs table - tracks CSV upload processing jobs
      database.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          total_rows INTEGER DEFAULT 0,
          processed_rows INTEGER DEFAULT 0,
          successful_rows INTEGER DEFAULT 0,
          failed_rows INTEGER DEFAULT 0,
          errors TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `, (err) => {
        if (err) console.error('Error creating jobs table:', err);
      });

      // Create indexes for better query performance
      database.run(`
        CREATE INDEX IF NOT EXISTS idx_reports_month ON reports(month)
      `);
      
      database.run(`
        CREATE INDEX IF NOT EXISTS idx_reports_ngo_month ON reports(ngo_id, month)
      `);

      database.run(`
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Run init if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}

module.exports = { getDb, initDatabase };

