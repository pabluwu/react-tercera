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
import { ArrowLeft, RefreshCw, User, Mail, Hash, Calendar, PieChart, Activity, AlertCircle } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

const buildChartData = (asistencias = 0, licencias = 0, inasistencias = 0) => {
  const segments = [
    { label: "Asistencias", value: asistencias, color: "#ef4444" }, // red-500
    { label: "Licencias", value: licencias, color: "#3b82f6" }, // blue-500
    { label: "Inasistencias", value: inasistencias, color: "#94a3b8" }, // slate-400
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
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <Link
              to="/asistencia/bomberos"
              className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Volver al listado</span>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Asistencia por bombero</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Desempeño anual y estadísticas de participación
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
            
            <button
              type="button"
              className="flex items-center justify-center p-2 !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="Actualizar"
            >
              <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-3" />
            <span>Cargando información detallada...</span>
          </div>
        ) : isError ? (
          <div className="p-8 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
            <AlertCircle size={24} />
            <span className="font-medium">{error?.message || "No se pudo obtener la asistencia del bombero."}</span>
          </div>
        ) : !data ? (
          <div className="p-12 bg-slate-50 dark:!bg-slate-900 rounded-3xl text-center">
            <p className="text-slate-500 dark:text-slate-400 italic">No se encontró información para el bombero indicado.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h5 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-red-600" />
                <span>Perfil del Bombero</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Hash size={12} /> ID de Usuario
                  </p>
                  <p className="text-slate-700 dark:text-slate-200 font-mono">{data.usuario?.id ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={12} /> Nombre Completo
                  </p>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold">{`${data.usuario?.first_name || ""} ${data.usuario?.last_name || ""}`.trim() || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={12} /> Correo Electrónico
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">{data.usuario?.email || "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 !bg-white dark:!bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 self-start flex items-center gap-2">
                  <PieChart size={20} className="text-red-600" />
                  <span>Distribución Anual {year}</span>
                </h4>
                {resumen.chartData ? (
                  <div className="relative w-full aspect-square max-w-[260px]">
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
                            cornerRadius: 12,
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
                    <PieChart size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">Sin registros este año</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resumen.segments.map((segment) => (
                    <div key={segment.label} className="!bg-white dark:!bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">{segment.label}</span>
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-white">{segment.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Citaciones</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.total_citaciones ?? 0}</p>
                  </div>
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergencias</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.total_emergencias ?? 0}</p>
                  </div>
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Listas</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.total_listas ?? 0}</p>
                  </div>
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Suspendidos</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.suspendidos ?? 0}</p>
                  </div>
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Separados</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.separados ?? 0}</p>
                  </div>
                  <div className="!bg-white dark:!bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center bg-red-50/50 dark:!bg-red-500/5">
                    <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-1">Año</p>
                    <p className="text-2xl font-black text-red-600 dark:text-red-500">{data.anio ?? year}</p>
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

export default DetalleBombero;
