# VibeCoin - PRD Summary

Quick reference guide for the Product Requirements Document.

## Core Concept

**VibeCoin** = Earn money by completing micro-tasks during developer wait times (builds, AI responses, etc.)

- **Value Proposition**: "Earn VibeCoins while you code"
- **Target**: Developers (22-35) using AI assistants, with long build times
- **Currency**: 1 VibeCoin = $0.25 USD

## MVP Features (Phase 1)

### 1. CLI Installation & Authentication ✅
- Install via npm: `npm install -g vibecoin`
- Login with email/password
- JWT-based authentication

### 2. Manual Wait Command ✅
- `vibecoin wait <seconds>` - Primary earning mechanism
- Shows tasks during wait time
- Skip daemon for MVP

### 3. Task System ✅
Three task types:
- **Image Classification**: Yes/No questions about images
- **Text Classification**: Multiple choice sentiment/category
- **Simple Labeling**: 1-5 ratings

Rewards: 2-5 VibeCoins per task (20-60 seconds)

### 4. Earnings Tracking ✅
- `vibecoin status` - Current earnings & stats
- `vibecoin earnings` - Detailed breakdown
- Track: Total coins, USD value, streak, accuracy, tasks completed

### 5. Payout System ✅
- Minimum: $10 (40 VibeCoins)
- Methods: Venmo, Zelle, PayPal, Bitcoin
- Manual processing for MVP
- `vibecoin payout` command

## Tech Stack

### CLI
- Node.js + Commander.js
- Inquirer (prompts), Chalk (colors), Axios (API)
- Local storage in `~/.vibecoin/`

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Deployed on Railway/Render

### Database
- Users, Tasks, Task Completions, Payouts
- All schemas defined in `packages/backend/src/db/schema.sql`

## Success Metrics (30 Days)

- **Users**: 100 signups, 50 active
- **Engagement**: 20 tasks/user average
- **Earnings**: $500+ paid out
- **Quality**: 85%+ accuracy

## Out of Scope for MVP

❌ Automatic idle detection
❌ Browser-based OAuth
❌ Web dashboard
❌ Mobile app
❌ Referral system
❌ Automated payouts

## Development Timeline

- **Week 1-2**: Core infrastructure ✅
- **Week 2-3**: Task system ✅
- **Week 3-4**: Earnings & payouts ✅
- **Week 4**: Polish & testing
- **Week 5**: Launch 🚀

**Target Launch**: December 4, 2025

## Key Commands

```bash
# CLI
vibecoin login
vibecoin wait 30
vibecoin status
vibecoin earnings
vibecoin payout

# Backend
npm run migrate    # Setup database
npm run seed       # Add sample tasks
npm run dev        # Start server
```

## Quality Control

- **Honeypot tasks**: 10% with known answers
- **Majority voting**: 3 users per task
- **Accuracy tracking**: Warning at <70%, suspend at <50%

## Payout Flow

1. User earns 40+ VibeCoins ($10+)
2. Request via `vibecoin payout`
3. Choose method & destination
4. Manual processing (2-3 days)
5. Mark as paid in database

## Files & Structure

```
vibecoin/
├── packages/
│   ├── cli/          # User-facing CLI tool
│   └── backend/      # API server
├── README.md         # Main documentation
├── DEVELOPMENT.md    # Developer guide
├── DEPLOYMENT.md     # Deployment guide
└── PRD_SUMMARY.md    # This file
```

## Quick Start (Development)

```bash
# Install
npm install

# Setup database
cd packages/backend
cp .env.example .env
npm run migrate
npm run seed

# Run backend
npm run dev

# Test CLI (in another terminal)
cd packages/cli
node bin/vibecoin.js login
node bin/vibecoin.js wait 30
```

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/tasks/next
POST   /api/tasks/:id/submit
GET    /api/tasks/history
GET    /api/earnings
GET    /api/earnings/stats
POST   /api/payouts/request
GET    /api/payouts/history
```

## Phase 2 Features (Future)

- Automatic idle detection via hooks
- VS Code / Cursor integration
- Web dashboard
- Referral system ($5 bonus)
- Additional task types
- Team accounts
- Automated payouts

## Resources

- **Test User**: test@vibecoin.sh / password123
- **Sample Tasks**: 6 pre-loaded in seed
- **Documentation**: All READMEs in packages

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Task supply | Start with 500+ tasks, create weekly |
| Payment fraud | Manual review, honeypot tasks |
| Low adoption | Strong launch (Product Hunt, Twitter) |
| Poor accuracy | Majority voting, accuracy tracking |

## Launch Checklist

- [ ] Backend deployed
- [ ] CLI published to npm
- [ ] 500+ tasks loaded
- [ ] Beta test with 10 users
- [ ] Landing page live
- [ ] Product Hunt draft
- [ ] Tweet launch thread

## Contact

- GitHub: [Repository URL]
- Email: [Contact Email]
- Status: **MVP Complete - Ready for Testing**

---

**Version**: 1.0 MVP
**Last Updated**: November 2025
**Status**: ✅ Implementation Complete
