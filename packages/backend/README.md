# VibeCoin Backend API

Backend API server for VibeCoin - Earn money while you code.

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vibecoin

# JWT
JWT_SECRET=your_secret_here

# Server
PORT=3000
NODE_ENV=development
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed sample data
npm run seed
```

This will:
- Create all required tables (users, tasks, task_completions, payouts)
- Create a test user: `test@vibecoin.sh` / `password123`
- Insert 6 sample tasks

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Tasks

#### Get Next Task
```http
GET /api/tasks/next
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "task_uuid",
  "type": "image_classification",
  "question": "Is there a dog in this image?",
  "image_url": "https://example.com/image.jpg",
  "reward_coins": 3,
  "estimated_seconds": 20,
  "options": [
    {"key": "y", "label": "Yes"},
    {"key": "n", "label": "No"}
  ]
}
```

#### Submit Answer
```http
POST /api/tasks/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": "y",
  "time_taken_seconds": 18
}
```

Response:
```json
{
  "success": true,
  "correct": true,
  "earned_coins": 3,
  "total_coins": 47,
  "total_usd": 11.75,
  "accuracy_rate": 0.94
}
```

#### Get Task History
```http
GET /api/tasks/history?limit=50&offset=0
Authorization: Bearer <token>
```

### Earnings

#### Get Earnings
```http
GET /api/earnings
Authorization: Bearer <token>
```

Response:
```json
{
  "today_coins": 12,
  "week_coins": 47,
  "month_coins": 203,
  "total_coins": 847,
  "tasks_completed": 247,
  "accuracy_rate": 0.94,
  "streak_days": 7
}
```

#### Get Stats
```http
GET /api/earnings/stats
Authorization: Bearer <token>
```

### Payouts

#### Request Payout
```http
POST /api/payouts/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount_usd": 211.75,
  "amount_coins": 847,
  "method": "paypal",
  "destination": "user@paypal.com"
}
```

#### Get Payout History
```http
GET /api/payouts/history
Authorization: Bearer <token>
```

## Database Schema

### Users
```sql
- id (UUID, primary key)
- email (VARCHAR, unique)
- username (VARCHAR, unique)
- password_hash (VARCHAR)
- total_coins_earned (INT)
- total_tasks_completed (INT)
- accuracy_rate (DECIMAL)
- current_streak_days (INT)
- created_at (TIMESTAMP)
```

### Tasks
```sql
- id (UUID, primary key)
- type (VARCHAR)
- question (TEXT)
- image_url (VARCHAR)
- correct_answer (VARCHAR)
- reward_coins (INT)
- estimated_seconds (INT)
- active (BOOLEAN)
- metadata (JSONB)
```

### Task Completions
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- task_id (UUID, foreign key)
- answer_given (VARCHAR)
- correct (BOOLEAN)
- coins_earned (INT)
- time_taken_seconds (INT)
- completed_at (TIMESTAMP)
```

### Payouts
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- amount_usd (DECIMAL)
- amount_coins (INT)
- method (VARCHAR)
- destination (VARCHAR)
- status (VARCHAR)
- requested_at (TIMESTAMP)
- paid_at (TIMESTAMP)
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS protection
- Rate limiting (100 requests/hour)
- SQL injection protection (parameterized queries)

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

### Adding New Tasks

You can add tasks directly to the database or via the seed script:

```javascript
await db.query(
  `INSERT INTO tasks (type, question, correct_answer, reward_coins, estimated_seconds)
   VALUES ($1, $2, $3, $4, $5)`,
  ['image_classification', 'Your question?', 'y', 3, 20]
);
```

### Managing Payouts

For MVP, payouts are manually processed. To mark a payout as completed:

```http
PATCH /api/payouts/:id/status
Content-Type: application/json

{
  "status": "completed",
  "notes": "Paid via PayPal"
}
```

## Testing

```bash
npm test
```

## Deployment

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure `DATABASE_URL` for production database
- Set appropriate `CORS_ORIGIN`
- Enable SSL for PostgreSQL

### Recommended Platforms

- Railway
- Render
- Fly.io
- Heroku

## License

MIT
