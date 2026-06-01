import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { usePerfiles } from "../../hooks/usePerfiles";
import { Search, RefreshCw, User, Users } from "lucide-react";

const buildRows = (perfiles) => {
  if (!Array.isArray(perfiles)) return [];

  return perfiles.map((perfil) => {
    const user = perfil.user || {};
    return {
      id: user.id ?? perfil.id ?? "-",
      nombre: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Sin nombre",
      rut: perfil.rut || "—",
    };
  });
};

const columns = [
  {
    accessorKey: "id",
    header: "ID",
    cell: (info) => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:!bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          <User size={16} />
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{info.getValue()}</span>
      </div>
    )
  },
  {
    accessorKey: "rut",
    header: "RUT",
    cell: (info) => <span className="text-slate-500 dark:text-slate-400 font-medium">{info.getValue()}</span>
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: (info) => (
      <div className="flex justify-end">
        <Link
          to={`/asistencia/bombero/${info.row.original.id}`}
          className="px-4 py-1.5 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"
        >
          Ver historial
        </Link>
      </div>
    ),
  },
];

const AsistenciasBomberos = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = usePerfiles();
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useMemo(() => buildRows(data), [data]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();
    return rows.filter((row) =>
      row.nombre.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Asistencias por bomberos</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Consulta el historial y desempeño individual de cada bombero
            </p>
          </div>
          <button
            type="button"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:!bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
            <Search size={20} />
          </span>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 !bg-white dark:!bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 dark:text-slate-200 transition-all text-lg"
            placeholder="Buscar bombero por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <RefreshCw size={24} className="animate-spin mr-3" />
              <span>Cargando información de bomberos...</span>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-2xl border border-red-100 dark:border-red-500/20 text-sm">
              {error?.message || "No se pudo obtener la información de bomberos."}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:!bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <Users size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay bomberos registrados en el sistema."}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-red-600 dark:text-red-500 font-bold hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <Tabla data={filteredRows} columns={columns} pageSize={10} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AsistenciasBomberos;
