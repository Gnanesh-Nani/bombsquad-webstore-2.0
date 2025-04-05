import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext"; // Add this import
import StatsPage from "./pages/Stats";
import LoginPage from "./pages/Login";
import AutoLogin from "./pages/AutoLogin";
import NavBar from "./components/NavBar";
import Shop from "./pages/Shop";
import PlayerPage from "./pages/Player";
import HallOfFame from "./pages/HallOfFame";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <NotificationProvider> {/* Wrap with NotificationProvider */}
                <NavBar />
                <Routes>
                    <Route path="/" element={<StatsPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/halloffame" element={<HallOfFame/>}/>
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/autologin/:userId" element={<AutoLogin />} />
                    <Route path="/player/:pbid" element={<PlayerPage />} />

                </Routes>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;