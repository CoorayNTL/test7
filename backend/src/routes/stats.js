const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let statsCache = null;

// Load and cache stats
async function loadStats() {
  try {
    const items = await fs.readFile(DATA_PATH, 'utf8').then(JSON.parse);
    if (!Array.isArray(items)) {
      throw new Error('Data file is not an array');
    }
    statsCache = {
      total: items.length,
      averagePrice: items.length ? mean(items.map(item => item.price)) : 0,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('Failed to load stats:', err.message);
    statsCache = { total: 0, averagePrice: 0, timestamp: Date.now() };
  }
}

// Initialize cache
loadStats();

fs.watch(DATA_PATH, (eventType) => { // Watch for changes in the data file 
  if (eventType === 'change') {
    console.log('Items file changed, updating stats cache');
    loadStats();
  }
});

// GET /api/stats - Cached stats
router.get('/', async (req, res, next) => {
  try {
    if (!statsCache) {
      await loadStats();
    }
    res.json({
      total: statsCache.total,
      averagePrice: statsCache.averagePrice,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;