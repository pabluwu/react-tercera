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
import useAuthStore from "../../store/useAuthStore";
import { fetchWithToken } from "../../api/fetchWithToken";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

const MiAsistencia = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const [year, setYear] = useState(() => new Date().getFullYear());

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["asistencia-usuario", userId, year],
    queryFn: () => fetchWithToken(`/asistencia/usuario/${userId}?anio=${year}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => {
    if (!data) {
      return {
        segments: [],
        total: 0,
        chartData: null,
      };
    }

    const segments = [
      { label: "Asistencias", value: data.asistencias ?? 0, color: "#198754" },
      { label: "Licencias", value: data.licencias ?? 0, color: "#0d6efd" },
      { label: "Inasistencias", value: data.inasistencias ?? 0, color: "#dc3545" },
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
                borderColor: "#ffffff",
                borderWidth: 2,
              },
            ],
          };

    return { segments, total, chartData };
  }, [data]);

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);
  const handleCurrentYear = () => setYear(new Date().getFullYear());

  const displayedYear = year;

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-1">Mi asistencia</h2>
            <p className="text-muted mb-0">
              {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.email}
            </p>
          </div>
          <div className="btn-group btn-group-sm" role="group" aria-label="Cambiar año">
            <button type="button" className="btn btn-outline-secondary" onClick={handlePrevYear}>
              {displayedYear - 1}
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={handleCurrentYear}>
              {new Date().getFullYear()}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleNextYear}>
              {displayedYear + 1}
            </button>
          </div>
        </div>

        {!userId && (
          <div className="alert alert-danger">
            No se encontró información del usuario autenticado.
          </div>
        )}

        {isLoading && <div>Cargando asistencia...</div>}

        {isError && (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la asistencia."}
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-1">Resumen {displayedYear}</h5>
                <small className="text-muted">
                  Total de citaciones registradas: {data.total_citaciones ?? 0}
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => refetch()}
              >
                Actualizar datos
              </button>
            </div>

            {isFetching && (
              <div className="alert alert-info py-2">Actualizando información...</div>
            )}

            <div className="row align-items-center g-4">
              <div className="col-md-5 d-flex justify-content-center">
                {summary.chartData ? (
                  <div style={{ width: 260, height: 260 }}>
                    <Pie
                      data={summary.chartData}
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
                                  summary.total > 0
                                    ? ` (${Math.round((value / summary.total) * 100)}%)`
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
                  {summary.segments.map((segment) => (
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
                        <div className="display-6 fw-bold">
                          {segment.value}
                        </div>
                        <small className="text-muted">
                          {summary.total > 0
                            ? `${Math.round((segment.value / summary.total) * 100)}% del total`
                            : "Sin registros"}
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

export default MiAsistencia;
