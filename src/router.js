
import express from 'express';

import {
    getBooksHandler,
    getBookByIdHandler,
    createBookHandler,
    updateBookHandler,
    deleteBookHandler
} from './controllers/books.js';

import {
    getAuthorsHandler,
    getAuthorByIdHandler,
    createAuthorHandler,
    updateAuthorHandler,
    deleteAuthorHandler
} from './controllers/authors.js';

const createRouter = (getDatabase) => {
    const router = express.Router();

    // Books routes
    router.get('/books', getBooksHandler(getDatabase));
    router.get('/books/:id', getBookByIdHandler(getDatabase));
    router.post('/books', createBookHandler(getDatabase));
    router.put('/books/:id', updateBookHandler(getDatabase));
    router.delete('/books/:id', deleteBookHandler(getDatabase));
    // Authors routes
    router.get('/authors', getAuthorsHandler(getDatabase));
    router.get('/authors/:id', getAuthorByIdHandler(getDatabase));
    router.post('/authors', createAuthorHandler(getDatabase));
    router.put('/authors/:id', updateAuthorHandler(getDatabase));
    router.delete('/authors/:id', deleteAuthorHandler(getDatabase));

    return router;
};

export default createRouter;
