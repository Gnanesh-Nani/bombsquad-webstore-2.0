//App.jsx
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import StatsPage from "./pages/Stats";
import LoginPage from "./pages/Login";
import AutoLogin from "./pages/AutoLogin";
import NavBar from "./components/NavBar";
import Shop from "./pages/Shop";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

function App() {
    return (
        <AuthProvider>
            <NavBar />
            <Routes>
                <Route path="/" element={<ProtectedRoute element={<StatsPage />} />} />
                <Route path="/stats" element={<ProtectedRoute element={<StatsPage />} />} />
                <Route path="/shop" element={<ProtectedRoute element={<Shop />} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/autologin/:userId" element={<AutoLogin />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;