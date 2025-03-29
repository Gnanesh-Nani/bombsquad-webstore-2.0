const express = require('express');
const router = express.Router();
const axios = require('axios');

// Initialize visitor count
let visitorCount = 0;

// Route to get player stats from the mock server
router.get('/', async (req, res) => {
    try {
        // Increment visitor count on each request
        visitorCount++;
        
        const response = await axios.get('http://localhost:3002/app/stats');
        
        // Add visitor count to the response data
        const responseData = {
            ...response.data,
            visitorCount: visitorCount
        };
        
        res.json(responseData);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
            error: "Failed to fetch stats data",
            visitorCount: visitorCount // Still return count even on error
        });
    }
});

module.exports = router;