const express = require('express');
const app = express();

// Load URLs from public folder
app.use(express.json());
app.use("/", express.static("./public"));

// Define global constants
const BASE_API_URL = '/api/v1';
const PORT = process.env.PORT || 3000;

// Load the routes that showcase data
app.use(BASE_API_URL, require('./src/routes/deaths-by-risk-factors.js'));
app.use(BASE_API_URL, require('./src/routes/protests.js'));
app.use(BASE_API_URL, require('./src/routes/pandemics.js'));

// Route for the homepage
app.get('/', (req, res) => {
    res.send('Server running!');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));