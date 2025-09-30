const { Pool } = require('pg');
require('dotenv').config();

// Parse Railway connection string
const url = new URL(process.env.DATABASE_URL);
console.log('Connection details:', {
  host: url.hostname,
  port: url.port,
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password ? '***' : 'undefined'
});

const pool = new Pool({
  host: url.hostname,
  port: url.port,
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  ssl: false
});

async function migrate() {
  try {
    console.log('Starting PostgreSQL database migration...');
    
    // Create routes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        participants JSONB DEFAULT '[]',
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    console.log('✓ Routes table created');
    
    // Create route_pubs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS route_pubs (
        id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        pub_name TEXT NOT NULL,
        address TEXT NOT NULL,
        note TEXT,
        type TEXT DEFAULT 'pub',
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Route pubs table created');
    
    // Create drinks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drinks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        calories INTEGER NOT NULL,
        alcohol_content REAL NOT NULL,
        icon TEXT NOT NULL
      )
    `);
    console.log('✓ Drinks table created');
    
    // Create drink_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drink_entries (
        id TEXT PRIMARY KEY,
        drink_id TEXT NOT NULL,
        pub_id TEXT NOT NULL,
        route_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drink_id) REFERENCES drinks(id),
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Drink entries table created');
    
    // Create pub_ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pub_ratings (
        id TEXT PRIMARY KEY,
        pub_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Pub ratings table created');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_routes_owner_id ON routes(owner_id);
      CREATE INDEX IF NOT EXISTS idx_route_pubs_route_id ON route_pubs(route_id);
      CREATE INDEX IF NOT EXISTS idx_drink_entries_route_id ON drink_entries(route_id);
      CREATE INDEX IF NOT EXISTS idx_drink_entries_user_id ON drink_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_pub_ratings_pub_id ON pub_ratings(pub_id);
    `);
    console.log('✓ Indexes created');
    
    // Insert default drinks
    const drinks = [
      ['drink_beer', 'Sör', 'beer', 150, 5.0, '🍺'],
      ['drink_cocktail', 'Koktél', 'cocktail', 200, 15.0, '🍸'],
      ['drink_wine', 'Bor', 'wine', 120, 12.0, '🍷'],
      ['drink_shot', 'Pálinka', 'shot', 100, 40.0, '🥃'],
      ['drink_soft', 'Üdítő', 'soft', 50, 0.0, '🥤']
    ];
    
    for (const drink of drinks) {
      await pool.query(`
        INSERT INTO drinks (id, name, type, calories, alcohol_content, icon) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, drink);
    }
    console.log('✓ Default drinks inserted');
    
    console.log('PostgreSQL database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
