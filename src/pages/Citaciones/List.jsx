import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import Layout from '../../layout/Layout';
import { parseISO, differenceInHours } from 'date-fns';
import { Link } from 'react-router-dom';

import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';

const ListCitaciones = () => {
    const { data, isLoading } = useCitacionesFuturas();

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Citaciones</h2>
                    <p className="text-muted mb-0">Gestión y seguimiento de citaciones</p>
                </div>
                <Link to={'/citaciones/crear'} className="btn btn-danger">Nueva Citación</Link>
            </div>

            {isLoading ? (
                <p>Cargando citaciones...</p>
            ) : (
                <div className="row g-4">
                    {data.map((citacion) => {
                        const fechaCitacion = parseISO(citacion.fecha);
                        const horasRestantes = differenceInHours(fechaCitacion, new Date());
                        const disponibleParaLicencia = horasRestantes >= 24;
                        const fechaTexto = citacion.fecha?.split('T')[0] ?? '—';
                        const horaTexto = citacion.fecha?.split('T')[1]?.slice(0, 5) ?? '—';

                        return (
                            <div className="col-md-6 col-lg-4 col-xl-3" key={citacion.id}>
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-body d-flex flex-column">
                                        <h6 className="fw-bold mb-1">{citacion.nombre}</h6>
                                        <span
                                            className={`badge mb-2 ${disponibleParaLicencia ? 'bg-success' : 'bg-warning text-dark'}`}
                                        >
                                            {disponibleParaLicencia ? 'Disponible para licencia' : 'No disponible para licencia'}
                                        </span>

                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <CalendarDays size={16} />
                                            {fechaTexto}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <Clock size={16} />
                                            {horaTexto}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <MapPin size={16} />
                                            {citacion.lugar || '—'}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <MapPin size={16} />
                                            {citacion.tenida || '—'}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2 mb-2">
                                            <User size={16} />
                                            {citacion.autor_info?.username || '—'}
                                        </div>

                                        <div className="small mb-3 flex-grow-1">
                                            <strong>Descripción:</strong><br />
                                            {citacion.descripcion || 'Sin descripción'}
                                        </div>

                                        <div className="d-flex flex-column gap-2 mt-auto">
                                            <Link
                                                to={`/citaciones/${citacion.id}`}
                                                className="btn btn-outline-secondary btn-sm"
                                            >
                                                Ver detalle
                                            </Link>
                                            {disponibleParaLicencia && (
                                                <Link
                                                    to={`/licencia/citacion/${citacion.id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    Solicitar Licencia
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};

export default ListCitaciones;
