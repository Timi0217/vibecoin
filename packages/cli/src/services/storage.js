/**
 * Local storage service for caching data
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.vibecoin');
const EARNINGS_FILE = path.join(STORAGE_DIR, 'earnings.json');
const CACHE_FILE = path.join(STORAGE_DIR, 'cache.json');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Read JSON file
 * @param {string} filePath - File path
 * @param {*} defaultValue - Default value if file doesn't exist
 * @returns {*} File contents
 */
function readJsonFile(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return defaultValue;
}

/**
 * Write JSON file
 * @param {string} filePath - File path
 * @param {*} data - Data to write
 */
function writeJsonFile(filePath, data) {
  try {
    ensureStorageDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
  }
}

/**
 * Get cached earnings data
 * @returns {object|null} Earnings data
 */
function getEarnings() {
  return readJsonFile(EARNINGS_FILE, {
    totalCoins: 0,
    totalUsd: 0,
    tasksCompleted: 0,
    streak: 0,
    accuracy: 0,
    lastSync: null
  });
}

/**
 * Save earnings data
 * @param {object} earnings - Earnings data
 */
function saveEarnings(earnings) {
  writeJsonFile(EARNINGS_FILE, {
    ...earnings,
    lastSync: new Date().toISOString()
  });
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {*} Cached value
 */
function getCache(key) {
  const cache = readJsonFile(CACHE_FILE, {});
  return cache[key];
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 */
function setCache(key, value, ttl = null) {
  const cache = readJsonFile(CACHE_FILE, {});
  cache[key] = {
    value,
    timestamp: Date.now(),
    ttl
  };
  writeJsonFile(CACHE_FILE, cache);
}

/**
 * Check if cached data is still valid
 * @param {string} key - Cache key
 * @returns {boolean} True if cache is valid
 */
function isCacheValid(key) {
  const cache = readJsonFile(CACHE_FILE, {});
  const item = cache[key];

  if (!item) return false;
  if (!item.ttl) return true;

  const age = (Date.now() - item.timestamp) / 1000;
  return age < item.ttl;
}

/**
 * Clear all cached data
 */
function clearCache() {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
  }
}

/**
 * Clear all storage
 */
function clearAll() {
  if (fs.existsSync(EARNINGS_FILE)) {
    fs.unlinkSync(EARNINGS_FILE);
  }
  clearCache();
}

module.exports = {
  getEarnings,
  saveEarnings,
  getCache,
  setCache,
  isCacheValid,
  clearCache,
  clearAll
};
