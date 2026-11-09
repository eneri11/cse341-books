
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

const sampleAuthors = [
    { id: 'a1', name: 'Maya Rivera', birthYear: 1985 },
    { id: 'a2', name: 'Daniel Brooks', birthYear: 1978 },
    { id: 'a3', name: 'Sofia Bennett', birthYear: 1990 }
];

const sampleBooks = [
    {
        id: 'b1',
        authorId: 'a1',
        title: 'Patterns of Light',
        publicationDate: '2021-08-17'
    },
    {
        id: 'b2',
        authorId: 'a2',
        title: 'The Mountain Path',
        publicationDate: '2023-04-12'
    },
    {
        id: 'b3',
        authorId: 'a3',
        title: 'Beyond the Shore',
        publicationDate: '2020-11-05'
    }
];


function createFakeDatabase(
    books = sampleBooks,
    authors = sampleAuthors
) {
    const bookRecords = books.map((book) => {
        return { ...book };
    });

    const authorRecords = authors.map((author) => {
        return { ...author };
    });

    return {
        collection(name) {
            if (name === 'books') {
                return {
                    find() {
                        return {
                            toArray: async () => {
                                return bookRecords;
                            }
                        };
                    },

                    findOne: async ({ id }) => {
                        return bookRecords.find((book) => {
                            return book.id === id;
                        }) ?? null;
                    },

                    insertOne: async (book) => {
                        bookRecords.push(book);
                        return { acknowledged: true };
                    },

                    updateOne: async (filter, update) => {
                        const book = bookRecords.find((record) => {
                            return record.id === filter.id;
                        });

                        if (!book) {
                            return {
                                matchedCount: 0,
                                modifiedCount: 0
                            };
                        }

                        Object.assign(book, update.$set);

                        return {
                            matchedCount: 1,
                            modifiedCount: 1
                        };
                    },

                    deleteOne: async (filter) => {
                        const index = bookRecords.findIndex((record) => {
                            return record.id === filter.id;
                        });

                        if (index === -1) {
                            return { deletedCount: 0 };
                        }

                        bookRecords.splice(index, 1);

                        return { deletedCount: 1 };
                    }
                };
            }

            if (name === 'authors') {
                return {
                    findOne: async ({ id }) => {
                        return authorRecords.find((author) => {
                            return author.id === id;
                        }) ?? null;
                    }
                };
            }

            throw new Error(`Unexpected collection: ${name}`);
        }
    };
}


async function withServer(app, callback) {
    const server = app.listen(0, '127.0.0.1');

    await once(server, 'listening');

    try {
        const address = server.address();
        const baseUrl = `http://127.0.0.1:${address.port}`;

        await callback(baseUrl);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

test('GET /books returns all books with status 200', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`);
        const books = await response.json();

        assert.equal(response.status, 200);
        assert.equal(
            response.headers.get('content-type').includes(
                'application/json'
            ),
            true
        );
        assert.equal(books.length, 3);

        for (const book of books) {
            assert.ok(book.id);
            assert.ok(book.authorId);
            assert.ok(book.title);
            assert.match(book.publicationDate, /^\d{4}-\d{2}-\d{2}$/);
        }
    });
});

test('GET /books/:id returns a matching book with status 200', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`);
        const book = await response.json();

        assert.equal(response.status, 200);
        assert.equal(book.id, 'b2');
        assert.equal(book.title, 'The Mountain Path');
        assert.equal(book.authorId, 'a2');
    });
});

test('GET /books/:id returns 404 when the book does not exist', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b999`);
        const result = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(result, {
            message: 'Book not found'
        });
    });
});

test('POST /books creates a valid book with status 201', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const newBook = {
        id: 'b4',
        authorId: 'a1',
        title: 'A New Beginning',
        publicationDate: '2024-06-15'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook)
        });

        const result = await response.json();

        assert.equal(response.status, 201);
        assert.deepEqual(result, newBook);

        const savedResponse = await fetch(`${baseUrl}/books/b4`);
        const savedBook = await savedResponse.json();

        assert.equal(savedResponse.status, 200);
        assert.deepEqual(savedBook, newBook);
    });
});

test('POST /books rejects a duplicate ID with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'b1',
                authorId: 'a1',
                title: 'Duplicate Book',
                publicationDate: '2024-06-15'
            })
        });

        assert.equal(response.status, 400);
        assert.equal(
            (await response.json()).message,
            'A book with this ID already exists'
        );
    });
});

test('POST /books rejects a missing author with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'b4',
                authorId: 'a999',
                title: 'Unknown Author Book',
                publicationDate: '2024-06-15'
            })
        });

        assert.equal(response.status, 400);
        assert.equal(
            (await response.json()).message,
            'The specified author does not exist'
        );
    });
});

test('POST /books rejects an invalid calendar date with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'b4',
                authorId: 'a1',
                title: 'Invalid Date Book',
                publicationDate: '2024-02-30'
            })
        });

        assert.equal(response.status, 400);
    });
});

test('POST /books rejects unexpected fields with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'b4',
                authorId: 'a1',
                title: 'Unexpected Field Book',
                publicationDate: '2024-06-15',
                extraField: 'not allowed'
            })
        });

        assert.equal(response.status, 400);
        assert.equal(
            (await response.json()).message,
            'Unexpected fields are not allowed'
        );
    });
});


test('PUT /books/:id updates a book with status 200', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const updatedBook = {
        authorId: 'a2',
        title: 'The Updated Mountain Path',
        publicationDate: '2024-05-20'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });

        const result = await response.json();

        assert.equal(response.status, 200);
        assert.deepEqual(result, {
            id: 'b2',
            ...updatedBook
        });

        const savedResponse = await fetch(`${baseUrl}/books/b2`);
        const savedBook = await savedResponse.json();

        assert.equal(savedResponse.status, 200);
        assert.deepEqual(savedBook, {
            id: 'b2',
            ...updatedBook
        });
    });
});


test('PUT /books/:id returns 404 when the book does not exist', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const updatedBook = {
        authorId: 'a2',
        title: 'A Book That Does Not Exist',
        publicationDate: '2024-05-20'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/missing-book`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });

        const result = await response.json();

        assert.equal(response.status, 404);
        assert.equal(result.message, 'Book not found');
    });
});

test('DELETE /books/:id deletes a book with status 204', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`, {
            method: 'DELETE'
        });

        assert.equal(response.status, 204);
        assert.equal(await response.text(), '');

        const savedResponse = await fetch(`${baseUrl}/books/b2`);

        assert.equal(savedResponse.status, 404);
    });
});

test('DELETE /books/:id returns 404 when the book does not exist', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/missing-book`, {
            method: 'DELETE'
        });

        const result = await response.json();

        assert.equal(response.status, 404);
        assert.equal(result.message, 'Book not found');
    });
});


test('PUT /books/:id rejects a missing author with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const updatedBook = {
        authorId: 'missing-author',
        title: 'The Updated Mountain Path',
        publicationDate: '2024-05-20'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.equal(
            result.message,
            'The specified author does not exist'
        );
    });
});

test('PUT /books/:id rejects unexpected fields with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const updatedBook = {
        authorId: 'a2',
        title: 'The Updated Mountain Path',
        publicationDate: '2024-05-20',
        extraField: 'not allowed'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });

        assert.equal(response.status, 400);
    });
});

test('PUT /books/:id rejects an invalid date with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    const updatedBook = {
        authorId: 'a2',
        title: 'The Updated Mountain Path',
        publicationDate: '2024-02-30'
    };

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });

        assert.equal(response.status, 400);
    });
});
