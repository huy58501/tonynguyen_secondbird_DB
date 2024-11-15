const sql = require('mssql');
require('dotenv').config();

// Database configuration from environment variables
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Use encryption for secure connection, required for Azure SQL
        trustServerCertificate: true // Set to false if using a valid certificate
    }
};

// Function to connect to the database
const connectDB = async () => {
    try {
        await sql.connect(config); // Establish connection with the database
        console.log('Connected to Azure SQL Database');
    } catch (err) {
        console.error('Database connection failed:', err); // Log error if connection fails
        throw err;
    }
};

// Function to get books from the database with optional category filter
const getBooks = async (categories = []) => {
    try {
        let query = 'SELECT * FROM Book'; // Base query to get all books

        if (categories.length > 0) {
            // If categories are provided, add a WHERE clause for filtering by category
            const placeholders = categories.map((_, index) => `@category${index}`).join(',');
            query += ` WHERE Category IN (${placeholders})`;
        }

        const request = new sql.Request();
        categories.forEach((category, index) => {
            // Bind category values to the query
            request.input(`category${index}`, sql.VarChar, category);
        });

        const result = await request.query(query); // Execute the query
        return result.recordset; // Return the result set
    } catch (err) {
        console.error('Error fetching books:', err); // Log error if fetching books fails
        throw err;
    }
};

// Function to add a new book to the database
const addBook = async ({ EntryID, Title, Author, Genre, PublicationDate, ISBN }) => {
    try {
        const request = new sql.Request();
        // Bind the provided book data to the query
        request.input('EntryID', sql.Int, EntryID);
        request.input('Title', sql.VarChar, Title);
        request.input('Author', sql.VarChar, Author);
        request.input('Genre', sql.VarChar, Genre);
        request.input('PublicationDate', sql.Date, PublicationDate);
        request.input('ISBN', sql.NVarChar, ISBN);

        // Insert query for adding the new book
        const query = `INSERT INTO Book (Title, Author, Genre, PublicationDate, ISBN)
                       VALUES (@Title, @Author, @Genre, @PublicationDate, @ISBN)`;
        await request.query(query); // Execute the insert query
    } catch (err) {
        console.error('Error adding book to the database:', err); // Log error if adding book fails
        throw err;
    }
};

// Export the connection and book functions for use in other modules
module.exports = {
    connectDB,
    getBooks,
    addBook
};
