import { CalendarDays, Clock, MapPin, User, ChevronRight, Info } from 'lucide-react';
import Layout from '../../layout/Layout';
import { parseISO, differenceInHours } from 'date-fns';
import { Link } from 'react-router-dom';

import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';

const ListCitaciones = () => {
    const { data, isLoading } = useCitacionesFuturas();

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Citaciones</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Gestión y seguimiento de citaciones programadas.
                        </p>
                    </div>
                    <Link 
                        to={'/citaciones/crear'} 
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-red-200 dark:shadow-none transform active:scale-95"
                    >
                        Nueva Citación
                    </Link>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium tracking-tight">Cargando citaciones...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((citacion) => {
                            const fechaCitacion = parseISO(citacion.fecha);
                            const horasRestantes = differenceInHours(fechaCitacion, new Date());
                            const disponibleParaLicencia = horasRestantes >= 24;
                            const fechaTexto = citacion.fecha?.split('T')[0] ?? '—';
                            const horaTexto = citacion.fecha?.split('T')[1]?.slice(0, 5) ?? '—';

                            return (
                                <div 
                                    key={citacion.id} 
                                    className="group flex flex-col !bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-6 space-y-4 flex-1">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                                    {citacion.nombre}
                                                </h3>
                                                <span className={`
                                                    shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${disponibleParaLicencia 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}
                                                `}>
                                                    {disponibleParaLicencia ? 'Solicitable' : 'Cerrada'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                                                {citacion.descripcion || 'Sin descripción adicional.'}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <CalendarDays size={16} />
                                                </div>
                                                <span className="font-medium">{fechaTexto}</span>
                                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                                <span className="font-medium">{horaTexto}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <MapPin size={16} />
                                                </div>
                                                <span className="truncate">{citacion.lugar || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                                <span>Organiza: <span className="font-bold">{citacion.autor_info?.username || '—'}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                        <Link
                                            to={`/citaciones/${citacion.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 !bg-white dark:!bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <Info size={14} />
                                            Ver Detalle
                                        </Link>
                                        {disponibleParaLicencia && (
                                            <Link
                                                to={`/licencia/citacion/${citacion.id}`}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-100 dark:shadow-none transition-all hover:bg-red-700"
                                            >
                                                Solicitar Licencia
                                            </Link>
                                        )}
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

export default ListCitaciones;
