const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PubCrawl API is running' });
});

// Routes API
app.get('/api/routes', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await pool.query(`
      SELECT r.id, r.name, r.owner_id as "ownerId", r.participants, r.status, r.created_at, r.completed_at,
             (SELECT COUNT(*) FROM route_pubs p WHERE p.route_id = r.id) as pub_count
      FROM routes r
      WHERE r.participants::text LIKE $1
      ORDER BY r.created_at DESC
    `, [`%"${userId}"%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.get('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const routeResult = await pool.query(
      'SELECT id, name, owner_id as "ownerId", participants, status, created_at, completed_at FROM routes WHERE id = $1',
      [id]
    );
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = routeResult.rows[0];
    
    // Get pubs for this route
    const pubsResult = await pool.query(`
      SELECT id, pub_name, address, note, type, order_index
      FROM route_pubs 
      WHERE route_id = $1 
      ORDER BY order_index
    `, [id]);
    
    route.pubs = pubsResult.rows;
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    const { name, pubs, ownerId } = req.body;
    
    if (!name || !pubs || !ownerId) {
      return res.status(400).json({ error: 'Name, pubs, and ownerId are required' });
    }

    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create route
    await pool.query(`
      INSERT INTO routes (id, name, owner_id, participants, status, created_at)
      VALUES ($1, $2, $3, $4, 'active', NOW())
    `, [routeId, name.trim(), ownerId, JSON.stringify([ownerId])]);
    
    // Insert pubs
    for (let i = 0; i < pubs.length; i++) {
      const pub = pubs[i];
      const pubId = `pub_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.query(`
        INSERT INTO route_pubs (id, route_id, pub_name, address, note, type, order_index, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [pubId, routeId, pub.pub_name, pub.address, pub.note || '', pub.type || 'pub', i]);
    }
    
    res.json({ id: routeId, message: 'Route created successfully' });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM routes WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

app.patch('/api/routes/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE routes 
      SET status = 'completed', completed_at = NOW() 
      WHERE id = $1
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route completed successfully' });
  } catch (error) {
    console.error('Error completing route:', error);
    res.status(500).json({ error: 'Failed to complete route' });
  }
});

app.post('/api/routes/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get current participants
    const routeResult = await pool.query('SELECT participants FROM routes WHERE id = $1', [id]);
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const participants = routeResult.rows[0].participants || [];
    
    if (!participants.includes(userId)) {
      participants.push(userId);
      
      await pool.query(
        'UPDATE routes SET participants = $1 WHERE id = $2',
        [JSON.stringify(participants), id]
      );
    }
    
    res.json({ message: 'Successfully joined route' });
  } catch (error) {
    console.error('Error joining route:', error);
    res.status(500).json({ error: 'Failed to join route' });
  }
});

app.post('/api/routes/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get current participants
    const routeResult = await pool.query('SELECT participants FROM routes WHERE id = $1', [id]);
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const participants = routeResult.rows[0].participants || [];
    const updatedParticipants = participants.filter(id => id !== userId);
    
    await pool.query(
      'UPDATE routes SET participants = $1 WHERE id = $2',
      [JSON.stringify(updatedParticipants), id]
    );
    
    res.json({ message: 'Successfully left route' });
  } catch (error) {
    console.error('Error leaving route:', error);
    res.status(500).json({ error: 'Failed to leave route' });
  }
});

// Drinks API
app.get('/api/drinks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drinks ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching drinks:', error);
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
});

// Drink entries API
app.post('/api/drink-entries', async (req, res) => {
  try {
    const { drinkId, pubId, routeId, userId, quantity } = req.body;
    
    if (!drinkId || !pubId || !routeId || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await pool.query(`
      INSERT INTO drink_entries (id, drink_id, pub_id, route_id, user_id, quantity, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [entryId, drinkId, pubId, routeId, userId, quantity || 1]);
    
    res.json({ id: entryId, message: 'Drink entry added successfully' });
  } catch (error) {
    console.error('Error adding drink entry:', error);
    res.status(500).json({ error: 'Failed to add drink entry' });
  }
});

app.get('/api/drink-entries/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const result = await pool.query(`
      SELECT de.*, d.name as drink_name, d.type as drink_type, d.calories, d.alcohol_content, d.icon
      FROM drink_entries de
      JOIN drinks d ON de.drink_id = d.id
      WHERE de.route_id = $1
      ORDER BY de.timestamp
    `, [routeId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching drink entries:', error);
    res.status(500).json({ error: 'Failed to fetch drink entries' });
  }
});

// Pub ratings API
app.post('/api/pub-ratings', async (req, res) => {
  try {
    const { pubId, userId, rating, comment } = req.body;
    
    if (!pubId || !userId || !rating) {
      return res.status(400).json({ error: 'Pub ID, user ID, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const ratingId = `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await pool.query(`
      INSERT INTO pub_ratings (id, pub_id, user_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [ratingId, pubId, userId, rating, comment || '']);
    
    res.json({ id: ratingId, message: 'Rating added successfully' });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

app.get('/api/pub-ratings/:pubId', async (req, res) => {
  try {
    const { pubId } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM pub_ratings 
      WHERE pub_id = $1 
      ORDER BY created_at DESC
    `, [pubId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.listen(port, () => {
  console.log(`PubCrawl API server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
