# Books API Week 02 Spec - Version 2

## Feature 1: Book CRUD Operations and Author References

### Goal

Extend the Week 01 Books API to support creating, reading, updating, and deleting books. Each book must reference an existing author by custom ID. All routes must be documented and testable through Swagger at `/api-docs`.

### Data Model

Books are stored in the `books` collection.

Required fields:
- `id`: non-empty string and unique custom ID, such as `b1`.
- `authorId`: non-empty string matching an existing author's custom `id`.
- `title`: non-empty string.
- `publicationDate`: valid date string in `YYYY-MM-DD` format.

Book routes use the custom `id`, not MongoDB `_id`.

### Validation and Relationship Rules

- Reject missing, blank, or incorrectly typed required fields with `400 Bad Request`.
- Validate that `publicationDate` is a real calendar date in the required format.
- Reject duplicate book IDs with `400 Bad Request`.
- Before creating or updating a book, verify that its `authorId` belongs to an existing author. Otherwise, return `400 Bad Request`.
- Do not accept unexpected fields that are not part of the defined data model.
- Do not expose database errors, stack traces, or sensitive configuration details to API clients.

### Routes

#### GET /books

Return all books.

Success:
- `200 OK`
- JSON array of book objects.

Errors:
- `500 Internal Server Error` for unexpected errors, with a safe response message.

#### GET /books/:id

Return one book by custom ID.

Success:
- `200 OK`
- JSON object representing the matching book.

Errors:
- `404 Not Found` if the book does not exist.
- `500 Internal Server Error` for unexpected errors.

#### POST /books

Create a book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- `201 Created`
- JSON object containing the newly created book.

Errors:
- `400 Bad Request` for missing or invalid fields, a duplicate ID, or a nonexistent author.
- `500 Internal Server Error` for unexpected errors.

#### PUT /books/:id

Replace the editable fields of an existing book. The URL ID identifies the book; the body must contain `authorId`, `title`, and `publicationDate`. The body must not change the book's custom ID.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- `200 OK`
- JSON object containing the updated book.

Errors:
- `400 Bad Request` for missing or invalid fields or a nonexistent author.
- `404 Not Found` if the book does not exist.
- `500 Internal Server Error` for unexpected errors.

The implementation must confirm the update succeeded and retrieve the updated document for the response.

#### DELETE /books/:id

Delete a book by custom ID.

Success:
- `204 No Content`
- No response body.

Errors:
- `404 Not Found` if the book does not exist.
- `500 Internal Server Error` for unexpected errors.

### Swagger Documentation

Document all five book routes, their parameters, request bodies, response schemas, status codes, and error responses. All routes must be testable through `/api-docs`.

### Deployment Expectations

Test all book routes locally and on Render. Verify that the deployed `/api-docs` page documents and allows testing of the routes.

---

## Feature 2: Author CRUD Operations

### Goal

Create an `authors` collection and implement all CRUD operations. Every author route must be documented and testable through Swagger.

### Data Model

Authors are stored in the `authors` collection.

Required fields:
- `id`: non-empty string and unique custom ID, such as `a1`.
- `name`: non-empty string.
- `birthYear`: valid integer representing the author's birth year.

Author routes use the custom `id`, not MongoDB `_id`.

### Validation and Relationship Rules

- Reject missing, blank, or incorrectly typed required fields with `400 Bad Request`.
- Validate that `birthYear` is an integer representing a plausible year.
- Reject duplicate author IDs with `400 Bad Request`.
- Do not accept unexpected fields that are not part of the defined data model.
- Do not expose internal database errors or stack traces to clients.

### Relationship to Books

Each book references an author through `authorId`, which must match an existing author's custom `id`.

An author cannot be deleted while any books reference that author. Return `409 Conflict` with a safe, helpful message. The client must delete or reassign the related books before retrying the author deletion.

### Routes

#### GET /authors

Return all authors.

Success:
- `200 OK`
- JSON array of author objects.

Errors:
- `500 Internal Server Error` for unexpected errors.

#### GET /authors/:id

Return one author by custom ID.

Success:
- `200 OK`
- JSON object representing the matching author.

Errors:
- `404 Not Found` if the author does not exist.
- `500 Internal Server Error` for unexpected errors.

#### POST /authors

Create an author.

Request body:

    {
      "id": "a1",
      "name": "J. R. R. Tolkien",
      "birthYear": 1892
    }

Success:
- `201 Created`
- JSON object containing the newly created author.

Errors:
- `400 Bad Request` for missing or invalid fields or a duplicate ID.
- `500 Internal Server Error` for unexpected errors.

#### PUT /authors/:id

Replace the editable fields of an existing author. The URL ID identifies the author; the body must contain `name` and `birthYear`. The body must not change the custom ID.

Request body:

    {
      "name": "Updated Author Name",
      "birthYear": 1892
    }

Success:
- `200 OK`
- JSON object containing the updated author.

Errors:
- `400 Bad Request` for missing or invalid fields.
- `404 Not Found` if the author does not exist.
- `500 Internal Server Error` for unexpected errors.

The implementation must confirm the update succeeded and retrieve the updated document for the response.

#### DELETE /authors/:id

Delete an author only if no books reference that author.

Success:
- `204 No Content`
- No response body.

Errors:
- `404 Not Found` if the author does not exist.
- `409 Conflict` if one or more books reference the author.
- `500 Internal Server Error` for unexpected errors.

### Swagger Documentation

Document all five author routes, their parameters, request bodies, response schemas, status codes, and error responses. All routes must be testable through `/api-docs`.

### Deployment Expectations

Test all author routes locally and on Render. Verify that the deployed `/api-docs` page documents and allows testing of the routes.
