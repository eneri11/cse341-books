# CSE 341 Books API

A REST API built with Node.js, Express, and MongoDB Atlas.

## Deployment

The application is deployed on Render.

**Live URL:** https://cse341-books-ks1x.onrender.com

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

## Environment Variables

Configure these environment variables in the deployment environment:

- `MONGODB_URI` — MongoDB Atlas connection string.
- `MONGODB_DB_NAME` — Database name, `cse341-books-db`.

Do not commit database credentials or your `.env` file to GitHub.
