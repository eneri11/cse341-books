# CSE 341 Books API

A REST API built with Node.js, Express, and MongoDB Atlas.

## Deployment

The application is deployed on Render.

**Live URL:** https://cse341-books-ks1x.onrender.com

## Database Setup

The application uses MongoDB Atlas for storing book records.

- **Database name:** `cse341-books-db`
- **Collection name:** `books`

Each book document contains these fields:

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique book identifier, such as `b1` |
| `author` | String | Book author's name |
| `title` | String | Book title |
| `publicationDate` | String | Publication date in `YYYY-MM-DD` format |

The MongoDB Node.js driver connects to the database using the environment variables below. The application connects to MongoDB before starting the server.

## Environment Variables

Configure these environment variables in your local `.env` file and your deployment environment:

- `MONGODB_URI` - MongoDB Atlas connection string.
- `MONGODB_DB_NAME` - Database name, `cse341-books-db`.

Keep your database credentials private. Never commit your `.env` file or connection string to GitHub.

## API Endpoints

### Get All Books

- **Method:** `GET`
- **Endpoint:** `/books`
- **Live URL:** https://cse341-books-ks1x.onrender.com/books
- **Expected response:** `200 OK` with an array of books.

### Get One Book

- **Method:** `GET`
- **Endpoint:** `/books/:id`
- **Example:** https://cse341-books-ks1x.onrender.com/books/b2
- **Expected response:** `200 OK` with one book when the ID exists.

### Test a Missing Book

- **Example:** https://cse341-books-ks1x.onrender.com/books/b999
- **Expected response:** `404 Not Found` with `{"message":"Book not found"}`.
