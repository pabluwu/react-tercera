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
import { User, Mail, Calendar, RefreshCw, PieChart, Activity, AlertCircle, TrendingUp } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

const MiAsistencia = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(() => currentYear);

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
      { label: "Asistencias", value: data.asistencias ?? 0, color: "#ef4444" }, // red-500
      { label: "Licencias", value: data.licencias ?? 0, color: "#3b82f6" }, // blue-500
      { label: "Inasistencias", value: data.inasistencias ?? 0, color: "#94a3b8" }, // slate-400
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
  }, [data]);

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);
  const handleCurrentYear = () => setYear(currentYear);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Mi Asistencia</h2>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail size={14} />
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex bg-slate-100 dark:!bg-slate-800 p-1 rounded-2xl">
              <button 
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={handlePrevYear}
              >
                {year - 1}
              </button>
              <button
                className={`px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${year === currentYear ? "bg-red-600 text-white" : "!bg-white dark:!bg-slate-700 text-slate-900 dark:text-white"}`}
                onClick={handleCurrentYear}
              >
                {currentYear}
              </button>
              <button 
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={handleNextYear}
              >
                {year + 1}
              </button>
            </div>
          </div>
        </div>

        {!userId ? (
          <div className="p-8 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
            <AlertCircle size={24} />
            <span className="font-medium">No se encontró información del usuario autenticado.</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-3" />
            <span>Cargando tus estadísticas...</span>
          </div>
        ) : isError ? (
          <div className="p-8 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
            <AlertCircle size={24} />
            <span className="font-medium">{error?.message || "No se pudo obtener la asistencia."}</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:!bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                  <TrendingUp size={20} />
                </div>
                <h5 className="text-xl font-bold text-slate-800 dark:text-white">Resumen {year}</h5>
                <span className="px-3 py-1 bg-slate-100 dark:!bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold">
                  {data.total_citaciones ?? 0} CITACIONES TOTALES
                </span>
              </div>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
                onClick={() => refetch()}
              >
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 !bg-white dark:!bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-10 self-start flex items-center gap-2">
                  <PieChart size={20} className="text-red-600" />
                  <span>Distribución de Mi Asistencia</span>
                </h4>
                {summary.chartData ? (
                  <div className="relative w-full aspect-square max-w-[280px]">
                    <Pie
                      data={summary.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            padding: 12,
                            cornerRadius: 12,
                            callbacks: {
                              label: (context) => {
                                const value = context.raw ?? 0;
                                const pct = summary.total > 0 ? ` (${Math.round((value / summary.total) * 100)}%)` : "";
                                return ` ${context.label}: ${value}${pct}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <PieChart size={64} className="mb-4 opacity-10" />
                    <p className="text-sm font-medium">Sin registros este año</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {summary.segments.map((segment) => (
                  <div key={segment.label} className="!bg-white dark:!bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                      <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">{segment.label}</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{segment.value}</span>
                      <span className="text-slate-400 font-bold">
                        {summary.total > 0 ? `${Math.round((segment.value / summary.total) * 100)}%` : "0%"}
                      </span>
                    </div>
                    <div className="mt-6 w-full bg-slate-50 dark:!bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: summary.total > 0 ? `${Math.round((segment.value / summary.total) * 100)}%` : "0%",
                          backgroundColor: segment.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="bg-red-600 p-8 rounded-3xl shadow-xl shadow-red-200 dark:shadow-none flex flex-col justify-between text-white sm:col-span-2 md:col-span-1 lg:col-span-2">
                  <div className="flex justify-between items-start">
                    <p className="font-bold uppercase tracking-widest text-red-100 text-xs">Total Citaciones</p>
                    <Activity size={20} className="text-red-200" />
                  </div>
                  <div className="mt-8">
                    <p className="text-6xl font-black">{data.total_citaciones ?? 0}</p>
                    <p className="text-red-100 text-sm mt-1 font-medium italic">Registradas en el sistema para {year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MiAsistencia;
