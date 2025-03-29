import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext"; // Import the context
import { Menu, X, ShoppingCart, Home, Youtube, LogOut, User, LogIn } from "lucide-react";
import "../styles/partials/navbar.css";

const NavBar = () => {
    const { user, logout } = useAuth();
    const { showNotification } = useNotification(); // Get the notification function from context
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
            showNotification("Logged out successfully", "success");
        } catch (error) {
            showNotification("Failed to logout", "error");
        }
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleProfileClick = () => {
        if (!user) {
            showNotification("Please login to access your profile", "warning");
            navigate("/login");
        } else {
            navigate(`/player/${user.pbid}`);
        }
    };

    return (
        <nav className="navbar">
            {/* Removed the local Notification component */}
            <div className="container">
                <Link to="/stats" className="navbar-brand">MR RIP - TEAMS</Link>

                {/* Desktop Navigation */}
                <div className="nav-container">
                    <div className="nav-links">
                        <Link to="/stats" className={`nav-link ${location.pathname === "/stats" ? "active" : ""}`}>
                            <Home className="icon" /> Home
                        </Link>
                        <Link to="/shop" className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}>
                            <ShoppingCart className="icon" /> Shop
                        </Link>
                        <button 
                            onClick={handleProfileClick}
                            className={`nav-link ${location.pathname.startsWith('/player') ? "active" : ""}`}
                        >
                            <User className="icon" /> My Profile
                        </button>
                        <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className="nav-link yt-link">
                            <Youtube className="icon" /> YouTube
                        </a>
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-logout">
                                <LogOut className="icon" /> Logout
                            </button>
                        ) : (
                            <button onClick={handleLogin} className="btn btn-logout">
                                <LogIn className="icon" /> Login
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-menu">
                    <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={30} /> : <Menu size={30} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Links */}
            {menuOpen && (
                <div className="mobile-nav-links">
                    <Link to="/stats" className={`nav-link ${location.pathname === "/stats" ? "active" : ""}`}>
                        <Home className="icon" /> Home
                    </Link>
                    <Link to="/shop" className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}>
                        <ShoppingCart className="icon" /> Shop
                    </Link>
                    <button
                        onClick={handleProfileClick}
                        className={`nav-link ${location.pathname.startsWith('/player') ? "active" : ""}`}
                    >
                        <User className="icon" /> My Profile
                    </button>
                    <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className="nav-link yt-link">
                        <Youtube className="icon" /> YouTube
                    </a>
                    {user ? (
                        <button onClick={handleLogout} className="btn btn-logout">
                            <LogOut className="icon" /> Logout
                        </button>
                    ) : (
                        <button onClick={handleLogin} className="btn btn-logout">
                            <LogIn className="icon" /> Login
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;