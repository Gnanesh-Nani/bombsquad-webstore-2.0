import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { FaTrophy, FaMedal, FaAward, FaEye } from "react-icons/fa";
import styles from "../styles/stats/stats.module.css"; 

const StatsPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [visitorCount, setVisitorCount] = useState(0);
    const [error, setError] = useState(null);
    const [seasonStartDate, setSeasonStartDate] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
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
                    console.log("startDate", data.startDate);
                    console.log("endDate", data.endDate);
                    console.log("seasonDuration", data.seasonDuration);
                    setSeasonStartDate(data.startDate || "N/A");
                }
            } catch (error) {
                setError("Failed to fetch stats");
            }
        };

        fetchStats();
    }, [user]);

    return (
        <div className={styles.statsPage}>
            <h1 className={styles.title}>MR RIP-TEAM-STATS</h1>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.tableHeader}>
                <div className={styles.headerLeft}>
                    <FaEye className={styles.eyeIcon} />
                    <span className={styles.visitorCount}>{visitorCount}</span>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.seasonDate}>
                        Start Date: {new Date(seasonStartDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                        })}
                    </span>
                </div>
            </div>

            {stats ? (
                <div className={styles.statsTableContainer}>
                    <div className={styles.statsTableWrapper}>
                        <table className={styles.statsTable}>
                            <thead>
                                <tr>
                                    <th className={styles.rankHeader}>Rank</th>
                                    <th>Name</th>
                                    <th>Scores</th>
                                    <th>K/D</th>
                                    <th className={styles.hideMobile}>Kills</th>
                                    <th className={styles.hideMobile}>Deaths</th>
                                    <th className={styles.hideMobile}>Games</th>
                                    <th className={styles.hideMobile}>Avg Score</th>
                                    <th className={styles.hideMobile}>Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((player) => (
                                    <tr
                                        key={player.id}
                                        className={
                                            player.rank === 1 ? styles.rank1 :
                                            player.rank === 2 ? styles.rank2 :
                                            player.rank === 3 ? styles.rank3 : 
                                            player.rank % 2 === 0 ? styles.evenRow : styles.oddRow
                                        }
                                        style={{
                                            animation: user && user.pbid === player.aid ? "blink 1s infinite" : "none",
                                        }}
                                    >
                                        <td className={styles.rankColumn}>
                                            <div className={styles.rankIconContainer}>
                                                {player.rank}
                                                {player.rank === 1 && <FaTrophy className={styles.trophyIcon} />}
                                                {player.rank === 2 && <FaMedal className={styles.medalIcon} />}
                                                {player.rank === 3 && <FaAward className={styles.awardIcon} />}
                                            </div>
                                        </td>
                                        <td>{player.name}</td>
                                        <td>{player.scores}</td>
                                        <td>{player.kd}</td>
                                        <td className={styles.hideMobile}>{player.kills}</td>
                                        <td className={styles.hideMobile}>{player.deaths}</td>
                                        <td className={styles.hideMobile}>{player.games}</td>
                                        <td className={styles.hideMobile}>{player.avg_score}</td>
                                        <td className={styles.hideMobile}>
                                            {new Date(player.last_seen).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className={styles.loadingText}>Loading stats...</p>
            )}
            <Footer />
        </div>
    );
};

export default StatsPage;