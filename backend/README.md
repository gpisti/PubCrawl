# PubCrawl Backend API

Express.js backend API for the PubCrawl application with PostgreSQL database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Set up your database URL in `.env`:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

4. Run database migration:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Routes
- `GET /api/routes?userId={id}` - Get user's routes
- `GET /api/routes/:id` - Get specific route
- `POST /api/routes` - Create new route
- `DELETE /api/routes/:id` - Delete route
- `PATCH /api/routes/:id/complete` - Complete route
- `POST /api/routes/:id/join` - Join route
- `POST /api/routes/:id/leave` - Leave route

### Health
- `GET /api/health` - API health check

## Database Schema

### Routes Table
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Route name
- `owner_id` (VARCHAR) - Owner user ID
- `participants` (TEXT[]) - Array of participant user IDs
- `status` (VARCHAR) - 'active' or 'completed'
- `created_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)

### Route Pubs Table
- `id` (UUID) - Primary key
- `route_id` (UUID) - Foreign key to routes
- `pub_name` (VARCHAR) - Pub name
- `address` (TEXT) - Pub address
- `note` (TEXT) - Additional notes
- `type` (VARCHAR) - Pub type
- `order_index` (INTEGER) - Order in route

## Deployment

This backend is designed to be deployed on Render.com with a PostgreSQL database.
