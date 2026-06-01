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
import { Calendar, RefreshCw, BarChart3, Users, ClipboardList, Info, Flame } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

const buildChartData = (totales, porcentajes) => {
  const segments = [
    {
      label: "Asistentes",
      value: totales?.asistentes ?? 0,
      color: "#ef4444", // red-500
      percentage: porcentajes?.asistentes ?? 0,
    },
    {
      label: "Licencias",
      value: totales?.licencias ?? 0,
      color: "#3b82f6", // blue-500
      percentage: porcentajes?.licencias ?? 0,
    },
    {
      label: "Inasistencias",
      value: totales?.inasistencias ?? 0,
      color: "#94a3b8", // slate-400
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
              borderColor: "transparent",
              borderWidth: 0,
            },
          ],
        };

  return { segments, total, chartData };
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForApi = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const AsistenciaAnual = () => {
  const currentYear = new Date().getFullYear();
  const [fechaInicio, setFechaInicio] = useState(
    formatDateForInput(new Date(currentYear, 0, 1))
  );
  const [fechaFin, setFechaFin] = useState(
    formatDateForInput(new Date(currentYear, 11, 31))
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["asistencia-anual", fechaInicio, fechaFin],
    queryFn: () =>
      fetchWithToken(
        `/asistencia/anual?fecha-inicio=${formatDateForApi(fechaInicio)}&fecha-fin=${formatDateForApi(fechaFin)}`
      ),
    enabled: !!fechaInicio && !!fechaFin,
  });

  const resumen = useMemo(() => {
    if (!data) {
      return { segments: [], total: 0, chartData: null };
    }
    return buildChartData(data.totales, data.porcentajes);
  }, [data]);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Asistencia por rango</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Consolidado de asistencia para el período seleccionado
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 sm:flex-none">
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  className="w-full sm:w-40 pl-10 pr-4 py-2 bg-slate-50 dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-red-500 dark:text-slate-200 transition-all"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <span className="text-slate-400 hidden sm:block">—</span>
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  className="w-full sm:w-40 pl-10 pr-4 py-2 bg-slate-50 dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-red-500 dark:text-slate-200 transition-all"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:!bg-red-600 dark:hover:bg-red-700 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
              <span>{isFetching ? "Actualizando..." : "Filtrar"}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-3" />
            <span>Cargando estadísticas de asistencia...</span>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
            <Info size={24} />
            <span className="font-medium">{error?.message || "No se pudo obtener la asistencia."}</span>
          </div>
        ) : !data ? (
          <div className="p-8 bg-slate-50 dark:!bg-slate-900 rounded-3xl text-center">
            <p className="text-slate-500 dark:text-slate-400">No se encontró información para el rango seleccionado.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:!bg-orange-500/10 text-orange-600 dark:text-orange-500 flex items-center justify-center mb-4">
                      <Flame size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Emergencias</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{data.total_emergencias ?? 0}</h3>
                  </div>
                  
                  <div className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center mb-4">
                      <Calendar size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citaciones</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{data.total_citaciones ?? 0}</h3>
                  </div>

                  <div className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mb-4">
                      <ClipboardList size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Listas</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{data.total_listas ?? 0}</h3>
                  </div>

                  <div className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4">
                      <Users size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bomberos</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{data.total_bomberos ?? 0}</h3>
                  </div>

                  <div className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center mb-4">
                      <BarChart3 size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total asistencias registradas</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{data.totales?.asistentes ?? 0}</h3>
                  </div>
                </div>
              </div>

              <div className="!bg-white dark:!bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 self-start">Distribución global</h4>
                {resumen.chartData ? (
                  <div className="relative w-full aspect-square max-w-[240px]">
                    <Pie
                      data={resumen.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            cornerRadius: 12,
                            displayColors: true,
                            callbacks: {
                              label: (context) => {
                                const value = context.raw ?? 0;
                                const pct = resumen.total > 0 ? ` (${Math.round((value / resumen.total) * 100)}%)` : "";
                                return ` ${context.label}: ${value}${pct}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                    <BarChart3 size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">Sin datos para graficar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {resumen.segments.map((segment) => (
                <div key={segment.label} className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">{segment.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-800 dark:text-white">{segment.value}</span>
                    <span className="text-slate-400 font-medium">{segment.percentage}%</span>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 dark:!bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AsistenciaAnual;
