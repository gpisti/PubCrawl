const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const db = new Database('./database.sqlite');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Test database connection
console.log('Connected to SQLite database');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PubCrawl API is running' });
});

// Routes API
app.get('/api/routes', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stmt = db.prepare(`
      SELECT r.id, r.name, r.owner_id as ownerId, r.participants, r.status, r.created_at, r.completed_at,
             (SELECT COUNT(*) FROM route_pubs p WHERE p.route_id = r.id) as pub_count
      FROM routes r
      WHERE JSON_EXTRACT(r.participants, '$') LIKE ?
      ORDER BY r.created_at DESC
    `);
    
    const routes = stmt.all(`%"${userId}"%`);

    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.get('/api/routes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const routeStmt = db.prepare('SELECT id, name, owner_id as ownerId, participants, status, created_at, completed_at FROM routes WHERE id = ?');
    const route = routeStmt.get(id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const pubsStmt = db.prepare('SELECT * FROM route_pubs WHERE route_id = ? ORDER BY order_index');
    const pubs = pubsStmt.all(id);
    
    route.pubs = pubs;

    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

app.post('/api/routes', (req, res) => {
  try {
    const { name, pubs, ownerId } = req.body;
    
    if (!name || !pubs || !ownerId) {
      return res.status(400).json({ error: 'Name, pubs, and ownerId are required' });
    }

    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create route
    const insertRoute = db.prepare(`
      INSERT INTO routes (id, name, owner_id, participants, status, created_at)
      VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    `);
    
    insertRoute.run(routeId, name, ownerId, JSON.stringify([ownerId]));
    
    // Insert pubs
    const insertPub = db.prepare(`
      INSERT INTO route_pubs (id, route_id, pub_name, address, note, type, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    for (let i = 0; i < pubs.length; i++) {
      const pub = pubs[i];
      const pubId = `pub_${routeId}_${i}`;
      insertPub.run(pubId, routeId, pub.pub_name, pub.address, pub.note || '', pub.type || 'pub', i);
    }
    
    res.status(201).json({
      id: routeId,
      message: 'Route created successfully'
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

app.delete('/api/routes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM routes WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

app.patch('/api/routes/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare(`
      UPDATE routes 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route completed successfully' });
  } catch (error) {
    console.error('Error completing route:', error);
    res.status(500).json({ error: 'Failed to complete route' });
  }
});

app.post('/api/routes/:id/join', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get current route
    const routeStmt = db.prepare('SELECT * FROM routes WHERE id = ?');
    const route = routeStmt.get(id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const participants = JSON.parse(route.participants);
    
    if (participants.includes(userId)) {
      return res.status(400).json({ error: 'User is already a participant' });
    }
    
    participants.push(userId);
    
    const updateStmt = db.prepare('UPDATE routes SET participants = ? WHERE id = ?');
    updateStmt.run(JSON.stringify(participants), id);
    
    res.json({ message: 'Successfully joined route' });
  } catch (error) {
    console.error('Error joining route:', error);
    res.status(500).json({ error: 'Failed to join route' });
  }
});

app.post('/api/routes/:id/leave', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get current route
    const routeStmt = db.prepare('SELECT * FROM routes WHERE id = ?');
    const route = routeStmt.get(id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    if (route.owner_id === userId) {
      return res.status(400).json({ error: 'Owner cannot leave their own route' });
    }
    
    const participants = JSON.parse(route.participants);
    
    if (!participants.includes(userId)) {
      return res.status(400).json({ error: 'User is not a participant' });
    }
    
    const updatedParticipants = participants.filter(id => id !== userId);
    
    const updateStmt = db.prepare('UPDATE routes SET participants = ? WHERE id = ?');
    updateStmt.run(JSON.stringify(updatedParticipants), id);
    
    res.json({ message: 'Successfully left route' });
  } catch (error) {
    console.error('Error leaving route:', error);
    res.status(500).json({ error: 'Failed to leave route' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`PubCrawl API server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
