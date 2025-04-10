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
                const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/session`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Session check failed");
                }

                const data = await response.json();

                if (data.user) {
                    setUser(data.user);
                } else {
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
        setUser(userData);
    };

    const logout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/logout`, {
                method: "POST",
                credentials: "include", // Include credentials (cookies)
            });

            setUser(null);
        } catch (error) {
            console.error("❌ Logout failed", error);
        }
    };

    const updateUser = (updatedUserData) => {
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