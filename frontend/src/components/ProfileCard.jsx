import React, { useState, useEffect, useRef } from "react";
import "../styles/partials/profileCard.css";

const formatDate = (timestamp) => {
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

const ProfileCard = ({ user, onClose }) => {
    const { pbid, tickets, effect, tag } = user;

    // Extract effect name and end date
    const effectName = effect[0];
    const effectEndDate = formatDate(effect[1]);

    // Extract tag name and end date
    const tagName = tag[0];
    const tagEndDate = formatDate(tag[1]);

    return (
        <div className="profile-card">
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