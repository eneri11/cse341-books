
import express from 'express';
import {
    getBooksHandler,
    getBookByIdHandler
} from './controllers/books.js';

const createRouter = (getDatabase) => {
    const router = express.Router();

    // Get all books
    router.get('/books', getBooksHandler(getDatabase));

    // Get one book by ID
    router.get('/books/:id', getBookByIdHandler(getDatabase));

    return router;
};

export default createRouter;
