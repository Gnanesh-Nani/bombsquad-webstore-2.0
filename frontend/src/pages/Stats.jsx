import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { FaTrophy, FaMedal, FaAward, FaEye } from "react-icons/fa";
import "../styles/stats/stats.css";

const StatsPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [visitorCount, setVisitorCount] = useState(0);
    const [error, setError] = useState(null);
    const [seasonStartDate, setSeasonStartDate] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) {
                console.warn("⚠️ No user logged in, skipping stats fetch.");
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/stats`);
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    const sortedStats = Object.entries(data.stats)
                        .map(([id, player]) => ({ id, ...player }))
                        .sort((a, b) => a.rank - b.rank);

                    setStats(sortedStats);
                    setVisitorCount(data.visitorCount || 0);
                    setSeasonStartDate(data.startDate || "N/A");
                }
            } catch (error) {
                setError("Failed to fetch stats");
            }
        };

        fetchStats();
    }, [user]); // Re-fetch stats when user changes (e.g., on reload)

    return (
        <div className="stats-page">
            <h1 className="text-4xl font-bold text-center my-4">MR RIP-TEAM-STATS</h1>

            {error && <p className="text-red-500 font-semibold">{error}</p>}

            {/* Blue Eye Icon and Visits */}
            <div className="table-header">
                <div className="header-left">
                    <FaEye className="text-blue-400 text-2xl" />
                    <span className="text-lg ml-2">{visitorCount}</span>
                </div>
                <div className="header-right">
                    <span className="text-lg">
                        Start Date: {new Date(seasonStartDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                        })}
                    </span>
                </div>
            </div>

            {stats ? (
                <div className="stats-table-container">
                    <div className="stats-table-wrapper">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th className="rank-header">Rank</th>
                                    <th>Name</th>
                                    <th>Scores</th>
                                    <th>K/D</th>
                                    <th className="hidden md:table-cell">Kills</th>
                                    <th className="hidden md:table-cell">Deaths</th>
                                    <th className="hidden md:table-cell">Games</th>
                                    <th className="hidden md:table-cell">Avg Score</th>
                                    <th className="hidden md:table-cell">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((player) => (
                                    <tr
                                        key={player.id}
                                        className={
                                            player.rank === 1 ? "rank-1" :
                                            player.rank === 2 ? "rank-2" :
                                            player.rank === 3 ? "rank-3" : player.rank % 2 === 0 ? "even-row" : "odd-row"
                                        }
                                        style={{
                                            animation: user && user.pbid === player.aid ? "blink 1s infinite" : "none",
                                        }}
                                    >
                                        <td className="rank-column">
                                            <div className="rank-icon-container">
                                                {player.rank}
                                                {player.rank === 1 && <FaTrophy className="text-yellow-400 ml-2 text-2xl" />}
                                                {player.rank === 2 && <FaMedal className="text-gray-400 ml-2 text-2xl" />}
                                                {player.rank === 3 && <FaAward className="text-orange-400 ml-2 text-2xl" />}
                                            </div>
                                        </td>
                                        <td>{player.name}</td>
                                        <td>{player.scores}</td>
                                        <td>{player.kd}</td>
                                        <td className="hidden md:table-cell">{player.kills}</td>
                                        <td className="hidden md:table-cell">{player.deaths}</td>
                                        <td className="hidden md:table-cell">{player.games}</td>
                                        <td className="hidden md:table-cell">{player.avg_score}</td>
                                        <td className="hidden md:table-cell">
                                            {new Date(player.last_seen).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="loading-text">Loading stats...</p>
            )}
            <Footer />
        </div>
    );
};

export default StatsPage;