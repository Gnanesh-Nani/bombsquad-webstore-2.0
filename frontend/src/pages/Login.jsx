import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login/login.css";

const LoginPage = () => {
    const [pbId, setPbId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        console.log("🔍 Attempting login with:", { pbId, password });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ pbid: pbId, password }),
            });

            console.log("📡 Login request sent. Awaiting response...");
            const data = await response.json();
            console.log("📥 Response received:", data);

            if (response.ok) {
                console.log("✅ Login successful:", data.user);
                login(data.user); // Update both state and localStorage
                navigate("/");
            } else {
                console.log("❌ Login failed:", data.error);
                setError(data.error);
            }
        } catch (err) {
            console.error("🚨 Login error:", err);
            setError("Login failed. Try again.");
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
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default LoginPage;