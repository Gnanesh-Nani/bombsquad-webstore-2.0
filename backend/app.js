const express = require("express");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true, // Allow credentials (cookies)
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
// Configure session
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === "production", // Ensure HTTPS in production
            httpOnly: true,
            sameSite: "lax", // Try "none" if using different domains
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        },
        store: new session.MemoryStore(), // Replace with MongoDB or Redis store
    })
);


// Store active sessions manually
const activeSessions = {};

// Function to print all active sessions
const printActiveSessions = () => {
    console.log("📢 Active Sessions:", activeSessions);
};

// API Routes
const statsRouter = require("./routes/statsRoutes");
const shopRouter = require("./routes/shopRoutes");
const youtubeRouter = require("./routes/youtubeRoutes");

app.use("/api/stats", statsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/youtube", youtubeRouter);

// Login API
app.post("/api/login", async (req, res) => {
    console.log("🔍 Received login request:", req.body);
    const { pbid, password } = req.body;

    try {
        const response = await axios.get("http://localhost:3002/app/bank");
        const bankData = response.data;
        const user = bankData[pbid];

        if (user) {
            console.log("👤 Found User:", user);
            if (user.password === password) {
                req.session.user = {
                    pbid: pbid,
                    tickets: user.tickets,
                    effect: user.effect || [],
                    tag: user.tag || [],
                };

                // Track the session
                activeSessions[req.sessionID] = req.session.user;

                req.session.save((err) => {
                    if (err) {
                        console.error("❌ Session save failed:", err);
                        return res.status(500).json({ error: "Session save failed" });
                    }
                    console.log("✅ Login success. Session stored:", req.session.user);
                    printActiveSessions(); // Log active sessions
                    res.json({ success: true, user: req.session.user });
                });
            } else {
                console.log("❌ Incorrect Password");
                return res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            console.log("❌ User Not Found");
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("❌ Error fetching bank data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Logout API
app.post("/api/logout", (req, res) => {
    if (req.session) {
        delete activeSessions[req.sessionID]; // Remove session from tracking
        req.session.destroy((err) => {
            if (err) {
                console.error("❌ Logout failed:", err);
                return res.status(500).json({ error: "Logout failed" });
            }
            res.clearCookie("connect.sid");
            console.log("🚪 User Logged Out");
            printActiveSessions(); // Print all active sessions
            return res.json({ success: true, message: "Logged out successfully" });
        });
    } else {
        return res.status(400).json({ error: "No active session" });
    }
});

// Auto-login API
app.get("/api/autologin/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log(`🔄 Auto-login request for: ${userId}`);

    try {
        // Fetch the latest user data from the mock server
        const response = await axios.get("http://localhost:3002/app/bank");
        const bankData = response.data;
        const latestUser = bankData[userId];

        if (latestUser) {
            // Update the session with the latest user data
            req.session.user = {
                pbid: latestUser.pbid,
                tickets: latestUser.tickets,
                effect: latestUser.effect || [],
                tag: latestUser.tag || [],
            };

            // Track the session
            activeSessions[req.sessionID] = req.session.user;

            console.log(`✅ Auto-logged in with latest data: ${userId}`);
            printActiveSessions(); // Log active sessions
            return res.json({ success: true, user: req.session.user });
        } else {
            console.log("❌ User not found in mock server.");
            return res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("❌ Error fetching latest user data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// API to check current session
app.get("/api/session", async (req, res) => {
    console.log("🔎 Checking session:", req.session);

    if (!req.session || !req.session.user) {
        console.log("❌ No active session found.");
        return res.json({ user: null });
    }

    try {
        // Fetch the latest user data from the mock server
        const response = await axios.get("http://localhost:3002/app/bank");
        const bankData = response.data;
        const latestUser = bankData[req.session.user.pbid];

        if (latestUser) {
            // Update the session with the latest user data
            req.session.user = {
                pbid: latestUser.pbid,
                tickets: latestUser.tickets,
                effect: latestUser.effect || [],
                tag: latestUser.tag || [],
            };

            // Track the session
            activeSessions[req.sessionID] = req.session.user;

            console.log("✅ Session updated with latest data:", req.session.user);
            printActiveSessions(); // Log active sessions
            return res.json({ user: req.session.user });
        } else {
            console.log("❌ User not found in mock server.");
            return res.json({ user: null });
        }
    } catch (error) {
        console.error("❌ Error fetching latest user data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Serve React frontend
app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) return next();
    res.redirect("http://localhost:5174/stats");
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});