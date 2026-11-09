
import { getDb } from '../db/connect.js';

// Get all books


const getAllBooks = async (getDatabase = getDb) => {
    const db = getDatabase();
    const books = await db.collection('books').find({}).toArray();

    return books.map(({ id, authorId, title, publicationDate }) => {
        return {
            id,
            authorId,
            title,
            publicationDate
        };
    });
};

// Get one book by custom ID

const getBookById = async (bookId, getDatabase = getDb) => {
    const db = getDatabase();
    const book = await db.collection('books').findOne({
        id: bookId
    });

    if (!book) {
        return null;
    }

    const { id, authorId, title, publicationDate } = book;

    return {
        id,
        authorId,
        title,
        publicationDate
    };
};


// Create a book
const createBook = async (book, getDatabase = getDb) => {
    const db = getDatabase();

    await db.collection('books').insertOne(book);

    return book;
};

// Update a book by custom ID
const updateBook = async (
    bookId,
    updatedBook,
    getDatabase = getDb
) => {
    const db = getDatabase();

    const result = await db.collection('books').updateOne(
        { id: bookId },
        { $set: updatedBook }
    );

    return result;
};

// Delete a book by custom ID
const deleteBook = async (bookId, getDatabase = getDb) => {
    const db = getDatabase();

    const result = await db.collection('books').deleteOne({
        id: bookId
    });

    return result;
};

export {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
