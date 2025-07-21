import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format } from 'date-fns';
import Layout from '../../layout/Layout';

const DetalleListaAsistencia = () => {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['lista-asistencia', id],
        queryFn: () => fetchWithToken(`/listas-asistencia/${id}/`),
    });

    if (isLoading) return <div className="container mt-4">Cargando...</div>;
    if (error || !data) return <div className="container mt-4 text-danger">Error al cargar los datos</div>;

    const { evento, tipo, fecha_creacion, asistencias, licencias } = data;

    const renderEventoDetalle = () => {
        if (tipo === 'citacion') {
            return (
                <>
                    <p><strong>Nombre:</strong> {evento.nombre}</p>
                    <p><strong>Descripción:</strong> {evento.descripcion || '-'}</p>
                    <p><strong>Lugar:</strong> {evento.lugar}</p>
                    <p><strong>Tenida:</strong> {evento.tenida}</p>
                    <p><strong>Fecha:</strong> {format(new Date(evento.fecha), 'dd-MM-yyyy HH:mm')}</p>
                </>
            );
        } else if (tipo === 'emergencia') {
            return (
                <>
                    <p><strong>Clave:</strong> {evento.clave}</p>
                    <p><strong>Unidades:</strong> {evento.unidades}</p>
                    <p><strong>Fecha:</strong> {format(new Date(evento.fecha), 'dd-MM-yyyy HH:mm')}</p>
                </>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div className="container bg-white rounded shadow-sm p-4 mt-4">
                <h2>Detalle Lista de Asistencia #{id}</h2>

                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">{tipo === 'citacion' ? 'Citación' : 'Emergencia'}</h5>
                        {renderEventoDetalle()}
                        <p><strong>Fecha de creación:</strong> {format(new Date(fecha_creacion), 'dd-MM-yyyy HH:mm')}</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <h5 className="mb-2">Asistentes</h5>
                        {asistencias?.length > 0 ? (
                            <ul className="list-group">
                                {asistencias.map((a) => (
                                    <li key={a.bombero_id} className="list-group-item">
                                        {`${a.first_name} ${a.last_name}`}
                                        {a.hora_llegada && ` — Llegó: ${format(new Date(a.hora_llegada), 'HH:mm')}`}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No hay asistentes registrados</p>
                        )}
                    </div>

                    {tipo === 'citacion' && (
                        <div className="col-md-6">
                            <h5 className="mb-2">Licencias</h5>
                            {licencias?.length > 0 ? (
                                <ul className="list-group">
                                    {licencias.map((l, i) => (
                                        <li key={i} className="list-group-item">
                                            {`${l.first_name} ${l.last_name}`} — {l.motivo}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No hay licencias registradas</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DetalleListaAsistencia;
