import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
import styles from "../styles/player/player.module.css";

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
    <div className={styles.statsPage}>
      <div className={styles.loadingText}>Loading player data...</div>
    </div>
  );

  if (error) return (
    <div className={styles.statsPage}>
      <div className={styles.errorText}>Error: {error}</div>
    </div>
  );

  if (!playerData) return (
    <div className={styles.statsPage}>
      <div className={styles.errorText}>Player not found</div>
    </div>
  );

  return (
    <div className={styles.statsPage}>
      <div className={styles.tableHeader}>
        <div className={styles.headerLeft}>
          <h1>{playerData.name || pbid}</h1>
        </div>
        <div className={styles.headerRight}>
          {playerData.rank && <div className={styles.playerRank}>Rank #{playerData.rank}</div>}
        </div>
      </div>

      <div className={styles.statsTableContainer}>
        <div className={styles.statsTableWrapper}>
          <div className={styles.playerContent}>
            <div className={styles.modelSection}>
              <div className={styles.modelWrapper}>
                <ModelViewer />
              </div>
              <PlayerBadges
                effect={playerData.effect}
                tag={playerData.tag}
              />
            </div>

            <div className={styles.dataSection}>
              <PlayerStats
                pbid={pbid}
                tickets={playerData.tickets}
                games={playerData.games}
                lastSeen={playerData.last_seen}
              />

              <div className={styles.statsGrid}>
                <StatCard label="Kills" value={playerData.kills} />
                <StatCard label="Deaths" value={playerData.deaths} />
                <StatCard label="K/D Ratio" value={playerData.kd?.toFixed(2)} />
                <StatCard label="Total Scores" value={playerData.scores} />
                <StatCard label="Avg Score" value={playerData.avg_score?.toFixed(2)} />
                <StatCard label="Games Played" value={playerData.games} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerBadges = ({ effect, tag }) => {
  return (
    <div className={styles.badgesContainer}>
      {effect && effect.length >= 2 && (
        <div className={`${styles.badge} ${styles.effectBadge}`}>
          <span>Effect: {effect[0]}</span>
          <span className={styles.badgeTime}>Ends: {formatDate(effect[1])}</span>
        </div>
      )}
      {tag && tag.length >= 2 && (
        <div className={`${styles.badge} ${styles.tagBadge}`}>
          <span>Tag: {tag[0]}</span>
          <span className={styles.badgeTime}>Ends: {formatDate(tag[1])}</span>
        </div>
      )}
    </div>
  );
};

const PlayerStats = ({ pbid, tickets, games, lastSeen }) => (
  <div className={styles.profileStats}>
    <div className={styles.statRow}>
      <span className={styles.statLabel}>PB-ID:</span>
      <span className={styles.statValue}>{pbid}</span>
    </div>
    <div className={styles.statRow}>
      <span className={styles.statLabel}>Tickets:</span>
      <span className={styles.statValue}>
        {tickets?.toLocaleString() || 0}
        <img
          src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png"
          alt="Tickets"
          className={styles.ticketIcon}
        />
      </span>

    </div>
    <div className={styles.statRow}>
      <span className={styles.statLabel}>Games Played:</span>
      <span className={styles.statValue}>{games}</span>
    </div>
    <div className={styles.statRow}>
      <span className={styles.statLabel}>Last Seen:</span>
      <span className={styles.statValue}>
        {lastSeen ? formatDate(lastSeen) : "Unknown"}
      </span>
    </div>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className={styles.statCard}>
    <div className={styles.statValue}>{value || "N/A"}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export default PlayerPage;