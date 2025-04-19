require('dotenv').config();
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize Firebase
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Environment variables
const STATS_API_URL = process.env.STATS_API_URL;
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600; // Default 1 hour

let visitorCount = 0;
const statsCache = new NodeCache({ 
    stdTTL: CACHE_TTL,
    checkperiod: 600 // Check for expired items every 10 minutes
});

// Helper function to get full stats for a season
const getStats = async (seasonId) => {
    const seasonRef = db.collection('halloffame').doc(seasonId);
    const doc = await seasonRef.get();

    if (!doc.exists) return null;

    const data = doc.data();
    const players = Object.values(data.stats || {})
        .sort((a, b) => a.rank - b.rank)
        .map(player => ({
            name: player.name,
            rank: player.rank,
            avg_score: player.avg_score || 0,
            games: player.games || 0,
            last_seen: player.last_seen,
            total_score: Math.round((player.avg_score || 0) * (player.games || 0)),
            kills: player.kills || 0,
            deaths: player.deaths || 0,
            kd: player.kd || 0
        }));

    return {
        id: doc.id,
        startDate: data.startDate,
        endDate: data.endDate || 'Present',
        players
    };
};

// Process player stats to only include top 3
const processTopPlayers = (stats) => {
    if (!stats) return [];
    const players = Object.values(stats);
    return players
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 3)
        .map(player => ({
            name: player.name,
            rank: player.rank,
            avg_score: player.avg_score || 0,
            games: player.games || 0,
            kd: player.kd,
            last_seen: player.last_seen,
            total_score: Math.round((player.avg_score || 0) * (player.games || 0))
        }));
};

// New endpoint to receive shop stats from FastAPI
router.post('/cacheStats', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({
                error: "Missing data payload",
                visitorCount
            });
        }
        
        // Update cache with new data
        statsCache.set('currentStats', data);
        console.log('Shop stats cache updated');
        
        res.json({
            success: true,
            message: "Cache stats received successfully",
            visitorCount
        });
        
    } catch (error) {
        console.error("Error processing Cache stats:", error);
        res.status(500).json({
            error: "Failed to process Cache stats",
            visitorCount,
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Current season stats (existing endpoint)
router.get('/', async (req, res) => {
    try {
        visitorCount++;
        const cachedData = statsCache.get('currentStats');

        if (cachedData) {
            console.log("Serving stats from cache");
            // console.log("Cached data keys:", Object.keys(cachedData));
            // console.log("Cached data:", cachedData);
            return res.json({...cachedData, visitorCount});
        }
            
        console.log("Fetching stats from FastAPI");
        const response = await axios.get(STATS_API_URL);
        
        // Cache the response from FastAPI
        const responseData = response.data;
        statsCache.set('currentStats', responseData);
        console.log("Stats cached for future requests");
        
        res.json({
            ...responseData,
            visitorCount
        });
    } catch (error) {
        console.error("Error fetching current season stats:", error);
        res.status(500).json({
            error: "Failed to fetch current season stats",
            visitorCount,
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Get list of all past seasons (without current season)
router.get('/seasonlist', async (req, res) => {
    try {
        const cachedData = statsCache.get('seasonList');
        if (cachedData) {
            return res.json({
                seasons: cachedData,
                visitorCount
            });
        }

        const seasonsRef = db.collection('halloffame');
        const snapShot = await seasonsRef.orderBy('startDate', 'desc').get();

        if (snapShot.empty) {
            return res.status(404).json({
                error: "No seasons found",
                visitorCount
            });
        }

        const allSeasons = [];
        snapShot.forEach(doc => {
            const data = doc.data();
            if (data.endDate !== 'Present') {
                allSeasons.push({
                    id: doc.id,
                    startDate: data.startDate,
                    endDate: data.endDate
                });
            }
        });

        statsCache.set('seasonList', allSeasons);

        res.json({
            seasons: allSeasons,
            visitorCount
        });
    } catch (error) {
        console.error("Error fetching season list:", error);
        res.status(500).json({
            error: "Failed to fetch season list",
            visitorCount,
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Get full stats for a specific season
router.get('/season/:id', async (req, res) => {
    try {
        const season = await getStats(req.params.id);
        
        if (!season) {
            return res.status(404).json({
                error: "Season not found",
                visitorCount
            });
        }

        res.json({
            season,
            visitorCount
        });
    } catch (error) {
        console.error("Error fetching season stats:", error);
        res.status(500).json({
            error: "Failed to fetch season stats",
            visitorCount,
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Get top 3 players from last 3 seasons
router.get('/seasonTop3', async (req, res) => {
    try {
        const cachedData = statsCache.get('seasonTop3');
        if (cachedData) {
            return res.json({
                seasons: cachedData,
                visitorCount
            });
        }

        const seasonsResponse = await db.collection('halloffame')
            .orderBy('startDate', 'desc')
            .get();

        const pastSeasons = [];
        seasonsResponse.forEach(doc => {
            const data = doc.data();
            if (data.endDate !== 'Present') {
                pastSeasons.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        const lastThreeSeasons = pastSeasons.slice(0, 3);
        
        const seasonsWithTopPlayers = await Promise.all(
            lastThreeSeasons.map(async season => {
                const seasonData = await getStats(season.id);
                return {
                    id: season.id,
                    startDate: season.startDate,
                    endDate: season.endDate,
                    topPlayers: processTopPlayers(season.stats)
                };
            })
        );

        statsCache.set('seasonTop3', seasonsWithTopPlayers);
        res.json({
            seasons: seasonsWithTopPlayers,
            visitorCount
        });
    } catch (error) {
        console.error("Error fetching top 3 seasons:", error);
        res.status(500).json({
            error: "Failed to fetch top 3 seasons",
            visitorCount,
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

module.exports = router;