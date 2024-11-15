const express = require('express');
const cors = require('cors');
const { connectDB, getBooks, addBook } = require('./db');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to the database
connectDB();

// Use CORS middleware to allow requests from different origins
app.use(cors());

// Serve static files (React build for production)
app.use(express.static(path.join(__dirname, 'public', 'build')));

// Route to get all books with optional category filter
app.get('/api/data', async (req, res) => {
    const { categories } = req.query; // Get categories from query parameter
    const categoryArray = categories ? categories.split(',').map(category => category.trim()) : []; // Convert categories to an array

    try {
        // Fetch books from the database with optional filtering by category
        const books = await getBooks(categoryArray); 
        res.status(200).json(books); // Return books as JSON response
    } catch (err) {
        console.error('Error retrieving books:', err);
        res.status(500).send('Error retrieving books');
    }
});

// Route to add a new book to the database
app.post('/api/add', async (req, res) => {
    const { EntryID, Title, Author, Genre, PublicationDate, ISBN } = req.body;

    // Check if all required fields are provided
    if (!EntryID || !Title || !Author || !Genre || !PublicationDate || !ISBN) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // Add the new book to the database
        await addBook({ EntryID, Title, Author, Genre, PublicationDate, ISBN });
        res.status(201).send('Book added successfully');
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Error adding book');
    }
});

// Serve the main React app (for production)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'build', 'index.html'));
});

// Health check route to verify if the server is up and running
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
