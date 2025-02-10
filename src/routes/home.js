// src/routes/home.js
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/api/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'search.html'));
});


module.exports = router;
