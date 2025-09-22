# Books and Authors API

A RESTful API for managing books and authors with full CRUD operations, built with Node.js, Express, and MongoDB.

## Features

- **Two Collections**: Books (8 fields) and Authors (7 fields)
- **Full CRUD Operations**: Create, Read, Update, Delete for both collections
- **Data Validation**: Comprehensive validation using express-validator
- **Error Handling**: Proper error handling with appropriate HTTP status codes
- **API Documentation**: Swagger/OpenAPI documentation
- **MongoDB Integration**: Connected to MongoDB Atlas

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get author by ID
- `POST /api/authors` - Create new author
- `PUT /api/authors/:id` - Update author
- `DELETE /api/authors/:id` - Delete author

## Data Models

### Book (8 fields)
- title (string, required)
- author (ObjectId reference to Author, required)
- isbn (string, required, unique, 10-13 digits)
- genre (enum, required)
- publicationYear (number, required)
- pages (number, required)
- price (number, required)
- description (string, required)

### Author (7 fields)
- firstName (string, required)
- lastName (string, required)
- email (string, required, unique)
- birthDate (date, required)
- nationality (string, required)
- biography (string, required)
- awards (array of strings, optional)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your MongoDB connection string
4. Start the server: `npm start` or `npm run dev`

## Environment Variables

```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## API Documentation

Once the server is running, visit `/api-docs` to view the Swagger documentation.

## Testing

You can test the API using:
- Swagger UI at `/api-docs`
- Postman or similar API testing tools
- curl commands

## Deployment

This API is configured for deployment on Render.com with the following requirements:
- Node.js environment
- MongoDB Atlas connection
- Environment variables configured in Render dashboard
