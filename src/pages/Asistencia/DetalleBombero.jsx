import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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

const buildChartData = (asistencias = 0, licencias = 0, inasistencias = 0) => {
  const segments = [
    { label: "Asistencias", value: asistencias, color: "#198754" },
    { label: "Licencias", value: licencias, color: "#0d6efd" },
    { label: "Inasistencias", value: inasistencias, color: "#dc3545" },
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

const DetalleBombero = () => {
  const { id } = useParams();
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
    queryKey: ["asistencia-bombero", id, year],
    queryFn: () => fetchWithToken(`/asistencia/usuario/${id}?anio=${year}`),
    enabled: !!id,
  });

  const resumen = useMemo(() => {
    if (!data) {
      return { segments: [], total: 0, chartData: null };
    }
    return buildChartData(data.asistencias, data.licencias, data.inasistencias);
  }, [data]);

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);
  const handleCurrentYear = () => setYear(currentYear);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <Link
              to="/asistencia/bomberos"
              className="btn btn-link px-0 text-decoration-none mb-2"
            >
              ← Volver al listado de bomberos
            </Link>
            <h2 className="mb-1">Asistencia por bombero</h2>
            <p className="text-muted mb-0">
              Desempeño anual de asistencia para el bombero seleccionado
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
          <div>Cargando asistencia del bombero...</div>
        ) : isError ? (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la asistencia del bombero."}
          </div>
        ) : !data ? (
          <div className="alert alert-info" role="alert">
            No se encontró información para el bombero indicado.
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="alert alert-info py-2">Actualizando información...</div>
            )}

            <div className="border rounded p-3 mb-4">
              <h5 className="mb-2">Datos del bombero</h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 small text-muted">
                <div className="col">
                  <div>
                    <strong>ID:</strong> {data.usuario?.id ?? "—"}
                  </div>
                </div>
                <div className="col">
                  <div>
                    <strong>Nombre:</strong> {`${data.usuario?.first_name || ""} ${data.usuario?.last_name || ""}`.trim() || "—"}
                  </div>
                </div>
                <div className="col">
                  <div>
                    <strong>Correo:</strong> {data.usuario?.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4 align-items-center">
              <div className="col-md-5 d-flex justify-content-center">
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

              <div className="col-md-7">
                <div className="row g-3">
                  {resumen.segments.map((segment) => (
                    <div key={segment.label} className="col-sm-6">
                      <div className="border rounded p-3 h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span
                            className="rounded-circle d-inline-block"
                            style={{ width: 12, height: 12, backgroundColor: segment.color }}
                          />
                          <strong>{segment.label}</strong>
                        </div>
                        <div className="h3 fw-bold mb-0">{segment.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-sm-6 col-lg-3">
                <div className="border rounded p-3 text-center">
                  <strong className="d-block text-muted">Citaciones</strong>
                  <span className="display-6 fw-bold">{data.total_citaciones ?? 0}</span>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="border rounded p-3 text-center">
                  <strong className="d-block text-muted">Emergencias</strong>
                  <span className="display-6 fw-bold">{data.total_emergencias ?? 0}</span>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="border rounded p-3 text-center">
                  <strong className="d-block text-muted">Listas creadas</strong>
                  <span className="display-6 fw-bold">{data.total_listas ?? 0}</span>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="border rounded p-3 text-center">
                  <strong className="d-block text-muted">Año</strong>
                  <span className="display-6 fw-bold">{data.anio ?? year}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DetalleBombero;
