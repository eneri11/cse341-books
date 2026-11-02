
import { getAllBooks, getBookById } from '../models/books.js';

// Handle GET /books
const getBooksHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const books = await getAllBooks(getDatabase);

            return res.status(200).json(books);
        } catch (error) {
            console.error('GET /books failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

// Handle GET /books/:id
const getBookByIdHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const book = await getBookById(req.params.id, getDatabase);

            if (!book) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            return res.status(200).json(book);
        } catch (error) {
            console.error('GET /books/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

export { getBooksHandler, getBookByIdHandler };
