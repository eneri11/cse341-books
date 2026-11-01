
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

const sampleBooks = [
    {
        id: 'b1',
        author: 'Maya Rivera',
        title: 'Patterns of Light',
        publicationDate: '2021-08-17'
    },
    {
        id: 'b2',
        author: 'Daniel Brooks',
        title: 'The Mountain Path',
        publicationDate: '2023-04-12'
    },
    {
        id: 'b3',
        author: 'Sofia Bennett',
        title: 'Beyond the Shore',
        publicationDate: '2020-11-05'
    }
];

function createFakeDatabase(books = sampleBooks) {
    return {
        collection(name) {
            assert.equal(name, 'books');

            return {
                find() {
                    return {
                        toArray: async () => {return books}
                    };
                },

                findOne: async ({ id }) =>
                    {return books.find((book) => {return book.id === id}) ?? null}
            };
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
    const app = createApp(() => {return createFakeDatabase()});

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books`);
        const books = await response.json();

        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type').includes('application/json'), true);
        assert.equal(books.length, 3);

        for (const book of books) {
            assert.ok(book.id);
            assert.ok(book.author);
            assert.ok(book.title);
            assert.match(book.publicationDate, /^\d{4}-\d{2}-\d{2}$/);
        }
    });
});

test('GET /books/:id returns a matching book with status 200', async () => {
    const app = createApp(() => {return createFakeDatabase()});

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b2`);
        const book = await response.json();

        assert.equal(response.status, 200);
        assert.equal(book.id, 'b2');
        assert.equal(book.title, 'The Mountain Path');
        assert.equal(book.author, 'Daniel Brooks');
    });
});

test('GET /books/:id returns 404 when the book does not exist', async () => {
    const app = createApp(() => {return createFakeDatabase()});

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/books/b999`);
        const result = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(result, {
            message: 'Book not found'
        });
    });
});
