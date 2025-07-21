import { CalendarDays, Clock, MapPin, User, Eye } from 'lucide-react';
import Layout from '../../layout/Layout';
import { parseISO, differenceInHours, format } from 'date-fns';
import { Link } from 'react-router-dom';

import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';

const ListCitaciones = () => {
    const { data, isLoading } = useCitacionesFuturas();
    console.log(data);
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
                    {data.map((citacion, i) => {
                        const fechaCitacion = parseISO(citacion.fecha);
                        const horasRestantes = differenceInHours(fechaCitacion, new Date());
                        const disponibleParaLicencia = horasRestantes >= 24;
                        return (

                            <div className="col-md-6 col-lg-4 col-xl-3" key={i}>
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-body">

                                        <h6 className="fw-bold mb-1">{citacion.nombre}</h6>
                                        <span className={`badge mb-2 ${disponibleParaLicencia ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {disponibleParaLicencia ? 'Disponible para licencia' : 'No disponible para licencia'}
                                        </span>

                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <CalendarDays size={16} />
                                            {citacion.fecha?.split('T')[0]}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <Clock size={16} />
                                            {citacion.fecha?.split('T')[1]?.slice(0, 5)}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <MapPin size={16} />
                                            {citacion.lugar}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2">
                                            <MapPin size={16} />
                                            {citacion.tenida}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2 mb-2">
                                            <User size={16} />
                                            {citacion.autor_info?.username || '—'}
                                        </div>

                                        <div className="small mb-2">
                                            <strong>Descripción:</strong><br />
                                            {citacion.descripcion || 'Sin descripción'}
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center gap-3">
                                            {/* <button className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1">
                                                <Eye size={16} /> Ver
                                            </button> */}
                                            {disponibleParaLicencia && (
                                                <Link to={`/licencia/citacion/${citacion.id}`} className="btn btn-outline-primary btn-sm w-100">
                                                    Solicitar Licencia
                                                </Link>

                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            )}
        </Layout>
    );
};

export default ListCitaciones;
