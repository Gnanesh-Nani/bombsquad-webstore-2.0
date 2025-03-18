import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Show a loading spinner while checking the session
    }

    return user ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;