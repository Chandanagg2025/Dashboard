/* ============================================
   EXPRESS REST API BACKEND SERVER
   ============================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// ===== AUTH ROUTE =====
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  if (username === 'admin' || role === 'admin') {
    if (password === 'admin123' || password === 'admin') {
      return res.json({
        success: true,
        user: {
          username: 'admin',
          name: 'System Administrator',
          role: 'admin',
          avatarText: 'AD'
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password for Admin account' });
    }
  } else if (username === 'engineer' || username?.startsWith('engineer_') || username?.startsWith('eng_') || role === 'engineer') {
    if (password === 'eng123' || password === 'engineer123' || password === 'pass123') {
      return res.json({
        success: true,
        user: {
          username: username || 'engineer',
          name: 'Rahul Sharma (Field Engineer)',
          role: 'engineer',
          avatarText: 'ENG'
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password for Field Engineer account' });
    }
  } else {
    db.get('SELECT * FROM industries WHERE username = ? OR id = ?', [username, username], (err, ind) => {
      if (err || !ind) {
        return res.status(404).json({ success: false, message: `Account "${username}" not found` });
      }
      if (password === ind.password) {
        return res.json({
          success: true,
          user: {
            username: ind.username,
            name: ind.name,
            role: 'industry',
            industryId: ind.id,
            category: ind.category,
            location: ind.location,
            avatarText: ind.name.substring(0, 2).toUpperCase()
          }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid password for industry account' });
      }
    });
  }
});

// ===== INDUSTRIES ROUTES =====
app.get('/api/industries', (req, res) => {
  db.all('SELECT * FROM industries ORDER BY name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/industries', (req, res) => {
  const { id, name, username, password, category, location, contactPerson, phone, email, subscription, initialAnalyzers } = req.body;
  const newId = id || `IND-00${Math.floor(Math.random() * 90 + 10)}`;

  const query = `
    INSERT INTO industries (id, name, username, password, category, location, status, subscription, paymentStatus, amountDue, contactPerson, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, 'Compliant', ?, 'Paid', 0, ?, ?, ?)
  `;

  db.run(query, [newId, name, username, password || 'pass123', category, location, subscription || 'Standard Monitoring Plan', contactPerson, phone, email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Save selected analyzers if opted by Admin
    if (Array.isArray(initialAnalyzers) && initialAnalyzers.length > 0) {
      const stmt = db.prepare("INSERT OR IGNORE INTO analyzers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const code = newId.replace('-', '');
      
      initialAnalyzers.forEach(item => {
        const paramId = `${code}_${item.code}`;
        stmt.run([
          paramId,
          newId,
          item.category,
          item.name,
          item.symbol,
          item.unit,
          item.minVal || 0,
          item.maxVal || 100,
          item.thresholdWarning || 50,
          item.thresholdExceeded || 80,
          item.defaultVal || 25.0,
          JSON.stringify([20, 22, 24, 25, item.defaultVal || 25.0]),
          item.description || 'Opted analyzer parameter'
        ]);
      });
      stmt.finalize();
    }

    res.json({ success: true, id: newId, message: 'Industry created with selected analyzers successfully!' });
  });
});

// Delete Industry (Admin feature)
app.delete('/api/industries/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM industries WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    // Also delete associated analyzers
    db.run('DELETE FROM analyzers WHERE industryId = ?', [id], function(err2) {
      res.json({ success: true, id, message: 'Industry and its analyzers deleted successfully!' });
    });
  });
});

function seedAnalyzersForIndustry(indId, indName) {
  const code = indId.replace('-', '');
  const params = [
    [`${code}_GAS_SO2`, indId, 'gas', 'Sulfur Dioxide', 'SO₂', 'mg/Nm³', 0, 200, 80, 120, 35.0, JSON.stringify([32, 34, 35, 33, 35]), 'Flue gas sulfur dioxide'],
    [`${code}_WATER_PH`, indId, 'water', 'pH Level', 'pH', 'pH', 0, 14, 8.5, 9.5, 7.2, JSON.stringify([7.1, 7.2, 7.3, 7.2, 7.2]), 'Effluent acidity/alkalinity'],
    [`${code}_SPM_PM25`, indId, 'spm', 'PM 2.5 Fine Particles', 'PM₂.₅', 'µg/m³', 0, 250, 60, 90, 42.0, JSON.stringify([40, 41, 43, 42, 42]), 'Stack dust particles'],
    [`${code}_FLOW_GAS`, indId, 'flow', 'Stack Gas Flow Rate', 'Q_gas', 'm³/hr', 0, 150000, 120000, 140000, 75000.0, JSON.stringify([72000, 74000, 75000, 75000, 75000]), 'Gas discharge rate']
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO analyzers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  params.forEach(p => stmt.run(p));
  stmt.finalize();
}

// ===== ANALYZERS & PARAMETER TELEMETRY ROUTES =====
app.get('/api/analyzers', (req, res) => {
  const { industryId } = req.query;
  let query = 'SELECT * FROM analyzers';
  let params = [];

  if (industryId) {
    query += ' WHERE industryId = ?';
    params.push(industryId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const parsed = rows.map(r => ({
      ...r,
      history: r.history ? JSON.parse(r.history) : [r.currentValue]
    }));
    res.json(parsed);
  });
});

app.post('/api/analyzers', (req, res) => {
  const { parameterId, industryId, category, name, symbol, unit, minVal, maxVal, thresholdWarning, thresholdExceeded, description } = req.body;

  const query = `
    INSERT INTO analyzers (parameterId, industryId, category, name, symbol, unit, minVal, maxVal, thresholdWarning, thresholdExceeded, currentValue, history, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 25.0, ?, ?)
  `;

  db.run(query, [parameterId, industryId, category, name, symbol, unit, minVal || 0, maxVal || 100, thresholdWarning || 50, thresholdExceeded || 80, JSON.stringify([20, 22, 25, 24, 25]), description || 'Custom parameter'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, parameterId, message: 'Parameter added successfully!' });
  });
});

// Delete Analyzer Parameter (Admin feature)
app.delete('/api/analyzers/:parameterId', (req, res) => {
  const { parameterId } = req.params;
  db.run('DELETE FROM analyzers WHERE parameterId = ?', [parameterId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, parameterId, message: 'Analyzer parameter deleted successfully!' });
  });
});

app.put('/api/telemetry/update', (req, res) => {
  const { parameterId, currentValue } = req.body;

  db.get('SELECT * FROM analyzers WHERE parameterId = ?', [parameterId], (err, param) => {
    if (err || !param) return res.status(404).json({ error: 'Parameter ID not found' });

    let history = param.history ? JSON.parse(param.history) : [];
    history.shift();
    history.push(parseFloat(currentValue));

    db.run('UPDATE analyzers SET currentValue = ?, history = ? WHERE parameterId = ?', [currentValue, JSON.stringify(history), parameterId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, parameterId, currentValue });
    });
  });
});

// ===== SALES & TRANSACTIONS =====
app.get('/api/transactions', (req, res) => {
  const { industryId } = req.query;
  let query = 'SELECT * FROM transactions';
  let params = [];

  if (industryId) {
    query += ' WHERE industryId = ?';
    params.push(industryId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== SERVICE REPORTS =====
app.get('/api/service-reports', (req, res) => {
  const { industryId } = req.query;
  let query = 'SELECT * FROM service_reports ORDER BY date DESC';
  let params = [];

  if (industryId) {
    query = 'SELECT * FROM service_reports WHERE industryId = ? ORDER BY date DESC';
    params.push(industryId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/service-reports', (req, res) => {
  const { id, industryId, industryName, analyzerCategory, parameterId, parameterName, date, technician, status, serviceType, observations, actionsTaken, nextServiceDue } = req.body;
  const reportId = id || `SR-2026-${Math.floor(100 + Math.random() * 900)}`;

  const query = `
    INSERT OR REPLACE INTO service_reports (id, industryId, industryName, analyzerCategory, parameterId, parameterName, date, technician, status, serviceType, observations, actionsTaken, nextServiceDue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [reportId, industryId, industryName, analyzerCategory, parameterId, parameterName, date, technician, status || 'Completed', serviceType, observations, actionsTaken, nextServiceDue], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: reportId });
  });
});

app.put('/api/service-reports/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE service_reports SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: req.params.id, status });
  });
});

// Fallback index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Pollution Monitor Full-Stack Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
