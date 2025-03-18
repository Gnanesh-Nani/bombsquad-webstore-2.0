//statsRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to get player stats from the mock server
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3002/app/stats');
        res.json(response.data); // Send the stats data as JSON
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch stats data" });
    }
});

module.exports = router;
