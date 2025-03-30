import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const location = useLocation();

    // Fetch the latest user data on every page reload
    useEffect(() => {
        const fetchSession = async () => {
            try {
                console.log("🔄 Fetching session from server...");
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/session`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Session check failed");
                }

                const data = await response.json();
                console.log("📥 Session response received:", data);

                if (data.user) {
                    setUser(data.user);
                } else {
                    console.log("❌ No active session found.");
                    setUser(null);
                }
            } catch (error) {
                console.error("❌ Session check failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []); // Fetch session on component mount

    const login = (userData) => {
        console.log("🔑 Logging in user:", userData);
        setUser(userData);
    };

    const logout = async () => {
        try {
            console.log("🚪 Logging out user...");
            await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/logout`, {
                method: "POST",
                credentials: "include", // Include credentials (cookies)
            });

            console.log("🗑️ Clearing user session...");
            setUser(null);
        } catch (error) {
            console.error("❌ Logout failed", error);
        }
    };

    const updateUser = (updatedUserData) => {
        console.log("🛠 Updating user session with:", updatedUserData);
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };
    
    // Return loading state if session is being checked
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);