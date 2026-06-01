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
import { ArrowLeft, RefreshCw, Flame, Calendar, MapPin, Truck, Users, UserCheck, UserX, AlertCircle, Activity } from "lucide-react";

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

const DetalleEmergencia = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["asistencia-emergencia", id],
    queryFn: () => fetchWithToken(`/asistencia/emergencia/${id}/`),
    enabled: !!id,
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <Link
              to="/asistencia/emergencias"
              className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Volver a asistencias</span>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Flame size={24} className="text-red-600" />
                <span>Resumen de emergencia</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Estadísticas y personal participante del evento
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:!bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
              <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
            </button>
            <Link 
              to="/lista/list" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:!bg-red-600 dark:hover:bg-red-700 rounded-xl font-medium transition-all active:scale-95 shadow-sm shadow-slate-200 dark:shadow-none"
            >
              <Users size={18} />
              <span>Ver listas</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-3" />
            <span>Cargando detalles de asistencia...</span>
          </div>
        ) : isError ? (
          <div className="p-8 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
            <AlertCircle size={24} />
            <span className="font-medium">{error?.message || "No se pudo obtener el resumen de la emergencia."}</span>
          </div>
        ) : !data ? (
          <div className="p-12 bg-slate-50 dark:!bg-slate-900 rounded-3xl text-center">
            <p className="text-slate-500 dark:text-slate-400 italic">No se encontró información de asistencia para la emergencia indicada.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h5 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Flame size={20} className="text-red-600" />
                <span>Información General</span>
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    ID
                  </p>
                  <p className="text-slate-700 dark:text-slate-200 font-mono">{data.emergencia?.id ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Flame size={12} /> Clave
                  </p>
                  <p className="text-red-600 dark:text-red-500 font-black text-xl">{data.emergencia?.clave ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Fecha
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">{formatFecha(data.emergencia?.fecha)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Truck size={12} /> Unidades
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">{data.emergencia?.unidades ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 !bg-white dark:!bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 self-start">Distribución de Personal</h4>
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
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">Sin registros</p>
                  </div>
                )}
                
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-50 dark:!bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{data.totales?.registrados ?? 0}</p>
                  </div>
                  <div className="bg-red-50 dark:!bg-red-500/5 p-4 rounded-2xl text-center border border-red-100 dark:border-red-500/10">
                    <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-1">Asistencia</p>
                    <p className="text-2xl font-black text-red-600 dark:text-red-500">{data.totales?.asistentes ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl">
                      <UserCheck size={20} />
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Asistentes</h5>
                    <span className="ml-auto bg-emerald-100 dark:!bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-xs font-bold px-2 py-1 rounded-lg">
                      {data.asistentes?.length ?? 0}
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {data.asistentes?.length ? (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 bg-slate-50 dark:!bg-slate-800 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {data.asistentes.map((persona) => (
                            <tr key={persona.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-500">{`${persona.first_name || ""} ${persona.last_name || ""}`.trim() || "—"}</td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{persona.email || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic">No se registraron asistentes.</div>
                    )}
                  </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:!bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl">
                      <UserX size={20} />
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-slate-400 dark:text-slate-500">Inasistentes</h5>
                    <span className="ml-auto bg-slate-100 dark:!bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold px-2 py-1 rounded-lg">
                      {data.inasistentes?.length ?? 0}
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {data.inasistentes?.length ? (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 bg-slate-50 dark:!bg-slate-800 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {data.inasistentes.map((persona) => (
                            <tr key={persona.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-400 dark:text-slate-500">{`${persona.first_name || ""} ${persona.last_name || ""}`.trim() || "—"}</td>
                              <td className="px-6 py-4 text-slate-400/80 dark:text-slate-600">{persona.email || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic">No hay inasistencias registradas.</div>
                    )}
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

export default DetalleEmergencia;
