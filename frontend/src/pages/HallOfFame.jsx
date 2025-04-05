import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaAward, FaChevronDown, FaChevronUp, FaList } from 'react-icons/fa';
import Notification from '../components/Notification';
import { useNotification } from '../context/NotificationContext';
import styles from '../styles/hallOfFame/hof.module.css';

const HallOfFame = () => {
    const [lastThreeSeasons, setLastThreeSeasons] = useState([]);
    const [allSeasons, setAllSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSeasonList, setShowSeasonList] = useState(false);
    const [viewMode, setViewMode] = useState('top3'); // 'top3' or 'full'
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch last 3 seasons with top players
                const top3Response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/stats/seasonTop3`);
                const top3Data = await top3Response.json();
                if (top3Data.error) throw new Error(top3Data.error);

                setLastThreeSeasons(top3Data.seasons);

                // Set the most recent season as default
                if (top3Data.seasons.length > 0) {
                    setSelectedSeason(top3Data.seasons[0]);
                }

                // Fetch all seasons for dropdown
                const allSeasonsResponse = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/stats/seasonlist`);
                const allSeasonsData = await allSeasonsResponse.json();
                if (allSeasonsData.error) throw new Error(allSeasonsData.error);

                setAllSeasons(allSeasonsData.seasons);

                setLoading(false);
            } catch (error) {
                showNotification(error.message || 'Failed to load data', 'error');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchFullSeasonStats = async (seasonId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/stats/season/${seasonId}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data.season;
        } catch (error) {
            showNotification(error.message || 'Failed to load season details', 'error');
            return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'Present') return 'Present';
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSeasonSelect = async (season) => {
        setLoading(true);
        const fullSeason = await fetchFullSeasonStats(season.id);
        setLoading(false);

        if (fullSeason) {
            setSelectedSeason(fullSeason);
            setViewMode('full');
            setShowSeasonList(false);
        }
    };

    const handleBackToTopPlayers = () => {
        setViewMode('top3');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Loading Hall of Fame...</h1>
                <p className={styles.loading}>Fetching legendary players...</p>
            </div>
        );
    }

    if (lastThreeSeasons.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>BombSquad Hall of Fame</h1>
                <p>No season data available</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>BombSquad Hall of Fame</h1>

            {viewMode === 'full' && selectedSeason && (
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.backButton}
                            onClick={handleBackToTopPlayers}
                        >
                            ← Back to Top Players
                        </button>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.seasonDate}>
                            {formatDate(selectedSeason.startDate)} to {formatDate(selectedSeason.endDate)}
                        </div>
                    </div>
                </div>
            )}

            {/* Main content area */}
            {viewMode === 'top3' ? (
                <>
                    <div className={styles.controls}>
                        <button
                            className={styles.viewAllButton}
                            onClick={() => setShowSeasonList(!showSeasonList)}
                        >
                            <FaList className={styles.listIcon} />
                            {showSeasonList ? 'Hide Season List' : 'View All Seasons'}
                            {showSeasonList ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {showSeasonList && (
                        <div className={styles.seasonDropdown}>
                            <h3>Select a Season</h3>
                            <div className={styles.seasonList}>
                                {allSeasons.map(season => (
                                    <div
                                        key={season.id}
                                        className={styles.seasonItem}
                                        onClick={() => handleSeasonSelect(season)}
                                    >
                                        {formatDate(season.startDate)} to {formatDate(season.endDate)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.lastSeasonsContainer}>
                        <h2 className={styles.sectionTitle}>Top Players - Last 3 Seasons</h2>
                        <div className={styles.seasonsGrid}>
                            {lastThreeSeasons.map(season => (
                                <div key={season.id} className={styles.seasonGroup}>
                                    <h3 className={styles.seasonTitle}>
                                        {formatDate(season.startDate)} to {formatDate(season.endDate)}
                                    </h3>
                                    <div className={styles.topPlayers}>
                                        {season.topPlayers?.map((player, index) => (
                                            <div key={`${season.id}-${player.rank}`} className={`${styles.playerCard} ${styles['rank' + (index + 1)]}`}>
                                                <div className={styles.rankBadge}>
                                                    {index === 0 && <FaTrophy className={styles.trophyIcon} />}
                                                    {index === 1 && <FaMedal className={styles.medalIcon} />}
                                                    {index === 2 && <FaAward className={styles.awardIcon} />}
                                                </div>
                                                <h3 className={styles.playerName}>{player.name}</h3>
                                                <div className={styles.playerStats}>
                                                    <div className={styles.statItem}>
                                                        <span className={styles.statLabel}>KD:</span>
                                                        <span className={styles.statValue}>{player.kd?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className={styles.statItem}>
                                                        <span className={styles.statLabel}>Matches:</span>
                                                        <span className={styles.statValue}>{player.games || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.statsTableContainer}>
                    <div className={styles.statsTableWrapper}>
                        <h2 className={styles.sectionTitle}>
                            Full Season Stats: {formatDate(selectedSeason.startDate)} to {formatDate(selectedSeason.endDate)}
                        </h2>
                        <table className={styles.statsTable}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>KD</th>
                                    <th>Matches</th>
                                    <th className={styles.hideMobile}>Avg Score</th>
                                    <th className={styles.hideMobile}>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* In the full stats table section, modify the tr element like this: */}
                                {selectedSeason.players?.map((player, index) => (
                                    <tr
                                        key={player.rank}
                                        className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${player.rank <= 3 ? styles['rank' + player.rank] : ''}`}
                                    >
                                        <td className={styles.rankColumn}>
                                            #{player.rank}
                                            {player.rank === 1 && <FaTrophy className={styles.trophyIcon} />}
                                            {player.rank === 2 && <FaMedal className={styles.medalIcon} />}
                                            {player.rank === 3 && <FaAward className={styles.awardIcon} />}
                                        </td>
                                        <td>{player.name}</td>
                                        <td>{player.kd?.toFixed(2) || '0.00'}</td>
                                        <td>{player.games || 0}</td>
                                        <td className={styles.hideMobile}>{player.avg_score?.toFixed(2) || '0.00'}</td>
                                        <td className={styles.hideMobile}>{player.last_seen ? new Date(player.last_seen).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default HallOfFame;