import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { fetchWithToken } from "../../api/fetchWithToken";
import { format } from "date-fns";
import { RefreshCw, PlusCircle, Calendar } from "lucide-react";

const formatFecha = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return format(date, "yyyy-MM-dd HH:mm");
};

const AsistenciasCitaciones = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["listas-asistencias", "citaciones"],
    queryFn: () => fetchWithToken("/listas-asistencia/"),
    staleTime: 5 * 60 * 1000,
  });

  const citaciones = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item.tipo === "citacion");
  }, [data]);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Asistencias de citaciones</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Consulta las listas de asistencia generadas para cada citación
            </p>
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
              to="/lista/crear" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-all active:scale-95 shadow-sm shadow-red-200 dark:shadow-none"
            >
              <PlusCircle size={18} />
              <span>Nueva lista</span>
            </Link>
          </div>
        </div>

        <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCw size={24} className="animate-spin mr-3" />
              <span>Cargando listas de asistencia...</span>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-2xl border border-red-100 dark:border-red-500/20 text-sm">
              {error?.message || "No se pudo obtener la información de asistencia."}
            </div>
          ) : citaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:!bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <Calendar size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron listas de asistencia para citaciones.</p>
            </div>
          ) : (
            <Tabla
              data={citaciones}
              columns={[
                {
                  accessorKey: "evento.id",
                  header: "ID",
                  cell: (info) => (
                    <span className="font-mono text-xs text-slate-400">{info.row.original.evento?.id ?? "—"}</span>
                  ),
                },
                {
                  accessorKey: "evento.nombre",
                  header: "Nombre",
                  cell: (info) => (
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{info.row.original.evento?.nombre ?? "—"}</span>
                  ),
                },
                {
                  accessorKey: "evento.fecha",
                  header: "Fecha",
                  cell: (info) => (
                    <span className="text-slate-500 dark:text-slate-400">{formatFecha(info.row.original.evento?.fecha)}</span>
                  ),
                },
                {
                  accessorKey: "evento.lugar",
                  header: "Lugar",
                  cell: (info) => (
                    <span className="text-slate-500 dark:text-slate-400">{info.row.original.evento?.lugar ?? "—"}</span>
                  ),
                },
                {
                  id: "acciones",
                  header: "Acciones",
                  cell: (info) => {
                    const eventoId = info.row.original.evento?.id;
                    if (!eventoId) return "—";

                    return (
                      <div className="flex justify-end">
                        <Link
                          to={`/asistencia/resumen/${eventoId}`}
                          className="px-4 py-1.5 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"
                        >
                          Resumen
                        </Link>
                      </div>
                    );
                  },
                },
              ]}
              pageSize={8}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AsistenciasCitaciones;
