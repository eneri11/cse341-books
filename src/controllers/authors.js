
import {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor
} from '../models/authors.js';

const isValidBirthYear = (year) => {
    const currentYear = new Date().getFullYear();

    return Number.isInteger(year) && year >= 0 && year <= currentYear;
};

const hasOnlyFields = (body, allowedFields) => {
    return Object.keys(body).every((key) => {
        return allowedFields.includes(key);
    });
};

// GET /authors
const getAuthorsHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const authors = await getAllAuthors(getDatabase);

            return res.status(200).json(authors);
        } catch (error) {
            console.error('GET /authors failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

// GET /authors/:id
const getAuthorByIdHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const author = await getAuthorById(
                req.params.id,
                getDatabase
            );

            if (!author) {
                return res.status(404).json({
                    message: 'Author not found'
                });
            }

            return res.status(200).json(author);
        } catch (error) {
            console.error('GET /authors/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

// POST /authors
const createAuthorHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const { id, name, birthYear } = req.body;

            if (
                !hasOnlyFields(req.body, ['id', 'name', 'birthYear']) ||
                typeof id !== 'string' ||
                !id.trim() ||
                typeof name !== 'string' ||
                !name.trim() ||
                !isValidBirthYear(birthYear)
            ) {
                return res.status(400).json({
                    message: 'Invalid author data'
                });
            }

            const existing = await getAuthorById(id, getDatabase);

            if (existing) {
                return res.status(400).json({
                    message: 'Author ID already exists'
                });
            }

            const author = {
                id: id.trim(),
                name: name.trim(),
                birthYear
            };

            await createAuthor(author, getDatabase);

            return res.status(201).json(author);
        } catch (error) {
            console.error('POST /authors failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

// PUT /authors/:id
const updateAuthorHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const { name, birthYear } = req.body;

            if (
                !hasOnlyFields(req.body, ['name', 'birthYear']) ||
                typeof name !== 'string' ||
                !name.trim() ||
                !isValidBirthYear(birthYear)
            ) {
                return res.status(400).json({
                    message: 'Invalid author data'
                });
            }

            const existing = await getAuthorById(
                req.params.id,
                getDatabase
            );

            if (!existing) {
                return res.status(404).json({
                    message: 'Author not found'
                });
            }

            await updateAuthor(
                req.params.id,
                { name: name.trim(), birthYear },
                getDatabase
            );

            return res.status(200).json({
                id: req.params.id,
                name: name.trim(),
                birthYear
            });
        } catch (error) {
            console.error('PUT /authors/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

// DELETE /authors/:id
const deleteAuthorHandler = (getDatabase) => {
    return async (req, res) => {
        try {
            const existing = await getAuthorById(
                req.params.id,
                getDatabase
            );

            if (!existing) {
                return res.status(404).json({
                    message: 'Author not found'
                });
            }

            const db = getDatabase();
            const book = await db.collection('books').findOne({
                authorId: req.params.id
            });

            if (book) {
                return res.status(409).json({
                    message: 'Cannot delete an author who has books'
                });
            }

            const result = await deleteAuthor(req.params.id, getDatabase);

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Author not found'
                });
            }

            return res.status(204).end();
        } catch (error) {
            console.error('DELETE /authors/:id failed:', error.message);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

export {
    getAuthorsHandler,
    getAuthorByIdHandler,
    createAuthorHandler,
    updateAuthorHandler,
    deleteAuthorHandler
};
