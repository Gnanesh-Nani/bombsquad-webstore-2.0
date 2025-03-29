import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import styles from "../styles/login/login.module.css"; // Updated import

const LoginPage = () => {
    const [pbId, setPbId] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ pbid: pbId, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.user);
                showNotification("Login successful! Welcome back!", "success");
                navigate("/");
            } else {
                showNotification(data.error || "Invalid credentials", "error");
            }
        } catch (err) {
            showNotification("Login failed. Please try again.", "error");
            console.error("Login error:", err);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <h2 className={styles.loginTitle}>Login</h2>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label>PB-ID:</label>
                        <input 
                            type="text" 
                            value={pbId} 
                            onChange={(e) => setPbId(e.target.value)} 
                            required 
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className={styles.formInput}
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>Login</button>
                    <small className={styles.formText}>
                        Note: Please grab your PB-ID and password from the MR-RIP SERVER using the <code>/password</code> command.
                    </small>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;