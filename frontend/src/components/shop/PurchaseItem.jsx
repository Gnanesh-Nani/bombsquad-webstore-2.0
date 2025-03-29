import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import styles from "../../styles/shop/purchaseItem.module.css"; // Updated import

const PurchaseItem = ({ item, pbId }) => {
    const [days, setDays] = useState(1);
    const { updateUser } = useAuth();
    const { showNotification } = useNotification();

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
        <div className={styles.shopCard}>
            <img src={item.image} alt={item.name} className={styles.itemImage} />
            <div className={styles.shopCardBody}>
                <h5 className={styles.shopCardTitle}>{item.name}</h5>
                <div className={styles.priceContainer}>
                    <span className={styles.price}>{item.price}</span>
                    <img 
                        src="https://static.wikia.nocookie.net/bombsquad/images/1/14/Tickets.png" 
                        alt="Tickets" 
                        className={styles.ticketIcon} 
                    />
                    <span className={styles.perDay}>/ day</span>
                </div>
                <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
                    className={styles.daysInput}
                />
                <button className={styles.buyButton} onClick={buyItem}>
                    Buy Now
                </button>
            </div>
        </div>
    );
};

export default PurchaseItem;