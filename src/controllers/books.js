
import {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} from '../models/books.js';

// Check that a publication date is a real YYYY-MM-DD date
const isValidPublicationDate = (date) => {
    if (
        typeof date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

// Check that the request contains only permitted fields
const hasOnlyFields = (body, allowedFields) => {
    return Object.keys(body).every((field) => {
        return allowedFields.includes(field);
    });
};

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
            const book = await getBookById(
                req.params.id,
                getDatabase
            );

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

// Handle POST /books
const createBookHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const { body } = req;

            if (
                !body ||
                typeof body !== 'object' ||
                Array.isArray(body)
            ) {
                return res.status(400).json({
                    message: 'A valid book object is required'
                });
            }

            const allowedFields = [
                'id',
                'authorId',
                'title',
                'publicationDate'
            ];

            if (!hasOnlyFields(body, allowedFields)) {
                return res.status(400).json({
                    message: 'Unexpected fields are not allowed'
                });
            }

            const { id, authorId, title, publicationDate } = body;

            if (
                typeof id !== 'string' ||
                !id.trim() ||
                typeof authorId !== 'string' ||
                !authorId.trim() ||
                typeof title !== 'string' ||
                !title.trim() ||
                !isValidPublicationDate(publicationDate)
            ) {
                return res.status(400).json({
                    message:
                        'Provide a valid id, authorId, title, and publicationDate in YYYY-MM-DD format'
                });
            }

            const db = getDatabase();

            const existingBook = await db.collection('books').findOne({
                id: id.trim()
            });

            if (existingBook) {
                return res.status(400).json({
                    message: 'A book with this ID already exists'
                });
            }

            const existingAuthor = await db
                .collection('authors')
                .findOne({
                    id: authorId.trim()
                });

            if (!existingAuthor) {
                return res.status(400).json({
                    message: 'The specified author does not exist'
                });
            }

            const book = {
                id: id.trim(),
                authorId: authorId.trim(),
                title: title.trim(),
                publicationDate
            };

            await createBook(book, getDatabase);

            return res.status(201).json(book);
        } catch (error) {
            console.error('POST /books failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};


const updateBookHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const { id } = req.params;
            const { body } = req;

            if (
                !body ||
                typeof body !== 'object' ||
                Array.isArray(body)
            ) {
                return res.status(400).json({
                    message: 'A valid book object is required'
                });
            }

            const allowedFields = [
                'authorId',
                'title',
                'publicationDate'
            ];

            if (!hasOnlyFields(body, allowedFields)) {
                return res.status(400).json({
                    message: 'Unexpected fields are not allowed'
                });
            }

            const { authorId, title, publicationDate } = body;

            if (
                typeof authorId !== 'string' ||
                !authorId.trim() ||
                typeof title !== 'string' ||
                !title.trim() ||
                !isValidPublicationDate(publicationDate)
            ) {
                return res.status(400).json({
                    message:
                        'Provide a valid authorId, title, and publicationDate in YYYY-MM-DD format'
                });
            }

            const db = getDatabase();

            const existingBook = await db.collection('books').findOne({
                id
            });

            if (!existingBook) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            const existingAuthor = await db.collection('authors').findOne({
                id: authorId.trim()
            });

            if (!existingAuthor) {
                return res.status(400).json({
                    message: 'The specified author does not exist'
                });
            }

            const updatedBook = {
                authorId: authorId.trim(),
                title: title.trim(),
                publicationDate
            };

            const result = await updateBook(id, updatedBook, getDatabase);

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            const savedBook = await db.collection('books').findOne({ id });

            return res.status(200).json({
                id: savedBook.id,
                authorId: savedBook.authorId,
                title: savedBook.title,
                publicationDate: savedBook.publicationDate
            });

        } catch (error) {
            console.error('PUT /books/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};


const deleteBookHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const { id } = req.params;

            const result = await deleteBook(id, getDatabase);

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            return res.status(204).end();
        } catch (error) {
            console.error('DELETE /books/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

export {
    getBooksHandler,
    getBookByIdHandler,
    createBookHandler,
    updateBookHandler,
    deleteBookHandler
};
