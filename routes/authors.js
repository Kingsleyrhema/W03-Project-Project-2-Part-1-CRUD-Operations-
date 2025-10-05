const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Author = require('../models/Author');
const { authenticateJWT } = require('../middleware/auth');

// Validation middleware
const validateAuthor = [
  body('firstName').notEmpty().withMessage('First name is required').trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').notEmpty().withMessage('Last name is required').trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('birthDate').isISO8601().withMessage('Valid birth date is required'),
  body('nationality').notEmpty().withMessage('Nationality is required').trim(),
  body('biography').notEmpty().withMessage('Biography is required').isLength({ max: 2000 }).withMessage('Biography cannot exceed 2000 characters'),
  body('awards').optional().isArray().withMessage('Awards must be an array')
];

// GET /api/authors - Get all authors
/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of all authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/AuthorResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find();
    res.status(200).json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ message: 'Error fetching authors', error: error.message });
  }
});

// GET /api/authors/:id - Get author by ID
/**
 * @swagger
 * /api/authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthorResponse'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.status(200).json(author);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ message: 'Error fetching author', error: error.message });
  }
});

// POST /api/authors - Create new author
/**
 * @swagger
 * /api/authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Author'
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthorResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, validateAuthor, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const author = new Author(req.body);
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    console.error('Error creating author:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating author', error: error.message });
  }
});

// PUT /api/authors/:id - Update author
/**
 * @swagger
 * /api/authors/{id}:
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Author'
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthorResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateJWT, validateAuthor, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const author = await Author.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.status(200).json(author);
  } catch (error) {
    console.error('Error updating author:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error updating author', error: error.message });
  }
});

// DELETE /api/authors/:id - Delete author
/**
 * @swagger
 * /api/authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ message: 'Error deleting author', error: error.message });
  }
});

module.exports = router;
