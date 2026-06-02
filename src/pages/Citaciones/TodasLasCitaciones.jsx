import { useMemo, useState } from 'react';
import { CalendarDays, Clock, MapPin, User, Search, RefreshCw, Loader2, Info } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';

import { useCitaciones } from '../../hooks/useCitaciones';

const TodasLasCitaciones = () => {
  const { data, isLoading, refetch, isFetching } = useCitaciones({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const yearList = [];
    for (let y = currentYear; y >= startYear; y--) {
      yearList.push(y);
    }
    return yearList;
  }, []);

  const filteredCitaciones = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const fecha = parseISO(c.fecha);
      const matchesYear = fecha.getFullYear() === selectedYear;
      const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.lugar.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesYear && matchesSearch;
    });
  }, [data, selectedYear, searchTerm]);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Historial de Citaciones</h2>
            <p className="text-slate-500 dark:text-slate-400">
                Explora el registro histórico de todas las citaciones del Cuerpo.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                {/* Search */}
                <div className="lg:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Buscar Citación</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none"
                            placeholder="Nombre, lugar o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Year Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Filtrar por Año</label>
                    <div className="flex flex-wrap gap-2">
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-bold transition-all
                                    ${selectedYear === year 
                                        ? 'bg-red-600 text-white shadow-md shadow-red-100 dark:shadow-none' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}
                                `}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4 text-red-500" size={48} />
            <p className="text-lg font-medium tracking-tight">Cargando registros...</p>
          </div>
        ) : filteredCitaciones.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">No se encontraron citaciones para los criterios seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCitaciones.map((citacion) => {
              const fecha = parseISO(citacion.fecha);
              return (
                <div 
                    key={citacion.id} 
                    className="group flex flex-col !bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 space-y-4 flex-1">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                {citacion.nombre}
                            </h3>
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase">
                                #{citacion.id}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {format(fecha, 'EEEE dd MMMM', { locale: undefined })}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <Clock className="text-red-500 shrink-0" size={16} />
                            <span className="font-bold">{format(fecha, 'HH:mm')} hrs</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="text-red-500 shrink-0" size={16} />
                            <span className="truncate">{citacion.lugar}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <User className="text-red-500 shrink-0" size={16} />
                            <span className="truncate">Cita: <span className="font-bold">{citacion.responsable}</span></span>
                        </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/citaciones/${citacion.id}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 !bg-white dark:!bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                    >
                      <Info size={14} />
                      Detalles del Historial
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TodasLasCitaciones;
