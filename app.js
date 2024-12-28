const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'studentdashboard.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
