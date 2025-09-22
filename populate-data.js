const mongoose = require('mongoose');
const Author = require('./models/Author');
const Book = require('./models/Book');
require('dotenv').config();

// Sample authors data
const authorsData = [
  {
    firstName: 'F. Scott',
    lastName: 'Fitzgerald',
    email: 'fitzgerald@example.com',
    birthDate: '1896-09-24',
    nationality: 'American',
    biography: 'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age.',
    awards: ['Pulitzer Prize', 'National Book Award']
  },
  {
    firstName: 'Harper',
    lastName: 'Lee',
    email: 'harper.lee@example.com',
    birthDate: '1926-04-28',
    nationality: 'American',
    biography: 'Nelle Harper Lee was an American novelist best known for her 1960 novel To Kill a Mockingbird. It won the 1961 Pulitzer Prize and has become a classic of modern American literature.',
    awards: ['Pulitzer Prize for Fiction', 'Presidential Medal of Freedom']
  },
  {
    firstName: 'George',
    lastName: 'Orwell',
    email: 'george.orwell@example.com',
    birthDate: '1903-06-25',
    nationality: 'British',
    biography: 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is characterised by lucid prose, biting social criticism, and opposition to totalitarianism.',
    awards: ['Prometheus Award', 'Retro Hugo Award']
  },
  {
    firstName: 'J.K.',
    lastName: 'Rowling',
    email: 'jk.rowling@example.com',
    birthDate: '1965-07-31',
    nationality: 'British',
    biography: 'Joanne Rowling, known by her pen name J.K. Rowling, is a British author, philanthropist, film producer, television producer, and screenwriter. She is best known for writing the Harry Potter fantasy series.',
    awards: ['Hugo Award', 'Nebula Award', 'Bram Stoker Award']
  },
  {
    firstName: 'Maya',
    lastName: 'Angelou',
    email: 'maya.angelou@example.com',
    birthDate: '1928-04-04',
    nationality: 'American',
    biography: 'Maya Angelou was an American poet, memoirist, and civil rights activist. She published seven autobiographies, three books of essays, several books of poetry, and was credited with a list of plays, movies, and television shows.',
    awards: ['Presidential Medal of Freedom', 'National Medal of Arts', 'Grammy Award']
  }
];

// Sample books data (will be populated after authors are created)
const booksData = [
  {
    title: 'The Great Gatsby',
    isbn: '9780743273565',
    genre: 'Fiction',
    publicationYear: 1925,
    pages: 180,
    price: 12.99,
    description: 'A classic American novel set in the Jazz Age, following the mysterious Jay Gatsby and his obsession with the beautiful Daisy Buchanan.'
  },
  {
    title: 'To Kill a Mockingbird',
    isbn: '9780061120084',
    genre: 'Fiction',
    publicationYear: 1960,
    pages: 281,
    price: 14.99,
    description: 'The story of young Scout Finch, whose father, Atticus Finch, is a lawyer defending a black man falsely accused of rape in 1930s Alabama.'
  },
  {
    title: '1984',
    isbn: '9780451524935',
    genre: 'Science Fiction',
    publicationYear: 1949,
    pages: 328,
    price: 13.99,
    description: 'A dystopian social science fiction novel about totalitarian control and surveillance in a world where independent thinking is a crime.'
  },
  {
    title: 'Animal Farm',
    isbn: '9780451526342',
    genre: 'Fiction',
    publicationYear: 1945,
    pages: 112,
    price: 10.99,
    description: 'An allegorical novella about a group of farm animals who rebel against their human farmer, hoping to create a society where the animals can be equal, free, and happy.'
  },
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    isbn: '9780747532699',
    genre: 'Fiction',
    publicationYear: 1997,
    pages: 223,
    price: 16.99,
    description: 'The first novel in the Harry Potter series, following the adventures of a young wizard, Harry Potter, and his friends Hermione Granger and Ron Weasley.'
  },
  {
    title: 'Harry Potter and the Chamber of Secrets',
    isbn: '9780747538493',
    genre: 'Fiction',
    publicationYear: 1998,
    pages: 251,
    price: 16.99,
    description: 'The second novel in the Harry Potter series, where Harry returns to Hogwarts for his second year and discovers the Chamber of Secrets.'
  },
  {
    title: 'I Know Why the Caged Bird Sings',
    isbn: '9780345514400',
    genre: 'Biography',
    publicationYear: 1969,
    pages: 289,
    price: 15.99,
    description: 'The first volume of Maya Angelou\'s seven-volume autobiography, describing her early life and the challenges she faced growing up in the American South.'
  },
  {
    title: 'The Great Gatsby (Special Edition)',
    isbn: '9780743273566',
    genre: 'Fiction',
    publicationYear: 1925,
    pages: 200,
    price: 18.99,
    description: 'A special illustrated edition of the classic American novel with additional commentary and historical context.'
  }
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Author.deleteMany({});
    await Book.deleteMany({});
    console.log('Cleared existing data');

    // Insert authors
    const authors = await Author.insertMany(authorsData);
    console.log(`Inserted ${authors.length} authors`);

    // Map books to authors
    const authorMap = {
      'F. Scott Fitzgerald': authors[0]._id,
      'Harper Lee': authors[1]._id,
      'George Orwell': authors[2]._id,
      'J.K. Rowling': authors[3]._id,
      'Maya Angelou': authors[4]._id
    };

    // Add author references to books
    const booksWithAuthors = booksData.map(book => {
      let authorId;
      if (book.title.includes('Great Gatsby')) {
        authorId = authorMap['F. Scott Fitzgerald'];
      } else if (book.title.includes('Mockingbird')) {
        authorId = authorMap['Harper Lee'];
      } else if (book.title.includes('1984') || book.title.includes('Animal Farm')) {
        authorId = authorMap['George Orwell'];
      } else if (book.title.includes('Harry Potter')) {
        authorId = authorMap['J.K. Rowling'];
      } else if (book.title.includes('Caged Bird')) {
        authorId = authorMap['Maya Angelou'];
      }
      
      return {
        ...book,
        author: authorId
      };
    });

    // Insert books
    const books = await Book.insertMany(booksWithAuthors);
    console.log(`Inserted ${books.length} books`);

    console.log('\n✅ Database populated successfully!');
    console.log('\nSample data created:');
    console.log(`- ${authors.length} authors`);
    console.log(`- ${books.length} books`);
    
    console.log('\nAuthors created:');
    authors.forEach(author => {
      console.log(`- ${author.firstName} ${author.lastName} (${author.nationality})`);
    });

    console.log('\nBooks created:');
    books.forEach(book => {
      console.log(`- ${book.title} (${book.genre}, ${book.publicationYear})`);
    });

  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the population script
populateDatabase();
