import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/shop/purchaseTag.css";

const PurchaseTag = ({ pbId }) => {
    const [tag, setTag] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [days, setDays] = useState(1);
    const { updateUser } = useAuth();

    // Predefined color options for the dropdown
    const colorOptions = [
        { value: "#FF0000", label: "Red" },
        { value: "#00FF00", label: "Green" },
        { value: "#0000FF", label: "Blue" },
        { value: "#FFFF00", label: "Yellow" },
        { value: "#FF00FF", label: "Magenta" },
        { value: "#00FFFF", label: "Cyan" },
        { value: "#FFFFFF", label: "White" },
        { value: "#000000", label: "Black" },
    ];

    const buyTag = async () => {
        if (!pbId) {
            alert("Please log in first!");
            return;
        }

        if (tag.trim() === "") {
            alert("Tag name cannot be empty.");
            return;
        }

        if (days < 1) {
            alert("Days must be at least 1.");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/shop/buyTag`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ pbId, tagName: tag, price: 100, days, color }),
            });

            if (!response.ok) throw new Error("Failed to purchase tag");

            const data = await response.json();
            alert(data.message || "Tag purchased successfully!");

            if (data.user) {
                updateUser(data.user);
            }
        } catch (error) {
            alert("Error: " + error.message + 'MEOW');
        }
    };

    return (
        <div className="shop-card">
            <img src="/images/effects/tag.png" alt="Tag" className="tag-image" />
            <h5 className="shop-card-title">Buy a Tag</h5>
            <div className="price-container">
                <span className="price">100</span>
                <img src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png" alt="Tickets" className="ticket-icon" />
                <span className="per-day">/ day</span>
            </div>
            <input
                type="text"
                placeholder="Enter tag name"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="tag-input"
            />
            <div className="color-picker-container">
                <label htmlFor="color-picker">Choose a color:</label>
                <select
                    id="color-picker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-picker"
                >
                    {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
                className="days-input"
            />
            <button className="buy-button" onClick={buyTag}>Buy Tag</button>
        </div>
    );
};

export default PurchaseTag;