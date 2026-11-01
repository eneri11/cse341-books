
import express from 'express';
import { getDb } from './src/db/connect.js';

const app = express();

app.use(express.json());

// Homepage route
app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Server is running' });
});

// Get all books
app.get('/books', async (req, res) => {
    try {
        const db = getDb();
        const books = await db.collection('books').find({}).toArray();

        return res.status(200).json(books);
    } catch (error) {
        console.error('Error retrieving books:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Get one book by its custom ID
app.get('/books/:id', async (req, res) => {
    try {
        const db = getDb();
        const book = await db.collection('books').findOne({
            id: req.params.id
        });

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('Error retrieving book:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

export default app;
