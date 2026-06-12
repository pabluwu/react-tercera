import useAuthStore from '../../store/useAuthStore';
import { LogOut, Calendar as CalendarIcon, FileText, AlertCircle, Loader2, ChevronLeft, ChevronRight, MapPin, Info } from 'lucide-react';
import Layout from '../../layout/Layout';
import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';
import { useCitacionesPorRango } from '../../hooks/useCitacionesPorRango';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMesesGrouped } from '../../hooks/useMesesGrouped';
import { useMemo, useState } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    addMonths, 
    subMonths, 
    startOfWeek, 
    endOfWeek,
    isSameMonth,
    isToday,
    getYear,
    differenceInHours
} from 'date-fns';
import { es } from 'date-fns/locale';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const ModalCitacionesDia = ({ isOpen, onClose, day, citaciones, guardia }) => {
    const navigate = useNavigate();
    if (!isOpen || !day) return null;

    const canRequestLicencia = (fechaCita) => {
        const hoursDiff = differenceInHours(new Date(fechaCita), new Date());
        return hoursDiff >= 24;
    };

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:!bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            Citaciones del día
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {format(day, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ChevronRight className="rotate-90 sm:rotate-0 text-slate-400" />
                    </button>
                </div>
                <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {guardia && (
                        <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 space-y-3">
                            <h4 className="font-bold text-blue-800 dark:text-blue-400 text-base leading-tight flex items-center gap-2">
                                <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                                Tienes Guardia Asignada
                            </h4>
                            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                <div><strong>Tu Rol:</strong> {guardia.rol_asignado}</div>
                                <div><strong>Oficial:</strong> {guardia.oficial ? `${guardia.oficial.first_name} ${guardia.oficial.last_name}` : <span className="italic text-slate-400">Pendiente</span>}</div>
                                <div><strong>Conductor:</strong> {guardia.conductor ? `${guardia.conductor.first_name} ${guardia.conductor.last_name}` : <span className="italic text-slate-400">Pendiente</span>}</div>
                                <div className="mt-1">
                                    <strong>Personal de Guardia:</strong>
                                    <span className="block mt-0.5 pl-3 text-slate-500 dark:text-slate-400">
                                        {guardia.bomberos && guardia.bomberos.length > 0 
                                            ? guardia.bomberos.map(b => `${b.first_name} ${b.last_name}`).join(', ')
                                            : 'Sin asignar'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {citaciones.length === 0 && !guardia ? (
                        <p className="text-center py-8 text-slate-500 italic">No hay actividades para este día.</p>
                    ) : (
                        citaciones.map(cita => (
                            <div key={cita.id} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{cita.nombre}</h4>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <CalendarIcon size={14} className="text-red-500" />
                                            {format(new Date(cita.fecha), 'HH:mm')} hrs
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <MapPin size={14} className="text-red-500" />
                                            {cita.lugar}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <button 
                                        onClick={() => navigate(`/citaciones/${cita.id}`)}
                                        className="flex-1 px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Info size={14} /> Ver Detalle
                                    </button>
                                    {canRequestLicencia(cita.fecha) ? (
                                        <button 
                                            onClick={() => navigate(`/licencia/citacion/${cita.id}`)}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
                                        >
                                            <AlertCircle size={14} /> Solicitar Licencia
                                        </button>
                                    ) : (
                                        <div className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-medium flex items-center justify-center text-center leading-tight">
                                            Plazo para licencia expirado (24h)
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const Calendario = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const today = new Date();
    const currentYear = getYear(today);

    const user = useAuthStore((state) => state.user);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const { data: citaciones, isLoading } = useCitacionesPorRango(startDate, endDate);

    const { data: guardias } = useQuery({
        queryKey: ['guardias-dashboard-rango', startDate, endDate],
        queryFn: () => fetchWithToken(`/guardias/rango/?fecha-inicio=${format(startDate, 'yyyy-MM-dd')}&fecha-fin=${format(endDate, 'yyyy-MM-dd')}&excluir-borradores=true`),
        enabled: !!user?.tenant?.modulos_activos?.includes('guardias')
    });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => {
        const next = addMonths(currentMonth, 1);
        if (getYear(next) <= currentYear + 1) {
            setCurrentMonth(next);
        }
    };

    const prevMonth = () => {
        const prev = subMonths(currentMonth, 1);
        if (getYear(prev) >= currentYear) {
            setCurrentMonth(prev);
        }
    };

    const canGoNext = getYear(addMonths(currentMonth, 1)) <= currentYear + 1;
    const canGoPrev = getYear(subMonths(currentMonth, 1)) >= currentYear;

    const getCitacionesDay = (day) => {
        if (!citaciones) return [];
        return citaciones.filter(c => isSameDay(new Date(c.fecha), day));
    };

    const getGuardiaDay = (day) => {
        if (!guardias || !Array.isArray(guardias)) return null;
        const g = guardias.find(guardia => isSameDay(new Date(guardia.fecha + 'T00:00:00'), day));
        if (!g) return null;
        
        const isOficial = g.oficial?.id === user?.id;
        const isConductor = g.conductor?.id === user?.id;
        const isBombero = g.bomberos?.some(b => b.id === user?.id);
        
        if (isOficial) return { ...g, rol_asignado: 'Oficial' };
        if (isConductor) return { ...g, rol_asignado: 'Conductor' };
        if (isBombero) return { ...g, rol_asignado: 'Bombero' };
        
        return null;
    };

    const handleDayClick = (day) => {
        const dayCitaciones = getCitacionesDay(day);
        const dayGuardia = getGuardiaDay(day);
        if (dayCitaciones.length > 0 || dayGuardia) {
            setSelectedDay(day);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <ModalCitacionesDia 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                day={selectedDay} 
                citaciones={selectedDay ? getCitacionesDay(selectedDay) : []} 
                guardia={selectedDay ? getGuardiaDay(selectedDay) : null}
            />
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                        <CalendarIcon size={20} />
                    </div>
                    <h5 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h5>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={prevMonth}
                        disabled={!canGoPrev}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button 
                        onClick={nextMonth}
                        disabled={!canGoNext}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1">
                <div className="grid grid-cols-7 gap-px mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map((day, idx) => {
                        const dayCitaciones = getCitacionesDay(day);
                        const dayGuardia = getGuardiaDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        
                        return (
                            <div 
                                key={idx} 
                                onClick={() => handleDayClick(day)}
                                className={`min-h-[60px] sm:min-h-[80px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                                    !isCurrentMonth 
                                        ? 'bg-slate-50/30 dark:bg-slate-900/30 border-transparent opacity-30' 
                                        : isToday(day)
                                            ? 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20'
                                            : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                                } ${dayCitaciones.length > 0 || dayGuardia ? 'ring-2 ring-red-500/10' : ''}`}
                            >
                                <span className={`text-xs font-bold ${
                                    isToday(day) ? 'text-red-600 dark:text-red-500' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                                
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                    {dayCitaciones.map(cita => (
                                        <div 
                                            key={cita.id}
                                            title={`${cita.nombre} - ${format(new Date(cita.fecha), 'HH:mm')}`}
                                            className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 border-l-2 border-red-500 text-[9px] sm:text-[10px] text-red-700 dark:text-red-400 font-bold rounded-sm truncate"
                                        >
                                            {cita.nombre}
                                        </div>
                                    ))}
                                    {dayGuardia && (
                                        <div 
                                            title={`Guardia Asignada - Rol: ${dayGuardia.rol_asignado}`}
                                            className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 border-l-2 border-blue-500 text-[9px] sm:text-[10px] text-blue-700 dark:text-blue-400 font-bold rounded-sm truncate"
                                        >
                                            Guardia ({dayGuardia.rol_asignado})
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const { data: citaciones, isLoading: loadingCitaciones } = useCitacionesFuturas();

    const archivosQuery = useQuery({
        queryKey: ['archivos-dashboard'],
        queryFn: () => fetchWithToken('/archivos/'),
    });

    const ownId = user?.id ? String(user.id) : null;
    const { dataByYear } = useMesesGrouped(ownId, !!ownId, false);

    const pendingCuotas = useMemo(() => {
        if (!dataByYear) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12

        return Object.entries(dataByYear).reduce((acc, [year, months]) => {
            const yearNum = Number(year);
            const filteredMonths = months.filter((m) => {
                if (m.pagado) return false;
                if (yearNum < currentYear) return true;
                if (yearNum === currentYear && m.numeroMes <= currentMonth) return true;
                return false;
            });
            return acc + filteredMonths.length;
        }, 0);
    }, [dataByYear]);

    const documentosAleatorios = useMemo(() => {
        const docs = Array.isArray(archivosQuery.data) ? archivosQuery.data : [];
        if (docs.length <= 4) return docs;
        const shuffled = [...docs].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, [archivosQuery.data]);

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Bienvenido</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Resumen rápido de citaciones, archivos y tus cuotas pendientes.
                        </p>
                    </div>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:!bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20 rounded-xl font-medium transition-all active:scale-95" 
                        onClick={logout}
                    >
                        <LogOut size={18} /> 
                        <span>Cerrar sesión</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citaciones próximas</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {loadingCitaciones ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : citaciones?.length ?? 0}
                            </h4>
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Documentos disponibles</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {archivosQuery.isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : archivosQuery.data?.length ?? 0}
                            </h4>
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-50 dark:!bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cuotas pendientes</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {pendingCuotas}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <Calendario />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h5 className="text-lg font-bold text-slate-800 dark:text-white">Citaciones próximas</h5>
                            <a href="/citaciones/list" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 transition-colors">Ver todas</a>
                        </div>
                        <div className="p-6 flex-1">
                            {loadingCitaciones && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Cargando citaciones...</span>
                                </div>
                            )}
                            {!loadingCitaciones && (!citaciones || citaciones.length === 0) && (
                                <p className="text-slate-500 dark:text-slate-400 italic">No hay citaciones próximas.</p>
                            )}
                            {!loadingCitaciones && citaciones && citaciones.length > 0 && (
                                <div className="space-y-4">
                                    {citaciones.slice(0, 5).map((cita) => (
                                        <div key={cita.id} className="group flex flex-col p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{cita.nombre}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:!bg-slate-600"></span>
                                                {cita.lugar} — {new Date(cita.fecha).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h5 className="text-lg font-bold text-slate-800 dark:text-white">Documentos destacados</h5>
                            <a href="/archivos/ver" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 transition-colors">Ver archivos</a>
                        </div>
                        <div className="p-6 flex-1">
                            {archivosQuery.isLoading && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Cargando documentos...</span>
                                </div>
                            )}
                            {archivosQuery.isError && (
                                <p className="text-red-500 bg-red-50 dark:!bg-red-500/10 p-4 rounded-2xl text-sm">No se pudieron cargar los documentos.</p>
                            )}
                            {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length === 0 && (
                                <p className="text-slate-500 dark:text-slate-400 italic">No hay documentos disponibles.</p>
                            )}
                            {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length > 0 && (
                                <div className="space-y-4">
                                    {documentosAleatorios.map((doc) => (
                                        <div key={doc.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="min-w-0 flex-1 pr-4">
                                                <div className="font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{doc.nombre}</div>
                                                <div className="text-slate-500 dark:text-slate-400 text-sm truncate">{doc.descripcion}</div>
                                            </div>
                                            <a 
                                                href={doc.archivo} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="shrink-0 px-3 py-1 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"
                                            >
                                                Abrir
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
