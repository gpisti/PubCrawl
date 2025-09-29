const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database('./database.sqlite');

function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Create routes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        participants TEXT DEFAULT '[]',
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);
    console.log('✓ Routes table created');
    
    // Create route_pubs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS route_pubs (
        id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        pub_name TEXT NOT NULL,
        address TEXT NOT NULL,
        note TEXT,
        type TEXT DEFAULT 'pub',
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Route pubs table created');
    
    // Create drinks table
    db.exec(`
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
    db.exec(`
      CREATE TABLE IF NOT EXISTS drink_entries (
        id TEXT PRIMARY KEY,
        drink_id TEXT NOT NULL,
        pub_id TEXT NOT NULL,
        route_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drink_id) REFERENCES drinks(id),
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Drink entries table created');
    
    // Create pub_ratings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS pub_ratings (
        id TEXT PRIMARY KEY,
        pub_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Pub ratings table created');
    
    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_routes_owner_id ON routes(owner_id);
      CREATE INDEX IF NOT EXISTS idx_route_pubs_route_id ON route_pubs(route_id);
      CREATE INDEX IF NOT EXISTS idx_drink_entries_route_id ON drink_entries(route_id);
      CREATE INDEX IF NOT EXISTS idx_drink_entries_user_id ON drink_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_pub_ratings_pub_id ON pub_ratings(pub_id);
    `);
    console.log('✓ Indexes created');
    
    // Insert default drinks
    const insertDrink = db.prepare(`
      INSERT OR IGNORE INTO drinks (id, name, type, calories, alcohol_content, icon) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const drinks = [
      ['drink_beer', 'Sör', 'beer', 150, 5.0, '🍺'],
      ['drink_cocktail', 'Koktél', 'cocktail', 200, 15.0, '🍸'],
      ['drink_wine', 'Bor', 'wine', 120, 12.0, '🍷'],
      ['drink_shot', 'Pálinka', 'shot', 100, 40.0, '🥃'],
      ['drink_soft', 'Üdítő', 'soft', 50, 0.0, '🥤']
    ];
    
    drinks.forEach(drink => insertDrink.run(drink));
    console.log('✓ Default drinks inserted');
    
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

migrate();
