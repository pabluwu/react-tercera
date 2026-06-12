import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function ModuleRoute({ children, moduleName }) {
    const user = useAuthStore((state) => state.user);
    const modulosActivos = user?.tenant?.modulos_activos || [];

    if (!modulosActivos.includes(moduleName)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
