const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('youtube');
});

module.exports = router; // Ensure this line is present
