//AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem("user")) || null;
        console.log("🔍 Initial user from localStorage:", storedUser);
        return storedUser;
    });

    const [loading, setLoading] = useState(true); // Add loading state
    const location = useLocation();

    // Fetch the latest user data on every page reload AND navigation
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
                    const standardizedUser = {
                        pbid: data.user.pbid,
                        tickets: data.user.tickets,
                        effect: data.user.effect || [],
                        tag: data.user.tag || [],
                    };
                    setUser(standardizedUser);
                    localStorage.setItem("user", JSON.stringify(standardizedUser));
                } else {
                    console.log("❌ No active session found.");
                    // Only logout if user was previously logged in
                    if (user) logout();
                }
            } catch (error) {
                console.error("❌ Session check failed", error);
                // Instead of logging out, we just log the error and do nothing
            } finally {
                setLoading(false);
            }
        };
    
        fetchSession();
    }, []); // ✅ Remove `location` dependency to prevent re-fetching on every navigation
    
    const login = (userData) => {
        console.log("🔑 Logging in user:", userData);

        const standardizedUser = {
            pbid: userData.pbid,
            tickets: userData.tickets,
            effect: userData.effect || [],
            tag: userData.tag || [],
        };

        console.log("✅ Setting user session (after standardization):", standardizedUser);
        setUser(standardizedUser);
        localStorage.setItem("user", JSON.stringify(standardizedUser));
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
            localStorage.removeItem("user");
        } catch (error) {
            console.error("❌ Logout failed", error);
        }
    };

    const updateUser = (updatedUserData) => {
        console.log("🛠 Updating user session with:", updatedUserData);

        const standardizedUser = {
            pbid: updatedUserData.pbid,
            tickets: updatedUserData.tickets,
            effect: updatedUserData.effect || [],
            tag: updatedUserData.tag || [],
        };

        console.log("✅ Updated user session (after standardization):", standardizedUser);
        setUser(standardizedUser);
        localStorage.setItem("user", JSON.stringify(standardizedUser));
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