
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

const sampleAuthors = [
    { id: 'a1', name: 'Maya Rivera', birthYear: 1985 },
    { id: 'a2', name: 'Daniel Brooks', birthYear: 1978 },
    { id: 'a3', name: 'Sofia Bennett', birthYear: 1990 }
];


function createFakeDatabase(authors = sampleAuthors, books = []) {
    const authorRecords = authors.map((author) => { return { ...author } });
    const bookRecords = books.map((book) => { return { ...book } });

    return {
        collection(name) {
            if (name === 'authors') {
                return {
                    find() {
                        return {
                            toArray: async () => { return authorRecords }
                        };
                    },

                    findOne: async ({ id }) => {
                        return authorRecords.find(
                            (author) => { return author.id === id }
                        ) ?? null;
                    },

                    insertOne: async (author) => {
                        authorRecords.push({ ...author });

                        return { acknowledged: true };
                    },

                    updateOne: async (filter, update) => {
                        const author = authorRecords.find(
                            (item) => { return item.id === filter.id }
                        );

                        if (!author) {
                            return {
                                matchedCount: 0,
                                modifiedCount: 0
                            };
                        }

                        Object.assign(author, update.$set);

                        return {
                            matchedCount: 1,
                            modifiedCount: 1
                        };
                    },

                    deleteOne: async (filter) => {
                        const index = authorRecords.findIndex(
                            (author) => { return author.id === filter.id }
                        );

                        if (index === -1) {
                            return { deletedCount: 0 };
                        }

                        authorRecords.splice(index, 1);

                        return { deletedCount: 1 };
                    }
                };
            }

            if (name === 'books') {
                return {
                    findOne: async ({ authorId }) => {
                        return bookRecords.find(
                            (book) => { return book.authorId === authorId }
                        ) ?? null;
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

test('GET /authors returns all authors with status 200', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`);
        const authors = await response.json();

        assert.equal(response.status, 200);
        assert.equal(authors.length, 3);
        assert.equal(authors[0].id, 'a1');
        assert.equal(authors[0].name, 'Maya Rivera');
    });
});

test('GET /authors/:id returns a matching author with status 200', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a2`);
        const author = await response.json();

        assert.equal(response.status, 200);
        assert.equal(author.id, 'a2');
        assert.equal(author.name, 'Daniel Brooks');
        assert.equal(author.birthYear, 1978);
    });
});

test('GET /authors/:id returns 404 when the author does not exist', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a999`);
        const result = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(result, {
            message: 'Author not found'
        });
    });
});

test('POST /authors creates a valid author with status 201', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'a4',
                name: 'Alex Morgan',
                birthYear: 1988
            })
        });

        const author = await response.json();

        assert.equal(response.status, 201);
        assert.deepEqual(author, {
            id: 'a4',
            name: 'Alex Morgan',
            birthYear: 1988
        });
    });
});


test('POST /authors rejects a blank name with status 400', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'a4',
                name: '   ',
                birthYear: 1988
            })
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(result, {
            message: 'Invalid author data'
        });
    });
});


test('POST /authors rejects a duplicate ID with status 400', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'a1',
                name: 'Another Author',
                birthYear: 1988
            })
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(result, {
            message: 'Author ID already exists'
        });
    });
});


test('PUT /authors/:id updates an author with status 200', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a1`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Maya Updated',
                birthYear: 1986
            })
        });

        const author = await response.json();

        assert.equal(response.status, 200);
        assert.deepEqual(author, {
            id: 'a1',
            name: 'Maya Updated',
            birthYear: 1986
        });
    });
});


test('PUT /authors/:id rejects a blank name with status 400', async () => {
    const app = createApp(() => { return createFakeDatabase() });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a1`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: '   ',
                birthYear: 1986
            })
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(result, {
            message: 'Invalid author data'
        });
    });
});

test('DELETE /authors/:id deletes an author with status 204', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a1`, {
            method: 'DELETE'
        });

        assert.equal(response.status, 204);
        assert.equal(await response.text(), '');

        const getResponse = await fetch(`${baseUrl}/authors/a1`);

        assert.equal(getResponse.status, 404);
    });
});

test('DELETE /authors/:id returns 409 when the author has books', async () => {
    const database = createFakeDatabase(
        sampleAuthors,
        [
            {
                id: 'b1',
                authorId: 'a1',
                title: 'Example Book',
                publicationDate: '2020-01-01'
            }
        ]
    );

    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a1`, {
            method: 'DELETE'
        });

        const result = await response.json();

        assert.equal(response.status, 409);
        assert.deepEqual(result, {
            message: 'Cannot delete an author who has books'
        });

        const getResponse = await fetch(`${baseUrl}/authors/a1`);

        assert.equal(getResponse.status, 200);
    });
});


test('PUT /authors/:id returns 404 when the author does not exist', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a99`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Unknown Author',
                birthYear: 1988
            })
        });

        const result = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(result, {
            message: 'Author not found'
        });
    });
});


test('DELETE /authors/:id returns 404 when the author does not exist', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors/a99`, {
            method: 'DELETE'
        });

        const result = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(result, {
            message: 'Author not found'
        });
    });
});


test('POST /authors rejects unexpected fields with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'a4',
                name: 'Alex Morgan',
                birthYear: 1988,
                nickname: 'Alex'
            })
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(result, {
            message: 'Invalid author data'
        });
    });
});


test('POST /authors rejects a future birth year with status 400', async () => {
    const database = createFakeDatabase();
    const app = createApp(() => { return database });
    const futureYear = new Date().getFullYear() + 1;

    await withServer(app, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'a4',
                name: 'Alex Morgan',
                birthYear: futureYear
            })
        });

        const result = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(result, {
            message: 'Invalid author data'
        });
    });
});
