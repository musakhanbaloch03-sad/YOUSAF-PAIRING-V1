const express = require('express');
const session = require('express-session');
const app = express();

// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use true if you are using HTTPS
}));

// Preventing page refresh with AJAX
app.post('/submit', (req, res) => {
    // Your logic here
    res.json({ message: 'Data received successfully!' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});