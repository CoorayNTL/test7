const request = require('supertest');
const express = require('express');
const itemsRouter = require('../routes/items');
const fs = require('fs').promises;
const path = require('path');
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

const mockData = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
    { id: 3, name: 'Ultra-Wide Monitor', category: 'Electronics', price: 999 },
    { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
    { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
];

describe('Items API', () => {
    beforeEach(async () => {
        await fs.writeFile(DATA_PATH, JSON.stringify(mockData, null, 2));
    });

    afterEach(async () => {
        await fs.writeFile(DATA_PATH, JSON.stringify(mockData, null, 2));
    });

    describe('GET /api/items', () => {
        it('should return all items', async () => {
            const res = await request(app).get('/api/items');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData);
        });

        it('should filter items by query', async () => {
            const res = await request(app).get('/api/items?q=laptop');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockData[0]]);
        });

        it('should limit results', async () => {
            const res = await request(app).get('/api/items?limit=2');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData.slice(0, 2));
        });

        it('should handle pagination', async () => {
            const res = await request(app).get('/api/items?limit=2&page=2');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData.slice(2, 4));
        });

        it('should return 400 for invalid limit', async () => {
            const res = await request(app).get('/api/items?limit=0');
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid limit or page parameter');
        });

        it('should return 400 for invalid page', async () => {
            const res = await request(app).get('/api/items?page=0');
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid limit or page parameter');
        });
    });

    describe('GET /api/items/:id', () => {
        it('should return item by id', async () => {
            const res = await request(app).get('/api/items/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData[0]);
        });

        it('should return 404 for non-existent item', async () => {
            const res = await request(app).get('/api/items/999');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Item not found');
        });

        it('should return 400 for invalid id', async () => {
            const res = await request(app).get('/api/items/invalid');
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid item ID');
        });
    });

    describe('POST /api/items', () => {
        it('should create a new item', async () => {
            const newItem = {
                name: 'Wireless Mouse',
                category: 'Electronics',
                price: 49,
            };
            const res = await request(app).post('/api/items').send(newItem);
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject(newItem);
            expect(res.body.id).toBeDefined();

            const items = await fs.readFile(DATA_PATH, 'utf8').then(JSON.parse);
            expect(items).toContainEqual(res.body);
        });

        it('should return 400 for invalid payload', async () => {
            const res = await request(app).post('/api/items').send({ name: 'Test' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid payload: name, category, and price (number, non-negative) are required');
        });

        it('should return 400 for negative price', async () => {
            const res = await request(app).post('/api/items').send({
                name: 'Test Item',
                category: 'Electronics',
                price: -10,
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid payload: name, category, and price (number, non-negative) are required');
        });
    });
});