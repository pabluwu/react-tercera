import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
} from "chart.js";
import Layout from "../../layout/Layout";
import { fetchWithToken } from "../../api/fetchWithToken";
import { format } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

const formatFecha = (isoDate, pattern = "yyyy-MM-dd HH:mm") => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return format(date, pattern);
};

const buildChartData = (totales, porcentajes) => {
  const segments = [
    {
      label: "Asistentes",
      value: totales?.asistentes ?? 0,
      color: "#198754",
      percentage: porcentajes?.asistentes ?? 0,
    },
    {
      label: "Licencias",
      value: totales?.licencias ?? 0,
      color: "#0d6efd",
      percentage: porcentajes?.licencias ?? 0,
    },
    {
      label: "Inasistencias",
      value: totales?.inasistencias ?? 0,
      color: "#dc3545",
      percentage: porcentajes?.inasistencias ?? 0,
    },
  ];

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const chartData =
    total === 0
      ? null
      : {
          labels: segments.map((segment) => segment.label),
          datasets: [
            {
              data: segments.map((segment) => segment.value),
              backgroundColor: segments.map((segment) => segment.color),
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        };

  return { segments, total, chartData };
};

const ResumenCitacion = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["asistencia-resumen-citacion", id],
    queryFn: () => fetchWithToken(`/asistencia/resumen/${id}`),
    enabled: !!id,
  });

  const resumen = useMemo(() => {
    if (!data) {
      return {
        segments: [],
        total: 0,
        chartData: null,
      };
    }
    return buildChartData(data.totales, data.porcentajes);
  }, [data]);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <Link
              to="/asistencia/citaciones"
              className="btn btn-link px-0 text-decoration-none mb-2"
            >
              ← Volver a asistencias citaciones
            </Link>
            <h2 className="mb-1">Resumen de asistencia</h2>
            <p className="text-muted mb-0">
              Estadísticas de asistencia para la citación seleccionada
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
            <Link to={`/lista/${data?.citacion?.id}`} className="btn btn-outline-primary btn-sm">
              Ver citación
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div>Cargando resumen de asistencia...</div>
        ) : isError ? (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener el resumen de asistencia."}
          </div>
        ) : !data ? (
          <div className="alert alert-info" role="alert">
            No se encontró información de asistencia para la citación indicada.
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="alert alert-info py-2">
                Actualizando información...
              </div>
            )}

            <div className="border rounded p-3 mb-4">
              <h5 className="mb-2">Citación</h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 small text-muted">
                <div className="col">
                  <div>
                    <strong>ID:</strong> {data.citacion?.id ?? "—"}
                  </div>
                </div>
                <div className="col">
                  <div>
                    <strong>Nombre:</strong> {data.citacion?.nombre ?? "—"}
                  </div>
                </div>
                <div className="col">
                  <div>
                    <strong>Fecha:</strong> {formatFecha(data.citacion?.fecha)}
                  </div>
                </div>
                <div className="col">
                  <div>
                    <strong>Lugar:</strong> {data.citacion?.lugar ?? "—"}
                  </div>
                </div>
              </div>
              {data.citacion?.descripcion && (
                <p className="text-muted small mb-0 mt-3">
                  <strong>Descripción:</strong> {data.citacion.descripcion}
                </p>
              )}
            </div>

            <div className="row g-4 mb-4 align-items-center">
              <div className="col-md-5 d-flex justify-content-center">
                {resumen.chartData ? (
                  <div style={{ width: 280, height: 280 }}>
                    <Pie
                      data={resumen.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw ?? 0;
                                const pct =
                                  resumen.total > 0
                                    ? ` (${Math.round((value / resumen.total) * 100)}%)`
                                    : "";
                                return `${context.label}: ${value}${pct}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="border rounded d-flex flex-column align-items-center justify-content-center text-muted"
                    style={{ width: 240, height: 240, borderColor: "#dee2e6" }}
                  >
                    <div className="fw-bold h4 mb-0">0</div>
                    <small>Sin registros de asistencia</small>
                  </div>
                )}
              </div>

              <div className="col-md-7">
                <div className="row g-3">
                  {resumen.segments.map((segment) => (
                    <div key={segment.label} className="col-sm-6">
                      <div className="border rounded p-3 h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span
                            className="rounded-circle d-inline-block"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: segment.color,
                            }}
                          />
                          <strong>{segment.label}</strong>
                        </div>
                        <div className="h3 fw-bold mb-0">{segment.value}</div>
                        <small className="text-muted">
                          {segment.percentage ?? 0}% del total
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-4">
                <div className="border rounded p-3 h-100">
                  <h5 className="mb-3">Totales</h5>
                  <ul className="list-unstyled mb-0 small text-muted">
                    <li>
                      <strong>Registrados:</strong> {data.totales?.registrados ?? 0}
                    </li>
                    <li>
                      <strong>Asistentes:</strong> {data.totales?.asistentes ?? 0}
                    </li>
                    <li>
                      <strong>Licencias:</strong> {data.totales?.licencias ?? 0}
                    </li>
                    <li>
                      <strong>Inasistencias:</strong> {data.totales?.inasistencias ?? 0}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="border rounded p-3 mb-3">
                  <h5 className="mb-3">Asistentes</h5>
                  {data.asistentes?.length ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.asistentes.map((persona) => (
                            <tr key={persona.id}>
                              <td>{`${persona.first_name || ""} ${persona.last_name || ""}`.trim() || "—"}</td>
                              <td>{persona.email || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No se registraron asistentes.</p>
                  )}
                </div>

                <div className="border rounded p-3 mb-3">
                  <h5 className="mb-3">Licencias</h5>
                  {data.licencias?.length ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Motivo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.licencias.map((persona, index) => (
                            <tr key={`${persona.email}-${index}`}>
                              <td>{`${persona.first_name || ""} ${persona.last_name || ""}`.trim() || "—"}</td>
                              <td>{persona.email || "—"}</td>
                              <td>{persona.motivo || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No hay licencias registradas.</p>
                  )}
                </div>

                <div className="border rounded p-3">
                  <h5 className="mb-3">Inasistentes</h5>
                  {data.inasistentes?.length ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.inasistentes.map((persona) => (
                            <tr key={persona.id}>
                              <td>{`${persona.first_name || ""} ${persona.last_name || ""}`.trim() || "—"}</td>
                              <td>{persona.email || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No hay inasistencias registradas.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ResumenCitacion;
