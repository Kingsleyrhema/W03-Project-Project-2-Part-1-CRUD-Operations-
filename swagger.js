const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Books and Authors API',
    description: 'API for managing books and authors with full CRUD operations',
    version: '1.0.0',
  },
  host: 'w03-project-project-2-part-1-crud.onrender.com',
  schemes: ['https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  definitions: {
    Book: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the book',
          example: 'The Great Gatsby'
        },
        author: {
          type: 'string',
          description: 'Author ID (MongoDB ObjectId)',
          example: '507f1f77bcf86cd799439011'
        },
        isbn: {
          type: 'string',
          description: 'ISBN number (10-13 digits)',
          example: '9780743273565'
        },
        genre: {
          type: 'string',
          enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help', 'Other'],
          description: 'Genre of the book',
          example: 'Fiction'
        },
        publicationYear: {
          type: 'integer',
          description: 'Year the book was published',
          example: 1925
        },
        pages: {
          type: 'integer',
          description: 'Number of pages in the book',
          example: 180
        },
        price: {
          type: 'number',
          description: 'Price of the book',
          example: 12.99
        },
        description: {
          type: 'string',
          description: 'Description of the book',
          example: 'A classic American novel set in the Jazz Age'
        }
      },
      required: ['title', 'author', 'isbn', 'genre', 'publicationYear', 'pages', 'price', 'description']
    },
    BookResponse: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Unique identifier for the book'
        },
        title: {
          type: 'string',
          description: 'Title of the book'
        },
        author: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          },
          description: 'Author information'
        },
        isbn: {
          type: 'string',
          description: 'ISBN number'
        },
        genre: {
          type: 'string',
          description: 'Genre of the book'
        },
        publicationYear: {
          type: 'integer',
          description: 'Year the book was published'
        },
        pages: {
          type: 'integer',
          description: 'Number of pages in the book'
        },
        price: {
          type: 'number',
          description: 'Price of the book'
        },
        description: {
          type: 'string',
          description: 'Description of the book'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Date when the book was created'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Date when the book was last updated'
        }
      }
    },
    Author: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name of the author',
          example: 'F. Scott'
        },
        lastName: {
          type: 'string',
          description: 'Last name of the author',
          example: 'Fitzgerald'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Email address of the author',
          example: 'fitzgerald@example.com'
        },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'Birth date of the author',
          example: '1896-09-24'
        },
        nationality: {
          type: 'string',
          description: 'Nationality of the author',
          example: 'American'
        },
        biography: {
          type: 'string',
          description: 'Biography of the author',
          example: 'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer.'
        },
        awards: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of awards received by the author',
          example: ['Pulitzer Prize', 'National Book Award']
        }
      },
      required: ['firstName', 'lastName', 'email', 'birthDate', 'nationality', 'biography']
    },
    AuthorResponse: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Unique identifier for the author'
        },
        firstName: {
          type: 'string',
          description: 'First name of the author'
        },
        lastName: {
          type: 'string',
          description: 'Last name of the author'
        },
        fullName: {
          type: 'string',
          description: 'Full name of the author (computed field)'
        },
        email: {
          type: 'string',
          description: 'Email address of the author'
        },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'Birth date of the author'
        },
        nationality: {
          type: 'string',
          description: 'Nationality of the author'
        },
        biography: {
          type: 'string',
          description: 'Biography of the author'
        },
        awards: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of awards received by the author'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Date when the author was created'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Date when the author was last updated'
        }
      }
    },
    Error: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Error message'
        },
        errors: {
          type: 'array',
          items: { type: 'object' },
          description: 'Detailed validation errors (if applicable)'
        }
      }
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
