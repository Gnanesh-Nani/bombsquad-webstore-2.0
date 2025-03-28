import React, { useEffect, useState } from "react";
import PurchaseItem from "../components/shop/PurchaseItem";
import PurchaseTag from "../components/shop/PurchaseTag";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import "../styles/shop/shop.css";

const Shop = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

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
    // Function to format the end date and determine its color
    const formatEndDate = (endDate) => {
        if (!endDate) return "None";

        const date = new Date(endDate);
        const now = new Date();
        const timeDifference = date - now;
        const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));

        // Format the date in a simple format (e.g., "Oct 25, 2023, 10:30 AM")
        const formattedDate = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

        // Determine the color based on the time left
        const color = hoursLeft < 5 ? "red" : "white";

        return <span style={{ color }}>{formattedDate}</span>;
    };

    return (
        <div className="shop-page">
            <h1>MR RIP SHOP</h1>

            {/* User Balance and Active Effects/Tag */}
            <div className="user-info-box">
                <div className="balance">
                    <span className="label">Balance:</span><span> {user?.tickets || 0}</span>
                    <img src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png" alt="Tickets" className="ticket-icon" />
                </div>
                <div className="active-effects">
                    <span>
                        <span className="label">Effect:</span>{" "}
                        <span className="value">{user?.effect?.[0] || "None"}</span> <br />
                        <span className="label">Ends on:</span>{" "}
                        <span className="value">{formatEndDate(user?.effect?.[1])}</span>
                    </span>
                </div>
                <div className="active-tag">
                    <span>
                        <span className="label">Tag:</span>{" "}
                        <span className="value">{user?.tag?.[0] || "None"}</span> <br />
                        <span className="label">Ends on:</span>{" "}
                        <span className="value">{formatEndDate(user?.tag?.[1])}</span>
                    </span>
                </div>
            </div>

            {/* Shop Items */}
            <div className="shop-container">
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