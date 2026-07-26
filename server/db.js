/* ============================================
   HYBRID DATABASE SCHEMA, INITIALIZER & EMULATOR
   ============================================ */

const path = require('path');
const fs = require('fs');

let db;

if (process.env.VERCEL) {
  // === JSON DATABASE EMULATOR FOR VERCEL ===
  console.log("Running in Vercel environment: Loading JSON Database Emulator.");
  db = createJSONDatabase();
} else {
  // === SQLITE DATABASE FOR LOCAL ENVIRONMENT ===
  console.log("Running locally: Loading SQLite3 Database.");
  try {
    const sqlite3 = require('sqlite3').verbose();
    let dbPath = path.join(process.cwd(), 'server', 'database.db');
    db = new sqlite3.Database(dbPath);
    
    db.on('error', (err) => {
      console.error("SQLite database connection error:", err);
    });

    db.serialize(() => {
      // 1. Industries Table
      db.run(`
        CREATE TABLE IF NOT EXISTS industries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          category TEXT NOT NULL,
          location TEXT,
          status TEXT DEFAULT 'Compliant',
          subscription TEXT,
          paymentStatus TEXT DEFAULT 'Paid',
          amountDue REAL DEFAULT 0,
          dueDate TEXT,
          contactPerson TEXT,
          phone TEXT,
          email TEXT
        )
      `);

      // 2. Analyzers & Parameter Telemetry Table
      db.run(`
        CREATE TABLE IF NOT EXISTS analyzers (
          parameterId TEXT PRIMARY KEY,
          industryId TEXT NOT NULL,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          symbol TEXT NOT NULL,
          unit TEXT NOT NULL,
          minVal REAL DEFAULT 0,
          maxVal REAL DEFAULT 100,
          thresholdWarning REAL DEFAULT 50,
          thresholdExceeded REAL DEFAULT 80,
          currentValue REAL DEFAULT 0,
          history TEXT,
          description TEXT,
          FOREIGN KEY (industryId) REFERENCES industries(id)
        )
      `);

      // 3. Service Reports Table
      db.run(`
        CREATE TABLE IF NOT EXISTS service_reports (
          id TEXT PRIMARY KEY,
          industryId TEXT NOT NULL,
          industryName TEXT NOT NULL,
          analyzerCategory TEXT NOT NULL,
          parameterId TEXT NOT NULL,
          parameterName TEXT NOT NULL,
          date TEXT NOT NULL,
          technician TEXT NOT NULL,
          status TEXT DEFAULT 'Pending',
          serviceType TEXT NOT NULL,
          observations TEXT,
          actionsTaken TEXT,
          nextServiceDue TEXT,
          FOREIGN KEY (industryId) REFERENCES industries(id)
        )
      `);

      // 4. Sales & Payments Transactions Table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          invoiceId TEXT PRIMARY KEY,
          industryId TEXT NOT NULL,
          industryName TEXT NOT NULL,
          plan TEXT NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          status TEXT DEFAULT 'Paid',
          paymentMethod TEXT NOT NULL,
          period TEXT NOT NULL,
          FOREIGN KEY (industryId) REFERENCES industries(id)
        )
      `);

      // Seed default data if empty
      db.get("SELECT COUNT(*) as count FROM industries", (err, row) => {
        if (row && row.count === 0) {
          console.log("Seeding SQLite database with default data...");
          seedSQLiteDatabase();
        }
      });
    });
  } catch (e) {
    console.error("Failed to initialize SQLite3 locally. Falling back to JSON Database:", e);
    db = createJSONDatabase();
  }
}

// === SQLite Seeder ===
function seedSQLiteDatabase() {
  const defaultIndustries = [
    ["IND-001", "Apex Steel Industries", "apex_steel", "pass123", "Steel & Metallurgy", "Industrial Zone East, Sector 4", "Compliant", "Enterprise CEMS Plan", "Paid", 0, "2026-08-15", "Rajesh Kumar", "+91 98765 43210", "env@apexsteel.com"],
    ["IND-002", "Titan Cement Plant", "titan_cement", "pass123", "Cement Manufacturing", "Highway 45, Kiln Valley", "Warning", "Standard Monitoring Plan", "Pending", 45000, "2026-08-01", "Anish Sharma", "+91 98123 45678", "compliance@titancement.com"],
    ["IND-003", "GreenChem Synthetics", "greenchem", "pass123", "Chemicals & Petrochem", "Plot 88, Bio-Park Special Zone", "Compliant", "Enterprise CEMS Plan", "Paid", 0, "2026-09-01", "Dr. Sunita Rao", "+91 99887 76655", "safety@greenchem.com"],
    ["IND-004", "Vanguard Thermal Power", "vanguard_power", "pass123", "Power Generation", "Grid Station South, Station 2", "Exceeded", "Advanced CEMS + Water Plan", "Overdue", 82000, "2026-07-15", "Vikram Mehta", "+91 97112 23344", "cems@vanguardpower.com"],
    ["IND-005", "Aura Textiles & Dyes", "aura_textiles", "pass123", "Textiles & Processing", "ETP Complex, Industrial Area Phase 2", "Compliant", "Water & Effluent Monitoring Plan", "Paid", 0, "2026-08-20", "Priya Nair", "+91 96543 21098", "etp@auratextiles.com"]
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO industries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  defaultIndustries.forEach(ind => stmt.run(ind));
  stmt.finalize();

  const defaultParams = [
    ["IND01_GAS_SO2", "IND-001", "gas", "Sulfur Dioxide", "SO₂", "mg/Nm³", 0, 200, 80, 120, 42.5, JSON.stringify([41.2, 43.0, 42.1, 45.8, 42.5]), "Flue gas sulfur dioxide concentration"],
    ["IND01_GAS_NOX", "IND-001", "gas", "Nitrogen Oxides", "NOₓ", "mg/Nm³", 0, 300, 150, 220, 118.4, JSON.stringify([110.0, 112.5, 115.0, 122.1, 118.4]), "Combined nitric oxide and nitrogen dioxide emission"],
    ["IND01_GAS_CO", "IND-001", "gas", "Carbon Monoxide", "CO", "mg/Nm³", 0, 100, 45, 70, 24.1, JSON.stringify([20.5, 22.0, 25.1, 23.8, 24.1]), "Carbon monoxide incomplete combustion indicator"],
    ["IND01_WATER_PH", "IND-001", "water", "pH Level", "pH", "pH", 0, 14, 8.5, 9.5, 7.4, JSON.stringify([7.2, 7.3, 7.5, 7.4, 7.4]), "Hydrogen ion acidity/alkalinity scale"],
    ["IND01_WATER_COD", "IND-001", "water", "Chemical Oxygen Demand", "COD", "mg/L", 0, 500, 180, 250, 142.0, JSON.stringify([135, 140, 148, 145, 142]), "Chemically oxidizable organic matter level"],
    ["IND01_SPM_PM25", "IND-001", "spm", "PM 2.5 Fine Particles", "PM₂.₅", "µg/m³", 0, 250, 60, 90, 48.3, JSON.stringify([42.1, 45.0, 52.3, 50.1, 48.3]), "Particulate matter <= 2.5um"],
    ["IND01_SPM_PM10", "IND-001", "spm", "PM 10 Coarse Particles", "PM₁₀", "µg/m³", 0, 400, 100, 150, 88.7, JSON.stringify([82.0, 85.4, 93.1, 90.0, 88.7]), "Particulate matter <= 10um"],
    ["IND01_FLOW_GAS", "IND-001", "flow", "Stack Gas Flow Rate", "Q_gas", "m³/hr", 0, 150000, 120000, 140000, 84200.0, JSON.stringify([82000, 83500, 85100, 84800, 84200]), "Total volumetric dry gas discharge rate"],
    ["IND01_FLOW_WATER", "IND-001", "flow", "Effluent Discharge Flow", "Q_eff", "m³/day", 0, 5000, 3800, 4500, 2450.0, JSON.stringify([2380, 2410, 2500, 2470, 2450]), "Electromagnetic flow meter raw water measurement"]
  ];

  const paramStmt = db.prepare("INSERT OR IGNORE INTO analyzers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  defaultParams.forEach(p => paramStmt.run(p));
  paramStmt.finalize();

  const defaultServices = [
    ["SR-2026-089", "IND-001", "Apex Steel Industries", "Gas Analyzers", "IND01_GAS_SO2", "Sulfur Dioxide (SO₂)", "2026-07-20", "Ramesh Verma", "Completed", "Quarterly Calibration & Sensor Zeroing", "Zero drift observed on SO₂ optical cell by +3.2 ppm. Recalibrated with certified span gas.", "1. Cleaned optics and lens.\n2. Replaced sample filter.\n3. Executed zero and span calibration.", "2026-10-20"],
    ["SR-2026-088", "IND-002", "Titan Cement Plant", "SPM Monitors", "IND02_SPM_DUST", "Stack Dust Concentration", "2026-07-22", "Suresh Patil", "In Progress", "Laser Transceiver Alignment", "High dust alarm triggered due to heavy particulate coating on receiver lens.", "Disassembled purge fan assembly and replacing air intake filter cartridge.", "2026-08-22"]
  ];

  const sStmt = db.prepare("INSERT OR IGNORE INTO service_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  defaultServices.forEach(s => sStmt.run(s));
  sStmt.finalize();

  const defaultTx = [
    ["INV-2026-401", "IND-001", "Apex Steel Industries", "Enterprise CEMS Plan", 120000, "2026-07-15", "Paid", "NEFT / Bank Transfer", "Q3 2026 (Jul - Sep)"],
    ["INV-2026-402", "IND-002", "Titan Cement Plant", "Standard Monitoring Plan", 45000, "2026-07-01", "Pending", "Credit Card / PO", "Jul 2026"],
    ["INV-2026-403", "IND-003", "GreenChem Synthetics", "Enterprise CEMS Plan", 120000, "2026-06-01", "Paid", "Wire Transfer", "Q3 2026 (Jul - Sep)"],
    ["INV-2026-404", "IND-004", "Vanguard Thermal Power", "Advanced CEMS + Water Plan", 82000, "2026-06-15", "Overdue", "Cheque / Billing", "Jun - Jul 2026"]
  ];

  const tStmt = db.prepare("INSERT OR IGNORE INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  defaultTx.forEach(t => tStmt.run(t));
  tStmt.finalize();
}

// === JSON Database Emulator Implementation ===
function createJSONDatabase() {
  const jsonSourcePath = path.join(process.cwd(), 'server', 'database.json');
  const jsonTmpPath = '/tmp/database.json';
  let jsonPath = jsonSourcePath;

  if (process.env.VERCEL) {
    try {
      if (!fs.existsSync(jsonTmpPath)) {
        fs.copyFileSync(jsonSourcePath, jsonTmpPath);
        fs.chmodSync(jsonTmpPath, 0o666);
      }
      jsonPath = jsonTmpPath;
    } catch (e) {
      console.error("Failed to copy JSON database to /tmp on Vercel:", e);
    }
  }

  // Read data into memory
  let dbData = { industries: [], analyzers: [], service_reports: [], transactions: [] };
  try {
    if (fs.existsSync(jsonPath)) {
      dbData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } else {
      console.error("JSON database file not found at path:", jsonPath);
    }
  } catch (e) {
    console.error("Failed to read JSON database:", e);
  }

  const saveDb = () => {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(dbData, null, 2));
    } catch (e) {
      console.error("Failed to write to JSON database:", e);
    }
  };

  return {
    all: (query, params, callback) => {
      let table = null;
      if (query.includes('industries')) table = 'industries';
      else if (query.includes('analyzers')) table = 'analyzers';
      else if (query.includes('service_reports')) table = 'service_reports';
      else if (query.includes('transactions')) table = 'transactions';

      if (!table) return callback(new Error("Unsupported table query: " + query), []);
      let rows = JSON.parse(JSON.stringify(dbData[table]));

      if (query.includes('ORDER BY name ASC')) {
        rows.sort((a, b) => a.name.localeCompare(b.name));
      } else if (query.includes('ORDER BY date DESC')) {
        rows.sort((a, b) => b.date.localeCompare(a.date));
      }

      callback(null, rows);
    },

    get: (query, params, callback) => {
      let table = null;
      if (query.includes('industries')) table = 'industries';
      else if (query.includes('analyzers')) table = 'analyzers';

      if (!table) return callback(new Error("Unsupported table query: " + query), null);
      let rows = dbData[table];
      let row = null;

      if (query.includes('username = ? OR id = ?')) {
        const val = params[0];
        row = rows.find(r => r.username === val || r.id === val) || null;
      } else if (query.includes('SELECT COUNT(*)')) {
        row = { count: rows.length };
      }

      callback(null, row);
    },

    run: function(query, params, callback) {
      try {
        if (query.trim().startsWith('INSERT INTO industries')) {
          const [id, name, username, password, category, location, subscription, contactPerson, phone, email] = params;
          const newRow = {
            id, name, username, password, category, location,
            status: 'Compliant',
            subscription,
            paymentStatus: 'Paid',
            amountDue: 0,
            dueDate: new Date(Date.now() + 30*24*3600*1000).toISOString().split('T')[0],
            contactPerson, phone, email
          };
          dbData.industries = dbData.industries.filter(i => i.id !== id);
          dbData.industries.push(newRow);
          saveDb();
        } 
        else if (query.trim().startsWith('DELETE FROM industries')) {
          const id = params[0];
          dbData.industries = dbData.industries.filter(i => i.id !== id);
          saveDb();
        }
        else if (query.trim().startsWith('DELETE FROM analyzers')) {
          const id = params[0];
          dbData.analyzers = dbData.analyzers.filter(a => a.industryId !== id);
          saveDb();
        }
        else if (query.trim().startsWith('INSERT OR REPLACE INTO service_reports')) {
          const [id, industryId, industryName, analyzerCategory, parameterId, parameterName, date, technician, status, serviceType, observations, actionsTaken, nextServiceDue] = params;
          const newRow = {
            id, industryId, industryName, analyzerCategory, parameterId, parameterName, date, technician, status, serviceType, observations, actionsTaken, nextServiceDue
          };
          dbData.service_reports = dbData.service_reports.filter(r => r.id !== id);
          dbData.service_reports.push(newRow);
          saveDb();
        }
        else if (query.trim().startsWith('UPDATE service_reports SET status = ?')) {
          const [status, id] = params;
          const row = dbData.service_reports.find(r => r.id === id);
          if (row) {
            row.status = status;
            saveDb();
          }
        }
        else if (query.trim().startsWith('INSERT INTO transactions')) {
          const [invoiceId, industryId, industryName, plan, amount, date, status, paymentMethod, period] = params;
          const newRow = {
            invoiceId, industryId, industryName, plan, amount, date, status, paymentMethod, period
          };
          dbData.transactions = dbData.transactions.filter(t => t.invoiceId !== invoiceId);
          dbData.transactions.push(newRow);
          saveDb();
        }
        else if (query.trim().startsWith('UPDATE industries SET amountDue')) {
          const [amount, paymentStatus, id] = params;
          const row = dbData.industries.find(i => i.id === id);
          if (row) {
            row.amountDue += amount;
            row.paymentStatus = paymentStatus;
            saveDb();
          }
        }
        else if (query.trim().startsWith('UPDATE analyzers SET currentValue')) {
          const [currentValue, historyStr, parameterId] = params;
          const row = dbData.analyzers.find(a => a.parameterId === parameterId);
          if (row) {
            row.currentValue = parseFloat(currentValue);
            row.history = JSON.parse(historyStr);
            saveDb();
          }
        }

        if (callback) callback.call({ lastID: params ? params[0] : null, changes: 1 }, null);
      } catch (e) {
        if (callback) callback(e);
      }
    },

    prepare: (query) => {
      return {
        run: (params, callback) => {
          if (query.includes('INSERT OR IGNORE INTO analyzers') || query.includes('INSERT OR IGNORE INTO industries')) {
            let table = query.includes('analyzers') ? 'analyzers' : 'industries';
            if (table === 'analyzers') {
              const [parameterId, industryId, category, name, symbol, unit, minVal, maxVal, thresholdWarning, thresholdExceeded, currentValue, historyStr, description] = params;
              const newRow = {
                parameterId, industryId, category, name, symbol, unit, minVal, maxVal, thresholdWarning, thresholdExceeded, currentValue,
                history: typeof historyStr === 'string' ? JSON.parse(historyStr) : historyStr,
                description
              };
              dbData.analyzers = dbData.analyzers.filter(a => a.parameterId !== parameterId);
              dbData.analyzers.push(newRow);
            }
          }
          if (callback) callback(null);
        },
        finalize: (callback) => {
          saveDb();
          if (callback) callback(null);
        }
      };
    },

    serialize: (callback) => {
      callback();
    }
  };
}

module.exports = db;
