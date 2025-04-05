import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Menu, X, ShoppingCart, Home, Youtube, LogOut,Trophy , User, LogIn } from "lucide-react";
import styles from "../styles/partials/navbar.module.css"; // Updated import

const NavBar = () => {
    const { user, logout } = useAuth();
    const { showNotification } = useNotification();
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
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/stats" className={styles.navbarBrand}>MR RIP - TEAMS</Link>

                {/* Desktop Navigation */}
                <div className={styles.navContainer}>
                    <div className={styles.navLinks}>
                        <Link to="/stats" className={`${styles.navLink} ${location.pathname === "/stats" ? styles.active : ""}`}>
                            <Home className={styles.icon} /> Home
                        </Link>
                        <Link to="/halloffame" className={`${styles.navLink} ${location.pathname === "/halloffame" ? styles.active : ""}`}>
                            <Trophy className={styles.icon} /> Hall of Fame
                        </Link>
                        <Link to="/shop" className={`${styles.navLink} ${location.pathname === "/shop" ? styles.active : ""}`}>
                            <ShoppingCart className={styles.icon} /> Shop
                        </Link>
                        <button 
                            onClick={handleProfileClick}
                            className={`${styles.navLink} ${location.pathname.startsWith('/player') ? styles.active : ""}`}
                        >
                            <User className={styles.icon} /> My Profile
                        </button>
                        <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className={`${styles.navLink} ${styles.ytLink}`}>
                            <Youtube className={styles.icon} /> YouTube
                        </a>
                        {user ? (
                            <button onClick={handleLogout} className={styles.btnLogout}>
                                <LogOut className={styles.icon} /> Logout
                            </button>
                        ) : (
                            <button onClick={handleLogin} className={styles.btnLogout}>
                                <LogIn className={styles.icon} /> Login
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className={styles.mobileMenu}>
                    <button className={styles.mobileMenuButton} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={30} /> : <Menu size={30} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Links */}
            {menuOpen && (
                <div className={styles.mobileNavLinks}>
                    <Link to="/stats" className={`${styles.navLink} ${location.pathname === "/stats" ? styles.active : ""}`}>
                        <Home className={styles.icon} /> Home
                    </Link>
                    <Link to="/shop" className={`${styles.navLink} ${location.pathname === "/shop" ? styles.active : ""}`}>
                        <ShoppingCart className={styles.icon} /> Shop
                    </Link>
                    <button
                        onClick={handleProfileClick}
                        className={`${styles.navLink} ${location.pathname.startsWith('/player') ? styles.active : ""}`}
                    >
                        <User className={styles.icon} /> My Profile
                    </button>
                    <a href="https://www.youtube.com/@RIPNANI" target="_blank" rel="noopener noreferrer" className={`${styles.navLink} ${styles.ytLink}`}>
                        <Youtube className={styles.icon} /> YouTube
                    </a>
                    {user ? (
                        <button onClick={handleLogout} className={styles.btnLogout}>
                            <LogOut className={styles.icon} /> Logout
                        </button>
                    ) : (
                        <button onClick={handleLogin} className={styles.btnLogout}>
                            <LogIn className={styles.icon} /> Login
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;