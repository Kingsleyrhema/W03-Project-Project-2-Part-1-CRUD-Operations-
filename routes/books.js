const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');

// Validation middleware
const validateBook = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('author').isMongoId().withMessage('Valid author ID is required'),
  body('isbn').matches(/^[0-9]{10,13}$/).withMessage('ISBN must be 10-13 digits'),
  body('genre').isIn(['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help', 'Other']).withMessage('Invalid genre'),
  body('publicationYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid publication year'),
  body('pages').isInt({ min: 1 }).withMessage('Pages must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
];

// GET /api/books - Get all books
/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('author', 'firstName lastName');
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// GET /api/books/:id - Get book by ID
/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/BookResponse'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author', 'firstName lastName');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// POST /api/books - Create new book
/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/BookResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', validateBook, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = new Book(req.body);
    await book.save();
    await book.populate('author', 'firstName lastName');
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// PUT /api/books/:id - Update book
/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/BookResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateBook, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// DELETE /api/books/:id - Delete book
/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

module.exports = router;
