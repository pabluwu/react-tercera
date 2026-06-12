import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { fetchWithToken } from '../../api/fetchWithToken';
import useAuthStore from '../../store/useAuthStore';
import { Calendar as CalendarIcon, Check, X as XIcon, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

export default function SolicitudesReemplazo({ showHistory = false }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);
    const currentUser = useAuthStore(state => state.user);

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const res = await fetchWithToken('/guardias-solicitudes/');
            if (Array.isArray(res)) {
                setSolicitudes(res);
            }
        } catch (error) {
            console.error("Error cargando solicitudes de reemplazo:", error);
            toast.error("Error al obtener las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, [showHistory]);

    const handleResponder = async (id, accion) => {
        setActioningId(id);
        try {
            await fetchWithToken(`/guardias-solicitudes/${id}/responder/`, {
                method: 'POST',
                body: JSON.stringify({ accion })
            });
            toast.success(`Solicitud ${accion === 'aceptar' ? 'aceptada' : 'rechazada'} con éxito.`);
            fetchSolicitudes();
        } catch (error) {
            console.error(`Error al responder solicitud (${accion}):`, error);
            toast.error("Error al guardar tu respuesta.");
        } finally {
            setActioningId(null);
        }
    };

    // Separar en Recibidas y Enviadas segun el estado de vigencia
    const recibidas = solicitudes.filter(s => {
        const isMe = s.reemplazo.id === currentUser?.id;
        if (!isMe) return false;
        return showHistory ? s.estado !== 'pendiente' : s.estado === 'pendiente';
    });

    const enviadas = solicitudes.filter(s => {
        const isMe = s.solicitante.id === currentUser?.id;
        if (!isMe) return false;
        return showHistory ? s.estado !== 'pendiente' : s.estado === 'pendiente';
    });

    const renderStatusBadge = (estado) => {
        switch (estado) {
            case 'pendiente':
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider">Pendiente</span>;
            case 'aceptada':
                return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider">Aceptada</span>;
            case 'rechazada':
                return <span className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">Rechazada</span>;
            default:
                return null;
        }
    };

    return (
        <Layout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                            {showHistory ? "Historial de Reemplazos" : "Solicitudes de Reemplazo Vigentes"}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {showHistory 
                                ? "Revisa todas las solicitudes pasadas que has aceptado o rechazado."
                                : "Administra las solicitudes de reemplazo pendientes que tienes por responder o que has enviado."}
                        </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Link 
                            to={showHistory ? "/guardias/solicitudes" : "/guardias/solicitudes/historico"}
                            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all text-center flex items-center justify-center"
                        >
                            {showHistory ? "Ver Vigentes" : "Ver Historial"}
                        </Link>
                        <button 
                            onClick={fetchSolicitudes}
                            className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl transition-all active:scale-95 shrink-0"
                            title="Actualizar lista"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin mr-2" />
                        <span>Cargando solicitudes...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Solicitudes Recibidas */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <ArrowDownLeft className="text-red-500" /> {showHistory ? "Recibidas (Historial)" : "Recibidas (Por Responder)"}
                            </h3>

                            {recibidas.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-400 italic text-sm">
                                        {showHistory ? "No tienes historial de solicitudes recibidas." : "No tienes solicitudes de reemplazo pendientes."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recibidas.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Solicitante</span>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                                                        {s.solicitante.first_name} {s.solicitante.last_name}
                                                    </h4>
                                                </div>
                                                {renderStatusBadge(s.estado)}
                                            </div>

                                            <div className="flex items-center gap-3 bg-red-50/50 dark:bg-red-500/5 px-4 py-3 rounded-2xl border border-red-100/50 dark:border-red-500/10">
                                                <CalendarIcon size={18} className="text-red-500" />
                                                <div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fecha del Turno</span>
                                                    <span className="block text-sm font-bold text-red-600 dark:text-red-500 capitalize">
                                                        {format(new Date(s.guardia.fecha + 'T00:00:00'), 'EEEE dd MMMM yyyy', { locale: es })}
                                                    </span>
                                                </div>
                                            </div>

                                            {s.estado === 'pendiente' && (
                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleResponder(s.id, 'rechazar')}
                                                        disabled={actioningId !== null}
                                                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 border border-red-100 hover:bg-red-50 text-red-600 dark:border-red-500/20 dark:hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
                                                    >
                                                        {actioningId === s.id ? <Loader2 size={14} className="animate-spin" /> : <XIcon size={14} />}
                                                        Rechazar
                                                    </button>
                                                    <button
                                                        onClick={() => handleResponder(s.id, 'aceptar')}
                                                        disabled={actioningId !== null}
                                                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 dark:shadow-none"
                                                    >
                                                        {actioningId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                        Aceptar Reemplazo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Solicitudes Enviadas */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <ArrowUpRight className="text-emerald-500" /> {showHistory ? "Enviadas (Historial)" : "Enviadas (Tus Solicitudes)"}
                            </h3>

                            {enviadas.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-400 italic text-sm">
                                        {showHistory ? "No tienes historial de solicitudes enviadas." : "No has solicitado reemplazos pendientes."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {enviadas.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reemplazante Propuesto</span>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                                                        {s.reemplazo.first_name} {s.reemplazo.last_name}
                                                    </h4>
                                                </div>
                                                {renderStatusBadge(s.estado)}
                                            </div>

                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <CalendarIcon size={18} className="text-slate-400 dark:text-slate-500" />
                                                <div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fecha del Turno</span>
                                                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                                                        {format(new Date(s.guardia.fecha + 'T00:00:00'), 'EEEE dd MMMM yyyy', { locale: es })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
