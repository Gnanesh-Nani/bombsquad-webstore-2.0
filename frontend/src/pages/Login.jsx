import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import "../styles/login/login.css";

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
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">Login</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>PB-ID:</label>
                        <input 
                            type="text" 
                            value={pbId} 
                            onChange={(e) => setPbId(e.target.value)} 
                            required 
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <small className="form-text text-muted">
                        Note: Please grab your PB-ID and password from the MR-RIP SERVER using the <code>/password</code> command.
                    </small>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;