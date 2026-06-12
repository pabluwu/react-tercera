import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function PrivateRoute({ children }) {
    const token = useAuthStore((state) => state.accessToken);
    const location = useLocation();
    return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
