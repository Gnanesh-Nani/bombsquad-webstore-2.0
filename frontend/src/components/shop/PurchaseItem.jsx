import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext"; // Import the hook
import "../../styles/shop/purchaseItem.css";

const PurchaseItem = ({ item, pbId }) => {
    const [days, setDays] = useState(1);
    const { updateUser } = useAuth();
    const { showNotification } = useNotification(); // Get the notification function from context

    const buyItem = async () => {
        if (!pbId) {
            showNotification("Please log in first!", "error");
            return;
        }

        if (days < 1) {
            showNotification("Days must be at least 1", "warning");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/shop/buy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    pbId, 
                    itemName: item.name, 
                    price: item.price, 
                    days 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to purchase item");
            }

            const data = await response.json();

            if(data.success===false)
                showNotification(data.message || "Failed to purchase Item", "error");
            else    
                showNotification(data.message || "Item purchased successfully!", "success");

            if (data.user) {
                updateUser(data.user);
            }
        } catch (error) {
            showNotification(error.message || "Purchase failed", "error");
        }
    };

    return (
        <div className="shop-card">
            {/* Removed local Notification component - now handled globally */}
            <img src={item.image} alt={item.name} className="item-image" />
            <div className="shop-card-body">
                <h5 className="shop-card-title">{item.name}</h5>
                <div className="price-container">
                    <span className="price">{item.price}</span>
                    <img 
                        src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png" 
                        alt="Tickets" 
                        className="ticket-icon" 
                    />
                    <span className="per-day">/ day</span>
                </div>
                <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
                    className="days-input"
                />
                <button className="buy-button" onClick={buyItem}>
                    Buy Now
                </button>
            </div>
        </div>
    );
};

export default PurchaseItem;