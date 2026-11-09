
import { getDb } from '../db/connect.js';

// Get all authors
const getAllAuthors = async (getDatabase = getDb) => {
    const db = getDatabase();
    const authors = await db.collection('authors').find({}).toArray();

    return authors;
};

// Get one author by custom ID
const getAuthorById = async (authorId, getDatabase = getDb) => {
    const db = getDatabase();
    const author = await db.collection('authors').findOne({
        id: authorId
    });

    return author;
};

// Create an author
const createAuthor = async (author, getDatabase = getDb) => {
    const db = getDatabase();

    await db.collection('authors').insertOne(author);

    return author;
};

// Update an author's name and birth year
const updateAuthor = async (
    authorId,
    authorData,
    getDatabase = getDb
) => {
    const db = getDatabase();

    const result = await db.collection('authors').updateOne(
        { id: authorId },
        { $set: authorData }
    );

    return result;
};

// Delete an author
const deleteAuthor = async (authorId, getDatabase = getDb) => {
    const db = getDatabase();

    const result = await db.collection('authors').deleteOne({
        id: authorId
    });

    return result;
};

export {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor
};
