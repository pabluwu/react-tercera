import { useMemo, useState } from 'react';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { parseISO, differenceInHours, formatISO } from 'date-fns';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';
import { useCitaciones } from '../../hooks/useCitaciones';

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toISO = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return formatISO(date);
};

const currentYear = new Date().getFullYear();

const TodasLasCitaciones = () => {
  const [year, setYear] = useState(currentYear);
  const [fechaDesde, setFechaDesde] = useState(() =>
    formatDateForInput(new Date(currentYear, 0, 1))
  );
  const [fechaHasta, setFechaHasta] = useState(() =>
    formatDateForInput(new Date(currentYear, 11, 31))
  );

  const isoDesde = useMemo(() => toISO(fechaDesde, false), [fechaDesde]);
  const isoHasta = useMemo(() => toISO(fechaHasta, true), [fechaHasta]);

  const invalidRange =
    fechaDesde &&
    fechaHasta &&
    new Date(fechaDesde) > new Date(fechaHasta);

  const {
    data: citacionesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCitaciones({
    fechaDesde: isoDesde,
    fechaHasta: isoHasta,
    enabled: !invalidRange,
  });

  const citaciones = citacionesData || [];

  const handleSetYear = (targetYear) => {
    setYear(targetYear);
    setFechaDesde(formatDateForInput(new Date(targetYear, 0, 1)));
    setFechaHasta(formatDateForInput(new Date(targetYear, 11, 31)));
  };

  const handlePrevYear = () => handleSetYear((year || currentYear) - 1);
  const handleNextYear = () => handleSetYear((year || currentYear) + 1);
  const handleCurrentYear = () => handleSetYear(currentYear);

  const handleClearFilters = () => {
    setYear(null);
    setFechaDesde('');
    setFechaHasta('');
  };

  return (
    <Layout>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Todas las citaciones</h2>
          <p className="text-muted mb-0">Explora el historial completo de citaciones registradas</p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group btn-group-sm" role="group" aria-label="Seleccionar año">
            <button type="button" className="btn btn-outline-secondary" onClick={handlePrevYear}>
              {(year || currentYear) - 1}
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${year === currentYear ? 'active text-white' : ''}`}
              onClick={handleCurrentYear}
            >
              {currentYear}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleNextYear}>
              {(year || currentYear) + 1}
            </button>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
            Limpiar
          </button>
          <Link to="/citaciones/crear" className="btn btn-danger btn-sm">
            Nueva Citación
          </Link>
        </div>
      </div>

      <div className="border rounded p-3 mb-4 bg-light">
        <h5 className="mb-3">Filtrar por rango de fechas</h5>
        <div className="row g-3 align-items-end">
          <div className="col-sm-6 col-md-4 col-lg-3">
            <label htmlFor="fecha-desde" className="form-label">Desde</label>
            <input
              id="fecha-desde"
              type="date"
              className="form-control"
              value={fechaDesde}
              onChange={(event) => {
                setYear(null);
                setFechaDesde(event.target.value);
              }}
              max={fechaHasta || undefined}
            />
          </div>
          <div className="col-sm-6 col-md-4 col-lg-3">
            <label htmlFor="fecha-hasta" className="form-label">Hasta</label>
            <input
              id="fecha-hasta"
              type="date"
              className="form-control"
              value={fechaHasta}
              onChange={(event) => {
                setYear(null);
                setFechaHasta(event.target.value);
              }}
              min={fechaDesde || undefined}
            />
          </div>
          <div className="col-md-4 col-lg-3">
            <label className="form-label d-block">&nbsp;</label>
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              onClick={() => refetch()}
              disabled={invalidRange}
            >
              Aplicar filtros
            </button>
          </div>
          {invalidRange && (
            <div className="col-12">
              <div className="alert alert-warning py-2 mb-0">
                La fecha inicial no puede ser posterior a la fecha final.
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p>Cargando citaciones...</p>
      ) : isError ? (
        <div className="alert alert-danger" role="alert">
          {error?.message || 'No se pudo obtener la lista de citaciones.'}
        </div>
      ) : citaciones.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No se encontraron citaciones para los filtros seleccionados.
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="alert alert-info py-2">
              Actualizando resultados...
            </div>
          )}
          <div className="row g-4">
            {citaciones.map((citacion) => {
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
                        className={`badge mb-2 ${
                          disponibleParaLicencia ? 'bg-success' : 'bg-warning text-dark'
                        }`}
                      >
                        {disponibleParaLicencia
                          ? 'Disponible para licencia'
                          : 'No disponible para licencia'}
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
        </>
      )}
    </Layout>
  );
};

export default TodasLasCitaciones;
