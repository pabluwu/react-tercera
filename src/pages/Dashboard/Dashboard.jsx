import useAuthStore from '../../store/useAuthStore';
import { LogOut, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '../../layout/Layout';
import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMesesGrouped } from '../../hooks/useMesesGrouped';
import { useMemo } from 'react';

export default function Dashboard() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const { data: citaciones, isLoading: loadingCitaciones } = useCitacionesFuturas();

    const archivosQuery = useQuery({
        queryKey: ['archivos-dashboard'],
        queryFn: () => fetchWithToken('/archivos/'),
    });

    const ownId = user?.id ? String(user.id) : null;
    const { dataByYear } = useMesesGrouped(ownId, !!ownId, false);

    const pendingCuotas = useMemo(() => {
        if (!dataByYear) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12

        return Object.entries(dataByYear).reduce((acc, [year, months]) => {
            const yearNum = Number(year);
            const filteredMonths = months.filter((m) => {
                if (m.pagado) return false;
                if (yearNum < currentYear) return true;
                if (yearNum === currentYear && m.numeroMes <= currentMonth) return true;
                return false;
            });
            return acc + filteredMonths.length;
        }, 0);
    }, [dataByYear]);

    const documentosAleatorios = useMemo(() => {
        const docs = Array.isArray(archivosQuery.data) ? archivosQuery.data : [];
        if (docs.length <= 4) return docs;
        const shuffled = [...docs].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, [archivosQuery.data]);

    return (
        <Layout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-0">Bienvenido</h2>
                        <p className="text-muted mb-0">
                            Resumen rápido de citaciones, archivos y tus cuotas pendientes.
                        </p>
                    </div>
                    <button className="btn btn-outline-danger" onClick={logout}>
                        <LogOut className="me-2" /> Cerrar sesión
                    </button>
                </div>

                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42 }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Citaciones próximas</p>
                                    <h4 className="mb-0">
                                        {loadingCitaciones ? <Loader2 className="spinner-border spinner-border-sm" /> : citaciones?.length ?? 0}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42 }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Documentos disponibles</p>
                                    <h4 className="mb-0">
                                        {archivosQuery.isLoading ? <Loader2 className="spinner-border spinner-border-sm" /> : archivosQuery.data?.length ?? 0}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42 }}>
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Cuotas pendientes</p>
                                    <h4 className="mb-0">
                                        {pendingCuotas}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3 mt-3">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Citaciones próximas</h5>
                                    <a className="text-primary small" href="/citaciones/list">Ver todas</a>
                                </div>
                                {loadingCitaciones && <p className="text-muted">Cargando citaciones...</p>}
                                {!loadingCitaciones && (!citaciones || citaciones.length === 0) && (
                                    <p className="text-muted mb-0">No hay citaciones próximas.</p>
                                )}
                                {!loadingCitaciones && citaciones && citaciones.length > 0 && (
                                    <ul className="list-group list-group-flush">
                                        {citaciones.slice(0, 5).map((cita) => (
                                            <li key={cita.id} className="list-group-item">
                                                <div className="fw-semibold">{cita.nombre}</div>
                                                <div className="text-muted small">
                                                    {cita.lugar} — {new Date(cita.fecha).toLocaleString()}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Documentos destacados</h5>
                                    <a className="text-primary small" href="/archivos/ver">Ver archivos</a>
                                </div>
                                {archivosQuery.isLoading && <p className="text-muted">Cargando documentos...</p>}
                                {archivosQuery.isError && (
                                    <p className="text-danger mb-0">No se pudieron cargar los documentos.</p>
                                )}
                                {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length === 0 && (
                                    <p className="text-muted mb-0">No hay documentos disponibles.</p>
                                )}
                                {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length > 0 && (
                                    <ul className="list-group list-group-flush">
                                        {documentosAleatorios.map((doc) => (
                                            <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="fw-semibold">{doc.nombre}</div>
                                                    <div className="text-muted small">{doc.descripcion}</div>
                                                </div>
                                                <a href={doc.archivo} target="_blank" rel="noopener noreferrer" className="text-primary small">
                                                    Abrir
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
