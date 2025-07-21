import useAuthStore from '../../store/useAuthStore';
import { LogOut } from 'lucide-react';
import Layout from '../../layout/Layout';

export default function Dashboard() {
    const logout = useAuthStore((s) => s.logout);

    return (
        <Layout>
            <div className="container mt-5">
                <h1>Bienvenido a la Intranet de Bomberos</h1>
                <button className="btn btn-outline-danger mt-3" onClick={logout}>
                    <LogOut className="me-2" /> Cerrar sesión
                </button>
            </div>
        </Layout>
    );
}
