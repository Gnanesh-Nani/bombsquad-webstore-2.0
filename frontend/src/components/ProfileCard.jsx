import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Adjust the import path as needed
import "../styles/partials/profileCard.css";

const formatDate = (timestamp) => {
    if (!timestamp) return "None"; // Handle null or undefined timestamp
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

const ProfileCard = ({ user }) => {
    const { updateUser } = useAuth(); // Access updateUser from AuthContext

    // Extract user data with default values
    const { pbid, tickets, effect = [], tag = [] } = user;

    // Extract effect name and end date
    const effectName = effect?.[0] || "None"; // Default to "None" if effect[0] is null/undefined
    const effectEndDate = formatDate(effect?.[1]);

    // Extract tag name and end date
    const tagName = tag?.[0] || "None"; // Default to "None" if tag[0] is null/undefined
    const tagEndDate = formatDate(tag?.[1]);

    // Fetch latest user data from the server
    useEffect(() => {
        const fetchLatestUserData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/session`, {
                    credentials: "include", // Include cookies (JWT token)
                });

                if (!response.ok) throw new Error("Failed to fetch user data");

                const data = await response.json();
                if (data.user) {
                    updateUser(data.user); // Update user data in AuthContext
                }
            } catch (error) {
                console.error("❌ Error fetching latest user data:", error.message);
            }
        };

        fetchLatestUserData(); // Fetch data when the component mounts or user prop changes
    }, []); 

    return (
        <div
            className="profile-card"
            onClick={(e) => e.stopPropagation()} // Prevent event propagation
        >
            <h4 className="profile-name">{pbid}</h4>
            <div className="profile-detail">
                <span className="detail-label">Tickets:</span>
                <span className="detail-value">
                    {tickets.toLocaleString()}
                    <img
                        src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png"
                        alt="Tickets"
                        className="ticket-icon"
                    />
                </span>
            </div>
            <div className="profile-detail">
                <span className="detail-label">Effect:</span>
                <span className="detail-value">
                    {effectName} <span className="detail-date">(until {effectEndDate})</span>
                </span>
            </div>
            <div className="profile-detail">
                <span className="detail-label">Tag:</span>
                <span className="detail-value">
                    {tagName} <span className="detail-date">(until {tagEndDate})</span>
                </span>
            </div>
        </div>
    );
};

export default ProfileCard;