# VibeCoin 💎

**Earn money while you code** - Turn terminal wait time into income through micro-tasks.

## Overview

VibeCoin is a CLI tool that enables developers to earn real money by completing simple micro-tasks during natural wait times in their workflow (AI responses, builds, package installs). Users earn "VibeCoins" (real money) by doing data labeling tasks while they would otherwise be idle.

## Features

- 🚀 **CLI-first experience** - Answer in terminal, view in browser
- 🌐 **Visual task viewing** - Images and videos open in your browser automatically
- 💰 **Real earnings** - 1 VibeCoin = $0.25 USD
- ⚡ **Quick tasks** - Complete tasks in 20-60 seconds
- 📊 **Track earnings** - Monitor your progress and stats
- 💳 **Multiple payout methods** - Venmo, PayPal, Zelle, or Bitcoin

## Quick Start

### Installation

```bash
npm install -g vibecoin
```

### Usage

```bash
# Authenticate
vibecoin login

# Start earning during wait times
vibecoin wait 30

# Check your status
vibecoin status

# Request payout (minimum $10)
vibecoin payout
```

### How It Works

When you run `vibecoin wait`, the CLI will:

1. 🌐 **Open your browser** - Task with image/video opens automatically at `tasks.vibecoin.sh`
2. 👀 **View the task** - See images or videos in a clean, full-screen interface
3. ⌨️ **Answer in terminal** - Return to your terminal and type your answer
4. ✅ **Get instant feedback** - See if you were correct and how many coins you earned
5. 🔄 **Repeat** - Get more tasks during your wait time

This hybrid approach gives you the best of both worlds: visual content in the browser where it looks great, and fast input in the terminal where you're already working.

## Project Structure

This is a monorepo containing:

- **packages/cli** - The VibeCoin CLI tool
- **packages/backend** - The VibeCoin backend API

## Development

### Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env

# Run database migrations
npm run backend migrate

# Start development servers
npm run dev
```

### CLI Development

```bash
cd packages/cli
npm run dev
```

### Backend Development

```bash
cd packages/backend
npm run dev
```

## Architecture

### Tech Stack

- **CLI**: Node.js, Commander.js, Inquirer.js
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL
- **Auth**: JWT tokens

### Key Components

1. **CLI Commands**
   - `login` - Authenticate with VibeCoin
   - `wait <seconds>` - Show tasks during wait time
   - `status` - Display earnings and stats
   - `earnings` - Detailed earnings breakdown
   - `payout` - Request payout

2. **Backend API**
   - Authentication endpoints
   - Task management
   - Earnings tracking
   - Payout processing

3. **Database Schema**
   - Users
   - Tasks
   - Task Completions
   - Payouts

## Success Metrics (30 Days)

- 100 signups
- 50 active users
- $500+ total paid out
- 85%+ average accuracy

## Roadmap

### MVP (Current)
- ✅ CLI installation and authentication
- ✅ Manual wait command
- ✅ Image and text classification tasks
- ✅ Earnings tracking
- ✅ Manual payout system

### Phase 2
- [ ] Automatic idle detection
- [ ] Referral system
- [ ] Web dashboard
- [ ] Additional task types

## Contributing

This is a private MVP. Contributions are not currently accepted.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**Status**: MVP in Development
**Target Launch**: December 4, 2025
**Version**: 1.0.0
