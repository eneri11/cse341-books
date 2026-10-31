
import express from 'express';
import { getDb } from './src/db/connect.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Server is running' });
});

// Temporary MongoDB connection test
app.get('/db-test', async (req, res) => {
    try {
        const db = getDb();
        const collections = await db.listCollections().toArray();

        return res.status(200).json({
            message: 'MongoDB connection successful',
            database: db.databaseName,
            collections: collections.map((collection) => {
                return collection.name;
            }),
        });
    } catch (error) {
        console.error('MongoDB test failed:', error.message);

        return res.status(500).json({
            message: 'MongoDB connection test failed',
        });
    }
});

export default app;
