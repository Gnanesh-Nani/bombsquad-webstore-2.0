import React, { useEffect, useState } from "react";
import PurchaseItem from "../components/shop/PurchaseItem";
import PurchaseTag from "../components/shop/PurchaseTag";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import styles from "../styles/shop/shop.module.css";

const Shop = () => {
    const { user,updateUser } = useAuth();
    const [items, setItems] = useState([]);
    const { showNotification } = useNotification();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/shop/`, {
                    credentials: "include", // Include credentials (cookies)
                });
                const data = await response.json();
                if (data.success) {
                    setItems(data.items);
                }
            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            }
        };

        fetchData();
    }, [user]); // Re-fetch shop items when user changes (e.g., on reload)

    const formatEndDate = (endDate) => {
        if (!endDate) return "None";

        const date = new Date(endDate);
        const now = new Date();
        const timeDifference = date - now;
        const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));

        const formattedDate = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

        const color = hoursLeft < 5 ? "red" : "white";

        return <span style={{ color }}>{formattedDate}</span>;
    };

    return (
        <div className={styles.shopPage}>
            <h1>MR RIP SHOP</h1>

            {user ? (
                <div className={styles.userInfoBox}>
                    <div className={styles.balance}>
                        <span className={styles.label}>Balance:</span>
                        <span> {user?.tickets || 0}</span>
                        <img
                            src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png"
                            alt="Tickets"
                            className={styles.ticketIcon}
                        />
                    </div>
                    <div className={styles.activeEffects}>
                        <span>
                            <span className={styles.label}>Effect:</span>{" "}
                            <span className={styles.value}>{user?.effect?.[0] || "None"}</span> <br />
                            <span className={styles.label}>Ends on:</span>{" "}
                            <span className={styles.value}>{formatEndDate(user?.effect?.[1])}</span>
                            {user?.effect?.[0] && (
                                <button
                                    className={styles.removeButton}
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/shop/removeEffect`, {
                                                method: "POST",
                                                credentials: "include",
                                                headers: { "Content-Type": "application/json" },
                                            });
                                            const data = await response.json();
                                            if (data.success) {
                                                showNotification("Effect removed successfully", "success");
                                                // You might want to update the user context here
                                                if (data.user) {
                                                    updateUser(data.user);
                                                }
                                            } else {
                                                showNotification(data.message || "Failed to remove effect", "error");
                                            }
                                        } catch (error) {
                                            showNotification("Failed to remove effect", "error");
                                        }
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </span>
                    </div>
                    <div className={styles.activeTag}>
                        <span>
                            <span className={styles.label}>Tag:</span>{" "}
                            <span className={styles.value}>{user?.tag?.[0] || "None"}</span> <br />
                            <span className={styles.label}>Ends on:</span>{" "}
                            <span className={styles.value}>{formatEndDate(user?.tag?.[1])}</span>
                            {user?.tag?.[0] && (
                                <button
                                    className={styles.removeButton}
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/shop/removeTag`, {
                                                method: "POST",
                                                credentials: "include",
                                                headers: { "Content-Type": "application/json" },
                                            });
                                            const data = await response.json();
                                            if (data.success) {
                                                showNotification("Tag removed successfully", "success");
                                                if (data.user) {
                                                    updateUser(data.user);
                                                }
                                                // You might want to update the user context here
                                            } else {
                                                showNotification(data.message || "Failed to remove tag", "error");
                                            }
                                        } catch (error) {
                                            showNotification("Failed to remove tag", "error");
                                        }
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </span>
                    </div>
                </div>
            ) : (
                <Link to="/login" className={styles.loginPromptContainer}>
                    <div className={styles.loginPromptBox}>
                        <div className={styles.loginMessage}>
                            <User className={styles.icon} size={20} />
                            <span>Please Login First</span>
                        </div>
                    </div>
                </Link>
            )}

            {/* Shop Items */}
            <div className={styles.shopContainer}>
                {items.map((item, index) => (
                    <PurchaseItem key={index} item={item} pbId={user?.pbid} />
                ))}
                <PurchaseTag pbId={user?.pbid} />
            </div>
            <Footer />
        </div>
    );
};

export default Shop;