import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";


const AutoLogin = () => {
    const { userId } = useParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchAutoLogin = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/autologin/${userId}`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (data.user) {
                    login(data.user); // Update both state and localStorage
                    showNotification("Auto Login successful! Welcome back!", "success");
                    navigate("/");
                } else {
                    showNotification("❌ Auto-login failed","error");
                    navigate("/login");
                }
            } catch (error) {
                console.error("🚨 Auto-login error:", error);
                navigate("/login");
            }
        };

        fetchAutoLogin();
    }, [userId, login, navigate]);

    return <div>Logging in...</div>;
};

export default AutoLogin;