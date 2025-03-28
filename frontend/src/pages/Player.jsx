import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
import styles from "../styles/player/player.module.css";
import Footer from "../components/Footer";

const Model = () => {
  const { scene } = useGLTF("/spaz/scene.gltf");
  return <primitive object={scene} scale={3.2} position={[0, -2.70, 0]} />;
};

const formatDate = (timestamp) => {
  if (!timestamp) return "None";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const ModelViewer = () => {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 40 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Environment preset="city" />
      <Suspense fallback={<Html center>Loading model...</Html>}>
        <Model />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

const PlayerPage = () => {
  const { pbid } = useParams();
  const { user, updateUser } = useAuth();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionResponse, statsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BACKEND_URL}/session`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_BACKEND_URL}/stats`, { credentials: "include" })
        ]);

        const [sessionData, statsData] = await Promise.all([
          sessionResponse.json(),
          statsResponse.json()
        ]);

        const playerStats = Object.entries(statsData.stats || {})
          .map(([id, player]) => ({ id, ...player }))
          .find(player => player.aid === pbid);

        setPlayerData({
          ...playerStats,
          tickets: sessionData.user?.tickets || 0,
          effect: sessionData.user?.effect || [],
          tag: sessionData.user?.tag || []
        });

        if (user?.pbid === pbid && sessionData.user) {
          updateUser(sessionData.user);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <div className={styles.loadingText}>Loading player data...</div>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorText}>Error loading player data</div>
      <div className={styles.errorDetails}>{error}</div>
    </div>
  );

  if (!playerData) return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundIcon}>🔍</div>
      <div className={styles.notFoundText}>Player not found</div>
    </div>
  );

  return (
    <div className={styles.playerContainer}>
      {/* Player Header Section */}
      <div className={styles.playerHeader}>
        <div className={styles.playerIdentity}>
          <h1 className={styles.playerName}>{playerData.name || pbid}</h1>
          {playerData.rank && (
            <div className={styles.playerRank}>
              <span className={styles.rankLabel}>Rank</span>
              <span className={styles.rankValue}>#{playerData.rank}</span>
            </div>
          )}
        </div>

        <div className={styles.playerMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>PB-ID</span>
            <span className={styles.metaValue}>{pbid}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last Seen</span>
            <span className={styles.metaValue}>
              {playerData.last_seen ? formatDate(playerData.last_seen) : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.playerContent}>
        {/* Left Column - Model and Badges */}
        <div className={styles.leftColumn}>
          <div className={styles.modelContainer}>
            <ModelViewer />
          </div>

          <div className={styles.badgesContainer}>
            {playerData.effect && playerData.effect.length >= 2 && (
              <div className={`${styles.badge} ${styles.effectBadge}`}>
                <div className={styles.badgeIcon}>✨</div>
                <div className={styles.badgeContent}>
                  <div className={styles.badgeTitle}>Special Effect</div>
                  <div className={styles.badgeName}>{playerData.effect[0]}</div>
                  <div className={styles.badgeExpiry}>Until: {formatDate(playerData.effect[1])}</div>
                </div>
              </div>
            )}

            {playerData.tag && playerData.tag.length >= 2 && (
              <div className={`${styles.badge} ${styles.tagBadge}`}>
                <div className={styles.badgeIcon}>🏷️</div>
                <div className={styles.badgeContent}>
                  <div className={styles.badgeTitle}>Player Tag</div>
                  <div className={styles.badgeName}>{playerData.tag[0]}</div>
                  <div className={styles.badgeExpiry}>Until: {formatDate(playerData.tag[1])}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className={styles.rightColumn}>
          {/* Tickets Card */}
          <div className={styles.ticketsCard}>
            <div className={styles.ticketsHeader}>
              <span className={styles.ticketsLabel}>Tickets</span>
            </div>
            <div className={styles.ticketsValueContainer}>
              <span className={styles.ticketsValue}>
                {playerData.tickets?.toLocaleString() || 0}
              </span>
              <img
                src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png"
                alt="Tickets"
                className={styles.ticketIcon}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <StatCard
              icon="🎯"
              label="Kills"
              value={playerData.kills}
              color="#4ade80"
            />
            <StatCard
              icon="💀"
              label="Deaths"
              value={playerData.deaths}
              color="#f87171"
            />
            <StatCard
              icon="⚖️"
              label="K/D Ratio"
              value={playerData.kd?.toFixed(2)}
              color="#60a5fa"
            />
            <StatCard
              icon="🏆"
              label="Total Scores"
              value={playerData.scores}
              color="#fbbf24"
            />
            <StatCard
              icon="📊"
              label="Avg Score"
              value={playerData.avg_score?.toFixed(2)}
              color="#a78bfa"
            />
            <StatCard
              icon="🎮"
              label="Games Played"
              value={playerData.games}
              color="#f472b6"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={styles.statCard} style={{ '--card-color': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue}>{value || "N/A"}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export default PlayerPage;