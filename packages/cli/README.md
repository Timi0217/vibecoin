# VibeCoin CLI

Command-line interface for VibeCoin - Earn money while you code.

## Installation

```bash
npm install -g vibecoin
```

## Quick Start

```bash
# Authenticate
vibecoin login

# Start earning during wait times
vibecoin wait 30

# Check your status
vibecoin status

# View detailed earnings
vibecoin earnings

# Request payout (minimum $10)
vibecoin payout
```

## Commands

### `vibecoin login`
Authenticate with VibeCoin. You'll be prompted for your email and password.

### `vibecoin logout`
Log out from VibeCoin.

### `vibecoin wait <seconds>`
Wait for specified seconds and show available tasks. This is the primary way to earn VibeCoins in MVP.

**Options:**
- `-s, --skip-tasks` - Skip tasks and just wait

**Example:**
```bash
# Wait 30 seconds and show tasks
vibecoin wait 30

# Wait 60 seconds without tasks
vibecoin wait 60 --skip-tasks
```

### `vibecoin status`
Show current status including:
- Today's earnings
- Weekly earnings
- All-time earnings
- Current streak
- Accuracy rate
- Tasks completed

### `vibecoin earnings`
Display detailed earnings breakdown by period.

### `vibecoin payout`
Request payout when you have at least $10 (40 VibeCoins).

**Supported methods:**
- Venmo (US only)
- Zelle (US only)
- PayPal (International)
- Bitcoin (International)

### `vibecoin start`
Start VibeCoin daemon (coming in Phase 2).

### `vibecoin stop`
Stop VibeCoin daemon (coming in Phase 2).

### `vibecoin config [action] [key] [value]`
Manage configuration.

**Actions:**
- `show` - Show all configuration (default)
- `get <key>` - Get specific configuration value
- `set <key> <value>` - Set configuration value

**Example:**
```bash
vibecoin config show
vibecoin config get apiUrl
vibecoin config set notifications true
```

## Task Types

### Image Classification
Answer yes/no questions about images.

**Example:**
```
Question: Is there a dog in this image?
[y] Yes  [n] No  [s] Skip
```

### Text Classification
Classify text into categories.

**Example:**
```
Question: Is this text: [1] Positive [2] Negative [3] Neutral
```

### Simple Labeling
Rate or label content.

**Example:**
```
Question: Rate this image quality: [1-5]
```

## Earning VibeCoin

- 1 VibeCoin = $0.25 USD
- Tasks pay 2-5 VibeCoins
- Tasks take 20-60 seconds
- Minimum payout: $10 (40 VibeCoins)

## Configuration

Configuration is stored in `~/.vibecoin/config.json`

Default settings:
```json
{
  "apiUrl": "https://api.vibecoin.sh",
  "autoStart": false,
  "notifications": true
}
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm test
```

## Support

For issues or questions, create an issue on GitHub.

## License

MIT
