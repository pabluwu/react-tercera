import { useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { useMesesGrouped } from "../../hooks/useMesesGrouped";
import useAuthStore from "../../store/useAuthStore";
import { CreditCard, Calendar, AlertCircle, Info, Clock } from "lucide-react";

const columns = [
  {
    accessorKey: "mes",
    header: "Mes",
  },
  {
    accessorKey: "estadoLabel",
    header: "Estado",
    cell: (info) => {
      const pagado = info.row.original.pagado;
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
          pagado 
            ? "bg-green-100 text-green-700 dark:!bg-green-900/30 dark:text-green-400" 
            : "bg-amber-100 text-amber-700 dark:!bg-amber-900/30 dark:text-amber-400"
        }`}>
          {pagado ? "Pagado" : "Pendiente"}
        </span>
      );
    },
  },
];

const MisCuotas = () => {
  const user = useAuthStore((state) => state.user);
  const ownId = user?.id ? String(user.id) : null;

  const [selectedYear, setSelectedYear] = useState(null);

  const { years, dataByYear, mesesQuery, mesesPagadosQuery } = useMesesGrouped(
    ownId,
    !!ownId,
    false
  );

  useEffect(() => {
    if (!years || years.length === 0) return;
    setSelectedYear((prev) => (prev && years.includes(prev) ? prev : years[0]));
  }, [years]);

  const datosTabla = useMemo(() => {
    if (!selectedYear) return [];
    const datos = dataByYear[selectedYear] || [];
    return [...datos].sort((a, b) => a.numeroMes - b.numeroMes);
  }, [selectedYear, dataByYear]);

  const isLoading = mesesQuery.isLoading || mesesPagadosQuery.isLoading;
  const hasError = mesesQuery.isError || mesesPagadosQuery.isError;
  const errorMessage =
    mesesQuery.error?.message ||
    mesesPagadosQuery.error?.message ||
    "No se pudo obtener la información.";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:!bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
              <CreditCard size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Mis Cuotas</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Historial de pagos y pendientes</p>
            </div>
          </div>
        </div>

        {!ownId && (
          <div className="flex items-center gap-4 p-5 bg-red-50 dark:!bg-red-900/20 text-red-700 dark:text-red-400 rounded-3xl border border-red-100 dark:border-red-900/30 mb-8">
            <AlertCircle className="shrink-0" size={24} />
            <p className="font-bold">No se encontró la información de tu usuario.</p>
          </div>
        )}

        {isLoading && (
          <div className="!bg-white dark:!bg-slate-800 rounded-[2.5rem] shadow-xl p-16 text-center border border-slate-100 dark:border-slate-700">
             <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4"></div>
             <p className="text-slate-500 dark:text-slate-400 font-bold">Cargando tus cuotas...</p>
          </div>
        )}

        {hasError && (
          <div className="flex items-center gap-4 p-5 bg-red-50 dark:!bg-red-900/20 text-red-700 dark:text-red-400 rounded-3xl border border-red-100 dark:border-red-900/30 mb-8">
            <AlertCircle className="shrink-0" size={24} />
            <p className="font-bold">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !hasError && years.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:!bg-slate-900 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
                    year === selectedYear 
                      ? "!bg-white dark:!bg-slate-800 text-red-600 shadow-sm dark:text-white" 
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="!bg-white dark:!bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
               <div className="p-1">
                  <Tabla data={datosTabla} columns={columns} pageSize={12} />
               </div>
            </div>
          </div>
        )}

        {!isLoading && !hasError && years.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 !bg-white dark:!bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-center">
            <Info className="text-slate-300 dark:text-slate-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sin registros</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">No se encontraron registros de cuotas para tu usuario en el sistema.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MisCuotas;
