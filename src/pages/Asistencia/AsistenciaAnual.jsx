import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

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

const AsistenciaAnual = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["asistencia-anual", year],
    queryFn: () => fetchWithToken(`/asistencia/anual/?anio=${year}`),
    enabled: !!year,
  });

  const resumen = useMemo(() => {
    if (!data) {
      return { segments: [], total: 0, chartData: null };
    }
    return buildChartData(data.totales, data.porcentajes);
  }, [data]);

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);
  const handleCurrentYear = () => setYear(currentYear);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h2 className="mb-1">Asistencia anual</h2>
            <p className="text-muted mb-0">
              Consolidado de asistencia, licencias e inasistencias para el año seleccionado
            </p>
          </div>
          <div className="d-flex gap-2">
            <div className="btn-group btn-group-sm" role="group" aria-label="Seleccionar año">
              <button type="button" className="btn btn-outline-secondary" onClick={handlePrevYear}>
                {year - 1}
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${year === currentYear ? "active text-white" : ""}`}
                onClick={handleCurrentYear}
              >
                {currentYear}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleNextYear}>
                {year + 1}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div>Cargando asistencia anual...</div>
        ) : isError ? (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la asistencia anual."}
          </div>
        ) : !data ? (
          <div className="alert alert-info" role="alert">
            No se encontró información para el año seleccionado.
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="alert alert-info py-2">Actualizando información...</div>
            )}

            <div className="row g-4 mb-4">
              <div className="col-md-8">
                <div className="border rounded p-3 h-100">
                  <h5 className="mb-3">Resumen del año {data.anio}</h5>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 small text-muted">
                    <div className="col">
                      <div className="border rounded p-3 h-100">
                        <strong className="d-block">Citaciones</strong>
                        <span className="display-6 fw-bold">{data.total_citaciones ?? 0}</span>
                      </div>
                    </div>
                    <div className="col">
                      <div className="border rounded p-3 h-100">
                        <strong className="d-block">Emergencias</strong>
                        <span className="display-6 fw-bold">{data.total_emergencias ?? 0}</span>
                      </div>
                    </div>
                    <div className="col">
                      <div className="border rounded p-3 h-100">
                        <strong className="d-block">Listas creadas</strong>
                        <span className="display-6 fw-bold">{data.total_listas ?? 0}</span>
                      </div>
                    </div>
                    <div className="col">
                      <div className="border rounded p-3 h-100">
                        <strong className="d-block">Bomberos registrados</strong>
                        <span className="display-6 fw-bold">{data.total_bomberos ?? 0}</span>
                      </div>
                    </div>
                    <div className="col">
                      <div className="border rounded p-3 h-100">
                        <strong className="d-block">Eventos posibles</strong>
                        <span className="display-6 fw-bold">{data.total_posibles ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 d-flex align-items-center justify-content-center">
                {resumen.chartData ? (
                  <div style={{ width: 260, height: 260 }}>
                    <Pie
                      data={resumen.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
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
                    style={{ width: 220, height: 220, borderColor: "#dee2e6" }}
                  >
                    <div className="fw-bold h4 mb-0">0</div>
                    <small>Sin registros para este año</small>
                  </div>
                )}
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
                <div className="row g-3">
                  {resumen.segments.map((segment) => (
                    <div key={segment.label} className="col-sm-6 col-lg-4">
                      <div className="border rounded p-3 h-100 text-center">
                        <span
                          className="d-inline-block rounded-circle mb-2"
                          style={{ width: 12, height: 12, backgroundColor: segment.color }}
                        />
                        <div className="fw-semibold">{segment.label}</div>
                        <div className="h4 fw-bold mb-0">{segment.value}</div>
                        <small className="text-muted">
                          {segment.percentage ?? 0}% del total
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AsistenciaAnual;
