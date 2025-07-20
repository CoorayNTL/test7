const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue) - fixed to async
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error('Data file is not an array');
    }
    return data;
  } catch (err) {
    console.error('Failed to read data:', err.message);
    if (err.code === 'ENOENT') {
      throw new Error('Data file not found');
    }
    throw new Error('Unable to read data file');
  }
}

// GET /api/items
router.get('/',async (req, res, next) => {
  try {
    const { q = '', limit = 10, page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    if (isNaN(parsedLimit) || parsedLimit < 1 || isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ message: 'Invalid limit or page parameter' });
    }
    const items = await readData();
    
    // Filter items by query
    const filteredItems = q
      ? items.filter(item => item.name.toLowerCase().includes(q.toLowerCase()))
      : items;
    
    // Paginate
    const start = (parsedPage - 1) * parsedLimit;
    const paginatedItems = filteredItems.slice(start, start + parsedLimit);
    
    res.json(paginatedItems);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    const items = await readData();
    const item = items.find(i => i.id === id);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;
    //Valiidate payload (intentional omission)
    if (!name || !category || typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        message: 'Invalid payload: name, category, and price (number, non-negative) are required',
      });
    }
    const items = await readData();
    const newItem = {
      id: Date.now(),
      name,
      category,
      price,
    };
    items.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;