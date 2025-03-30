const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authenticateToken } = require('../middleware/auth'); // Import the middleware

const MOCK_SERVER_URL = "http://localhost:3002/app/bank";

// Fetch shop items (public route)
router.get('/', async (req, res) => {
    try {
        const response = await fetch(MOCK_SERVER_URL);
        const bankData = await response.json();

        const items = [
            { name: 'distortion', price: 150, image: '/images/effects/distortion.png' },
            { name: 'fairydust', price: 150, image: '/images/effects/fairydust.png' },
            { name: 'glow', price: 100, image: '/images/effects/glow.png' },
            { name: 'iceground', price: 150, image: '/images/effects/iceground.png' },
            { name: 'ice', price: 100, image: '/images/effects/ice.png' },
            { name: 'metal', price: 120, image: '/images/effects/metal.png' },
            { name: 'slime', price: 100, image: '/images/effects/slime.png' },
            { name: 'spark', price: 180, image: '/images/effects/spark.png' },
            { name: 'splinter', price: 100, image: '/images/effects/splinter.png' },
            { name: 'sweetground', price: 150, image: '/images/effects/sweetground.png' },
        ];

        res.json({ success: true, items, bankData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch shop data' });
    }
});

// Protected route: Buy item
router.post('/buy', authenticateToken, async (req, res) => {
    const { itemName, price, days } = req.body;
    const pbId = req.user.pbid; // Get user ID from JWT

    if (!pbId || !itemName || !price || !days) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
        const response = await fetch("http://localhost:3002/app/bank/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pbId, itemName, price, days }),
        });

        const data = await response.json();
        console.log(data);
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Purchase failed" });
    }
});

// Protected route: Buy tag
router.post('/buyTag', authenticateToken, async (req, res) => {
    const { tagName, price, days, color } = req.body;
    const pbId = req.user.pbid; // Get user ID from JWT

    if (!pbId || !tagName || !price || !days || !color) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
        const response = await fetch("http://localhost:3002/app/bank/buyTag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pbId, tagName, price, days, color }),
        });

        const data = await response.json();
        console.log(data);
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Tag purchase failed" });
    }
});

// Add these new routes to shopRoutes.js

// Protected route: Remove effect
router.post('/removeEffect', authenticateToken, async (req, res) => {
    const pbId = req.user.pbid; // Get user ID from JWT

    console.log("remove Effect end point hitted")

    try {
        const response = await fetch("http://localhost:3002/app/bank/removeEffect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pbId }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove effect" });
    }
});

// Protected route: Remove tag
router.post('/removeTag', authenticateToken, async (req, res) => {
    const pbId = req.user.pbid; // Get user ID from JWT

    try {
        const response = await fetch("http://localhost:3002/app/bank/removeTag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pbId }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove tag" });
    }
});

module.exports = router;