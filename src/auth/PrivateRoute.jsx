import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function PrivateRoute({ children }) {
    const token = useAuthStore((state) => state.accessToken);
    return token ? children : <Navigate to="/login" />;
}
