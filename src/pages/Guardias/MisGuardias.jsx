import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { fetchWithToken } from '../../api/fetchWithToken';
import { Calendar as CalendarIcon, Info, RefreshCcw, Loader2, ChevronLeft, ChevronRight, User } from 'lucide-react';
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
    getYear,
    getMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para select con buscador
const SearchSelect = ({ options, value, onChange, placeholder }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (selectedOption) {
            setSearch(selectedOption.label);
        } else {
            setSearch('');
        }
    }, [value, selectedOption]);

    return (
        <div className="relative">
            <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 dark:text-slate-200"
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => {
                    setTimeout(() => {
                        setIsOpen(false);
                        if (selectedOption) {
                            setSearch(selectedOption.label);
                        } else {
                            setSearch('');
                        }
                    }, 200);
                }}
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg custom-scrollbar">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-2.5 text-xs text-slate-400 italic">No hay resultados</div>
                    ) : (
                        filteredOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                                onMouseDown={() => {
                                    onChange(opt.value);
                                    setSearch(opt.label);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default function MisGuardias() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [guardias, setGuardias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuardia, setSelectedGuardia] = useState(null);
    
    // Modal de Reemplazo
    const [isReemplazoOpen, setIsReemplazoOpen] = useState(false);
    const [bomberos, setBomberos] = useState([]);
    const [reemplazoId, setReemplazoId] = useState('');
    const [submittingReemplazo, setSubmittingReemplazo] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const fetchMisGuardias = async () => {
        setLoading(true);
        try {
            const y = getYear(currentMonth);
            const m = getMonth(currentMonth) + 1;
            const res = await fetchWithToken(`/guardias/mis-guardias/?anio=${y}&mes=${m}`);
            if (Array.isArray(res)) {
                setGuardias(res);
            }
        } catch (error) {
            console.error("Error cargando guardias personales:", error);
            toast.error("Error al obtener tus guardias.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar guardias al cambiar mes
    useEffect(() => {
        fetchMisGuardias();
    }, [currentMonth]);

    // Cargar bomberos para el selector de reemplazo
    useEffect(() => {
        const fetchBomberos = async () => {
            try {
                const res = await fetchWithToken('/guardias/bomberos-disponibles/');
                if (Array.isArray(res)) {
                    setBomberos(res.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })));
                }
            } catch (error) {
                console.error("Error cargando bomberos:", error);
            }
        };
        fetchBomberos();
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getGuardiaDay = (day) => {
        return guardias.find(g => isSameDay(new Date(g.fecha + 'T00:00:00'), day));
    };

    const handleSolicitarReemplazo = (guardia) => {
        setSelectedGuardia(guardia);
        setReemplazoId('');
        setIsReemplazoOpen(true);
    };

    const submitReemplazo = async () => {
        if (!reemplazoId) {
            toast.warn("Por favor selecciona un bombero para el reemplazo.");
            return;
        }
        setSubmittingReemplazo(true);
        try {
            await fetchWithToken('/guardias-solicitudes/', {
                method: 'POST',
                body: JSON.stringify({
                    guardia_id: selectedGuardia.id,
                    reemplazo_id: reemplazoId
                })
            });
            toast.success("Solicitud de reemplazo enviada con éxito.");
            setIsReemplazoOpen(false);
        } catch (error) {
            console.error("Error al solicitar reemplazo:", error);
            toast.error("Error al registrar la solicitud de reemplazo.");
        } finally {
            setSubmittingReemplazo(false);
        }
    };

    return (
        <Layout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Mis Guardias</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Revisa tus turnos de guardia asignados para este mes y solicita reemplazos en caso de ser necesario.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Vista Calendario */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                                    <CalendarIcon size={20} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                                </h4>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sá</div><div>Do</div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20 text-slate-400">
                                <Loader2 className="animate-spin mr-2" />
                                <span>Cargando tus turnos...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-1.5 flex-1">
                                {calendarDays.map((day, idx) => {
                                    const isCurrent = isSameMonth(day, monthStart);
                                    const guardia = getGuardiaDay(day);

                                    return (
                                        <button
                                            key={idx}
                                            disabled={!isCurrent}
                                            onClick={() => guardia && setSelectedGuardia(guardia)}
                                            className={`h-16 rounded-2xl flex flex-col items-center justify-between p-2 transition-all border ${
                                                !isCurrent 
                                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-10 border-transparent' 
                                                    : guardia
                                                        ? 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 shadow-sm'
                                                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800'
                                            }`}
                                        >
                                            <span className="text-xs font-bold self-start">{format(day, 'd')}</span>
                                            {guardia && (
                                                <span className="text-[9px] font-extrabold bg-red-600 text-white dark:bg-red-500/20 dark:text-red-400 px-1 py-0.5 rounded-md self-stretch text-center truncate">
                                                    Asignado
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Detalle del Turno Seleccionado */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3 mb-5">
                                    Detalle del Turno
                                </h3>

                                {selectedGuardia ? (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        {/* Fecha */}
                                        <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Fecha del Turno</p>
                                                <h4 className="text-xl font-bold text-red-600 dark:text-red-500 mt-1 capitalize">
                                                    {format(new Date(selectedGuardia.fecha + 'T00:00:00'), 'EEEE dd MMMM', { locale: es })}
                                                </h4>
                                            </div>
                                            <CalendarIcon size={28} className="text-red-500" />
                                        </div>

                                        {/* Oficial y Conductor */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Oficial a Cargo</p>
                                                {selectedGuardia.oficial ? (
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {selectedGuardia.oficial.first_name} {selectedGuardia.oficial.last_name}
                                                        <span className="block text-[10px] text-slate-400 font-medium">{selectedGuardia.oficial.cargo || 'Oficial'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Pendiente</span>
                                                )}
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Conductor</p>
                                                {selectedGuardia.conductor ? (
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {selectedGuardia.conductor.first_name} {selectedGuardia.conductor.last_name}
                                                        <span className="block text-[10px] text-slate-400 font-medium">Habilitado</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Pendiente</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lista de Bomberos */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bomberos Asignados</p>
                                            <div className="space-y-2">
                                                {selectedGuardia.bomberos && selectedGuardia.bomberos.length > 0 ? (
                                                    selectedGuardia.bomberos.map(b => (
                                                        <div key={b.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/20 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                            <div className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg">
                                                                <User size={14} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                {b.first_name} {b.last_name}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">Sin bomberos asignados</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-slate-400 italic">
                                        Selecciona una fecha asignada en el calendario para ver su detalle.
                                    </div>
                                )}
                            </div>

                            {selectedGuardia && (
                                <button
                                    onClick={() => handleSolicitarReemplazo(selectedGuardia)}
                                    className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-[0.98]"
                                >
                                    <RefreshCcw size={16} /> Solicitar Reemplazo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal para Solicitar Reemplazo */}
                {isReemplazoOpen && selectedGuardia && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsReemplazoOpen(false)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Solicitud de Reemplazo</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    Guardia del {format(new Date(selectedGuardia.fecha + 'T00:00:00'), 'dd/MM/yyyy')}
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Selecciona el bombero al que deseas solicitar el reemplazo de tu guardia. Se le enviará una notificación por correo para que confirme la solicitud.
                                </p>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Reemplazante Propuesto</label>
                                    <SearchSelect
                                        options={bomberos}
                                        value={reemplazoId}
                                        onChange={setReemplazoId}
                                        placeholder="Buscar bombero por nombre..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setIsReemplazoOpen(false)}
                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={submitReemplazo}
                                        disabled={submittingReemplazo || !reemplazoId}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submittingReemplazo ? <Loader2 size={16} className="animate-spin" /> : null}
                                        Enviar Solicitud
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
