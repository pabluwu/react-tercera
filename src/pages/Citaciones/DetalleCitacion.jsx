import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, User, FileText, ArrowLeft } from 'lucide-react';
import Layout from '../../layout/Layout';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format } from 'date-fns';
import { canSeeLicencias } from '../../auth/roleUtils';
import useAuthStore from '../../store/useAuthStore';

const formatDate = (isoDate, formatPattern) => {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return format(date, formatPattern);
};

const DetalleCitacion = () => {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['citacion-detalle', id],
    queryFn: () => fetchWithToken(`/citaciones/${id}/`),
    enabled: !!id,
  });

  const {
    data: listaAsistencia,
    isLoading: isLoadingLista,
    isError: isErrorLista,
    error: errorLista,
    refetch: refetchLista,
    isFetching: isFetchingLista,
  } = useQuery({
    queryKey: ['lista-asistencia', id],
    queryFn: async () => {
      const response = await fetchWithToken(`/listas-asistencia/?content_type=citacion&object_id=${id}`);
      if (Array.isArray(response) && response.length > 0) {
        return response[0];
      }
      return null;
    },
    enabled: !!id,
  });

  const hasLista = !!listaAsistencia;

  const fechaTexto = data?.fecha
    ? formatDate(data.fecha, 'yyyy-MM-dd')
    : '—';
  const horaTexto = data?.fecha
    ? formatDate(data.fecha, 'HH:mm')
    : '—';

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <Link to="/citaciones/todas" className="btn btn-link px-0 text-decoration-none mb-2">
              <ArrowLeft size={16} className="me-1" />
              Volver a todas las citaciones
            </Link>
            <h2 className="mb-1">{data?.nombre ?? 'Detalle de citación'}</h2>
            <p className="text-muted mb-0">
              Información completa de la citación registrada
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/citaciones/list" className="btn btn-outline-secondary btn-sm">
              Próximas citaciones
            </Link>
            <Link to="/citaciones/crear" className="btn btn-danger btn-sm">
              Nueva citación
            </Link>
          </div>
        </div>

        {!id && (
          <div className="alert alert-danger">
            No se proporcionó un identificador de citación.
          </div>
        )}

        {isLoading && <div>Cargando detalle de la citación...</div>}

        {isError && (
          <div className="alert alert-danger" role="alert">
            {error?.message || 'No se pudo obtener el detalle de la citación.'}
          </div>
        )}

        {!isLoading && data && (
          <>
            {isFetching && (
              <div className="alert alert-info py-2">
                Actualizando información...
              </div>
            )}

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="border rounded p-3 mb-3">
                  <h5 className="mb-3">Información general</h5>
                  <div className="row row-cols-1 row-cols-md-2 g-3">
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <CalendarDays size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Fecha</small>
                          <strong>{fechaTexto}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Clock size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Hora</small>
                          <strong>{horaTexto}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MapPin size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Lugar</small>
                          <strong>{data?.lugar || '—'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MapPin size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Tenida</small>
                          <strong>{data?.tenida || '—'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <User size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Autor</small>
                          <strong>{data?.autor_info?.username || data?.autor || '—'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <FileText size={18} />
                        <div>
                          <small className="d-block text-uppercase text-muted">Tipo</small>
                          <strong>{data?.tipo || '—'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-3">
                  <h5 className="mb-3">Descripción detallada</h5>
                  <p className="mb-0">
                    {data?.descripcion ? data.descripcion : 'No se registró una descripción para esta citación.'}
                  </p>
                </div>

                {/* 1. Abrimos llave para la lógica */}
                {canSeeLicencias(user) && (
                  /* 2. El div principal que envuelve todo */
                  <div className="border rounded p-3">
                    <h5 className="mb-3">Asistencia y licencias</h5>

                    {isLoadingLista ? (
                      <div>Cargando información de asistencia...</div>
                    ) : isErrorLista ? (
                      <div className="alert alert-warning mb-0">
                        {errorLista?.message || 'No se pudo obtener la información de asistencia.'}
                      </div>
                    ) : !hasLista ? (
                      <p className="mb-0 text-muted">
                        No hay un registro de asistencia asociado a esta citación.
                      </p>
                    ) : (
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                        <div>
                          <p className="mb-1 fw-semibold">Existe una lista de asistencia para esta citación.</p>
                          <small className="text-muted">
                            Creada el {formatDate(listaAsistencia.fecha_creacion, 'yyyy-MM-dd HH:mm')}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => refetchLista()}
                          >
                            Refrescar
                          </button>
                          <Link
                            to={`/lista/${listaAsistencia.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Ver lista
                          </Link>
                        </div>
                      </div>
                    )}
                  </div> /* 3. Cerramos el div principal */
                )} {/* 4. Cerramos paréntesis y llave de la condición */}
              </div>

              <div className="col-lg-4">
                <div className="border rounded p-3 mb-3">
                  <h5 className="mb-3">Estado y acciones</h5>
                  <p className="mb-2 text-muted small">
                    Última actualización: {formatDate(data?.updated_at ?? data?.fecha, 'yyyy-MM-dd HH:mm')}
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => refetch()}
                    >
                      Actualizar información
                    </button>
                    <Link to={`/licencia/citacion/${data?.id}`} className="btn btn-outline-primary btn-sm">
                      Solicitar licencia
                    </Link>
                  </div>
                </div>

                {data?.documento && (
                  <div className="border rounded p-3">
                    <h5 className="mb-3">Documentos adjuntos</h5>
                    <a
                      href={data.documento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link px-0"
                    >
                      Ver documento adjunto
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DetalleCitacion;
