# VibeCoin Development Guide

Complete guide for developing VibeCoin locally.

## Project Structure

```
vibecoin/
├── packages/
│   ├── cli/                 # VibeCoin CLI tool
│   │   ├── bin/            # Executable entry point
│   │   ├── src/
│   │   │   ├── commands/   # CLI commands
│   │   │   ├── services/   # API client, auth, storage
│   │   │   ├── ui/         # Terminal UI helpers
│   │   │   └── utils/      # Config, constants
│   │   └── package.json
│   │
│   └── backend/            # Backend API server
│       ├── src/
│       │   ├── routes/     # Express routes
│       │   ├── controllers/ # Request handlers
│       │   ├── middleware/ # Auth, error handling
│       │   ├── db/         # Database migrations & seeds
│       │   └── utils/      # Database utilities
│       └── package.json
│
├── package.json            # Root workspace config
└── README.md
```

## Setup

### Prerequisites

Install the following:
- Node.js >= 16.0.0
- PostgreSQL >= 13
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd vibecoin
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### 3. Configure Environment

```bash
cd packages/backend
cp .env.example .env
```

Edit `packages/backend/.env`:

```env
DATABASE_URL=postgresql://vibecoin_user:password@localhost:5432/vibecoin
JWT_SECRET=your_development_secret_here
PORT=3000
NODE_ENV=development
```

### 4. Setup Database

#### Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create user and database
CREATE USER vibecoin_user WITH PASSWORD 'password';
CREATE DATABASE vibecoin OWNER vibecoin_user;
GRANT ALL PRIVILEGES ON DATABASE vibecoin TO vibecoin_user;

# Exit
\q
```

#### Run Migrations

```bash
cd packages/backend
npm run migrate
```

#### Seed Sample Data

```bash
npm run seed
```

This creates:
- Test user: `test@vibecoin.sh` / `password123`
- 6 sample tasks for testing

## Development Workflow

### Running Backend

```bash
cd packages/backend
npm run dev
```

Server runs on `http://localhost:3000`

### Testing CLI Locally

```bash
cd packages/cli

# Run commands directly
node bin/vibecoin.js login
node bin/vibecoin.js status
node bin/vibecoin.js wait 30
```

### Testing Full Flow

1. Start backend:
```bash
cd packages/backend
npm run dev
```

2. In another terminal, use CLI:
```bash
cd packages/cli

# Login
node bin/vibecoin.js login
# Email: test@vibecoin.sh
# Password: password123

# Wait and complete tasks
node bin/vibecoin.js wait 30

# Check status
node bin/vibecoin.js status

# View earnings
node bin/vibecoin.js earnings
```

## Common Development Tasks

### Adding a New CLI Command

1. Create command file in `packages/cli/src/commands/`:

```javascript
// packages/cli/src/commands/mycommand.js
async function myCommand() {
  console.log('Hello from my command!');
}

module.exports = myCommand;
```

2. Register in `packages/cli/bin/vibecoin.js`:

```javascript
const myCommand = require('../src/commands/mycommand');

program
  .command('mycommand')
  .description('My new command')
  .action(myCommand);
```

### Adding a New API Endpoint

1. Create controller in `packages/backend/src/controllers/`:

```javascript
// packages/backend/src/controllers/myController.js
async function myHandler(req, res, next) {
  try {
    res.json({ message: 'Hello from API' });
  } catch (error) {
    next(error);
  }
}

module.exports = { myHandler };
```

2. Create route in `packages/backend/src/routes/`:

```javascript
// packages/backend/src/routes/my.js
const express = require('express');
const router = express.Router();
const { myHandler } = require('../controllers/myController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, myHandler);

module.exports = router;
```

3. Register route in `packages/backend/src/server.js`:

```javascript
const myRoutes = require('./routes/my');
app.use('/api/my', myRoutes);
```

### Adding New Tasks

#### Via SQL

```sql
INSERT INTO tasks (type, question, image_url, correct_answer, reward_coins, estimated_seconds)
VALUES (
  'image_classification',
  'Is there a cat in this image?',
  'https://example.com/cat.jpg',
  'y',
  3,
  20
);
```

#### Via Seed Script

Edit `packages/backend/src/db/seed.js` and add to `sampleTasks` array.

### Database Migrations

To modify the schema:

1. Edit `packages/backend/src/db/schema.sql`
2. Drop and recreate database (for development):

```bash
psql postgres
DROP DATABASE vibecoin;
CREATE DATABASE vibecoin OWNER vibecoin_user;
\q

npm run migrate
npm run seed
```

## Testing

### Manual Testing

Use the test user credentials:
- Email: `test@vibecoin.sh`
- Password: `password123`

### API Testing with curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vibecoin.sh","password":"password123"}'

# Get next task (replace TOKEN)
curl http://localhost:3000/api/tasks/next \
  -H "Authorization: Bearer TOKEN"

# Submit answer
curl -X POST http://localhost:3000/api/tasks/TASK_ID/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer":"y","time_taken_seconds":18}'
```

## Debugging

### Backend Debugging

Add `console.log()` statements or use Node.js debugger:

```bash
node --inspect src/server.js
```

### CLI Debugging

```bash
node --inspect bin/vibecoin.js wait 30
```

### Database Debugging

```bash
# Connect to database
psql vibecoin

# View users
SELECT * FROM users;

# View tasks
SELECT * FROM tasks;

# View completions
SELECT * FROM task_completions;
```

## Code Style

### JavaScript

- Use ES6+ features
- Use async/await over promises
- Descriptive variable names
- Add comments for complex logic

### Database

- Use parameterized queries (prevent SQL injection)
- Use transactions for multi-step operations
- Add indexes for frequently queried columns

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation
- `refactor/component-name` - Code refactoring

### Commit Messages

```
type: Brief description (50 chars max)

Longer explanation if needed (wrap at 72 chars).

- Bullet points for details
- More details
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### JWT Token Error

```
JsonWebTokenError: invalid token
```

**Solution**: Check `JWT_SECRET` is set in `.env`

### CLI Command Not Found

```
vibecoin: command not found
```

**Solution**: For local development, use `node bin/vibecoin.js` instead of `vibecoin`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Kill process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

## Performance Tips

1. **Database Indexes**: Add indexes for frequently queried columns
2. **Connection Pooling**: Already configured in `db.js`
3. **Rate Limiting**: Configured in `server.js`
4. **Caching**: CLI caches earnings data locally

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong JWT secrets in production
- [ ] Hash passwords with bcrypt
- [ ] Validate all user inputs
- [ ] Use parameterized SQL queries
- [ ] Enable CORS only for trusted origins
- [ ] Use HTTPS in production

## Next Steps

After completing local development:

1. **Testing**: Write unit and integration tests
2. **Documentation**: Update API docs
3. **Deployment**: Follow DEPLOYMENT.md guide
4. **Monitoring**: Set up logging and error tracking

## Resources

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Commander.js Docs](https://github.com/tj/commander.js)
- [JWT.io](https://jwt.io/)

## Questions?

Open an issue or contact the development team.
