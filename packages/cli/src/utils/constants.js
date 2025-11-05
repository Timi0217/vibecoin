/**
 * Constants used throughout the CLI
 */

module.exports = {
  // API
  DEFAULT_API_URL: 'https://api.vibecoin.sh',
  API_TIMEOUT: 30000, // 30 seconds

  // Earnings
  VIBECOIN_TO_USD: 0.25, // 1 VibeCoin = $0.25
  MINIMUM_PAYOUT_USD: 10, // Minimum $10 payout
  MINIMUM_PAYOUT_COINS: 40, // 40 VibeCoins = $10

  // Tasks
  TASK_TYPES: {
    IMAGE_CLASSIFICATION: 'image_classification',
    TEXT_CLASSIFICATION: 'text_classification',
    SIMPLE_LABELING: 'simple_labeling'
  },

  // Payout methods
  PAYOUT_METHODS: {
    VENMO: 'venmo',
    ZELLE: 'zelle',
    PAYPAL: 'paypal',
    BITCOIN: 'bitcoin'
  },

  // Quality control
  MINIMUM_ACCURACY: 0.5, // 50% minimum accuracy
  WARNING_ACCURACY: 0.7, // 70% warning threshold

  // Daemon
  DAEMON_CHECK_INTERVAL: 5000, // 5 seconds
  MAX_MEMORY_MB: 50, // Maximum 50MB RAM usage

  // Display
  COLORS: {
    PRIMARY: '#00D9FF',
    SUCCESS: '#00FF94',
    ERROR: '#FF0055',
    WARNING: '#FFB800',
    INFO: '#7B61FF'
  }
};
