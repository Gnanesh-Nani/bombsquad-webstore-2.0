require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { authenticateToken } = require('./middleware/auth');


const app = express();
const PORT = process.env.PORT || 3001;

const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGINS = process.env.CORS_ORIGINS.split(',');

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: CORS_ORIGINS,
        credentials: true,
    })
);

// Login API
app.post("/api/login", async (req, res) => {
    const { pbid, password } = req.body;

    try {
        const response = await axios.get(process.env.BANK_API_URL);
        const bankData = response.data;
        const user = bankData[pbid];

        if (user) {
            if (user.password === password) {
                const token = jwt.sign(
                    {
                        pbid: pbid,
                        tickets: user.tickets,
                        effect: user.effect || [],
                        tag: user.tag || [],
                    },
                    JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                );

                res.cookie("token", token, {
                    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
                    secure: process.env.COOKIE_SECURE === 'true',
                    sameSite: process.env.COOKIE_SAME_SITE,
                    maxAge: parseInt(process.env.COOKIE_MAX_AGE),
                });

                console.log("✅ User logged in:", pbid);
                return res.json({ success: true, user: { pbid, tickets: user.tickets, effect: user.effect, tag: user.tag } });
            } else {
                console.log("❌ Invalid password for:", pbid);
                return res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            console.log("❌ User not found:", pbid);
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("❌ Error fetching bank data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Auto-login endpoint
app.get("/api/autologin/:userId", async (req, res) => {
    const { userId: pbid } = req.params;

    try {
        const response = await axios.get(process.env.BANK_API_URL);
        const bankData = response.data;
        const user = bankData[pbid];

        if (user) {
            const token = jwt.sign(
                {
                    pbid: pbid,
                    tickets: user.tickets,
                    effect: user.effect || [],
                    tag: user.tag || [],
                },
                JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.cookie("token", token, {
                httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAME_SITE,
                maxAge: parseInt(process.env.COOKIE_MAX_AGE),
            });

            console.log("✅ User logged in:", pbid);
            return res.json({ success: true, user: { pbid, tickets: user.tickets, effect: user.effect, tag: user.tag } });
        } else {
            console.log("❌ User not found:", pbid);
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("❌ Error fetching bank data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Logout API
app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    console.log("🚪 User logged out");
    return res.json({ success: true, message: "Logged out successfully" });
});

// Check if token is about to expire
const isTokenAboutToExpire = (user) => {
    const now = Math.floor(Date.now() / 1000);
    const expirationBuffer = 300; // 5 minutes
    return user.exp - now < expirationBuffer;
};

// Check if user data has changed
const hasUserDataChanged = (existingUser, latestUser) => {
    return (
        existingUser.tickets !== latestUser.tickets ||
        JSON.stringify(existingUser.effect) !== JSON.stringify(latestUser.effect || []) ||
        JSON.stringify(existingUser.tag) !== JSON.stringify(latestUser.tag || [])
    );
};

// API to check current session
app.get("/api/session", authenticateToken, async (req, res) => {
    console.log("🔎 Checking session for:", req.user.pbid);

    try {
        const response = await axios.get(process.env.BANK_API_URL);
        const bankData = response.data;
        const latestUser = bankData[req.user.pbid];

        if (latestUser) {
            const userData = {
                pbid: req.user.pbid,
                tickets: latestUser.tickets,
                effect: latestUser.effect || [],
                tag: latestUser.tag || [],
            };

            if (isTokenAboutToExpire(req.user) || hasUserDataChanged(req.user, latestUser)) {
                const token = jwt.sign(userData, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

                res.cookie("token", token, {
                    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
                    secure: process.env.COOKIE_SECURE === 'true',
                    sameSite: process.env.COOKIE_SAME_SITE,
                    maxAge: parseInt(process.env.COOKIE_MAX_AGE),
                });

                console.log("✅ Token refreshed for:", req.user.pbid);
            }

            console.log("✅ Session data for:", req.user.pbid);
            return res.json({ user: userData });
        } else {
            console.log("❌ User not found in mock server:", req.user.pbid);
            return res.json({ user: null });
        }
    } catch (error) {
        console.error("❌ Error fetching latest user data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// API Routes
const statsRouter = require("./routes/statsRoutes");
const shopRouter = require("./routes/shopRoutes");
const youtubeRouter = require("./routes/youtubeRoutes");

app.use("/api/stats", statsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/youtube", youtubeRouter);

// Serve React frontend
app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) return next();
    res.redirect("http://localhost:5174/stats");
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});