import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, ShoppingCart, Home, Youtube, LogOut, User } from "lucide-react";
import ProfileCard from "./ProfileCard";
import "../styles/partials/navbar.css";

const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileCardRef = useRef(null); // Ref for the profile card

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Handle clicks outside the profile card
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileCardRef.current &&
                !profileCardRef.current.contains(event.target) &&
                !event.target.closest(".profile-button") // Exclude profile button
            ) {
                setProfileOpen(false); // Close the profile card
            }
        };

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileCardRef]);

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/stats" className="navbar-brand">MR RIP - TEAMS</Link>

                {/* Desktop Navigation */}
                <div className="nav-container">
                    {user && (
                        <div className="user-profile desktop-only">
                            <button
                                className="profile-button"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <User size={24} /> Profile
                            </button>
                            {profileOpen && (
                                <div ref={profileCardRef}>
                                    <ProfileCard user={user} />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="nav-links">
                        <Link to="/stats" className={`nav-link ${location.pathname === "/stats" ? "active" : ""}`}>
                            <Home className="icon" /> Home
                        </Link>
                        <Link to="/shop" className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}>
                            <ShoppingCart className="icon" /> Shop
                        </Link>
                        <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className="nav-link yt-link">
                            <Youtube className="icon" /> YouTube
                        </a>
                        {user && (
                            <button onClick={handleLogout} className="btn btn-danger btn-logout">
                                <LogOut className="icon" /> Logout
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile View */}
                <div className="mobile-menu">
                    {user && (
                        <button
                            className="profile-button mobile-profile-button"
                            onClick={() => setProfileOpen(!profileOpen)}
                        >
                            <User size={24} />
                        </button>
                    )}
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
                    <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className="nav-link yt-link">
                        <Youtube className="icon" /> YouTube
                    </a>
                    {user && (
                        <button onClick={handleLogout} className="btn btn-danger btn-logout">
                            <LogOut className="icon" /> Logout
                        </button>
                    )}
                </div>
            )}

            {/* Mobile Profile Card */}
            {profileOpen && user && (
                <div ref={profileCardRef}>
                    <ProfileCard user={user} />
                </div>
            )}
        </nav>
    );
};

export default NavBar;