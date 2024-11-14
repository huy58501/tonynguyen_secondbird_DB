const express = require('express');
const cors = require('cors'); // Import cors
const { connectDB, getProducts } = require('./db');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Connect to the database
connectDB();

// Use CORS middleware to allow requests from different origins
app.use(cors());

// Middleware to serve static files
app.use(express.static('public'));

// Route to get all products with optional category filter
app.get('/api/data', async (req, res) => {
    console.log("Received a request for /api/data"); // Add this line

    const { categories } = req.query; // Get categories from the query parameter
    const categoryArray = categories ? categories.split(',') : []; // Split the categories into an array

    try {
        const products = await getProducts(categoryArray); // Pass categories to the database function
        res.json(products);
    } catch (err) {
        console.error('Error retrieving products:', err); // Log the error
        res.status(500).send('Error retrieving products');
    }
});

// Route for the root URL (optional)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at ${port}`);
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});