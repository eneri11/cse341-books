
import { getDb } from '../db/connect.js';

const getAllBooks = async (getDatabase = getDb) => {
    const db = getDatabase();
    const books = await db.collection('books').find({}).toArray();

    return books;
};

const getBookById = async (bookId, getDatabase = getDb) => {
    const db = getDatabase();
    const book = await db.collection('books').findOne({ id: bookId });

    return book;
};

export { getAllBooks, getBookById };
