import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { getFormularios } from '../../api/encuestas';
import { 
    ClipboardList, Calendar, Loader2, AlertCircle, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react';

const MisEncuestas = () => {
    const navigate = useNavigate();
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pendientes');

    const fetchEncuestas = async () => {
        try {
            setLoading(true);
            const data = await getFormularios();
            setEncuestas(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las encuestas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEncuestas();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const pendingEncuestas = encuestas.filter(e => !e.respondido);
    const answeredEncuestas = encuestas.filter(e => e.respondido);

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando tus encuestas...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600 dark:text-red-400 shadow-md">
                        <ClipboardList size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white">Mis Encuestas</h2>
                        <p className="text-slate-500 dark:text-slate-400">Responde formularios activos y revisa tu historial de participación</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-slate-150 dark:border-slate-800 mb-8 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pendientes')}
                        className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 relative ${
                            activeTab === 'pendientes'
                            ? 'text-red-650 border-red-600 dark:text-red-400'
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        Pendientes
                        {pendingEncuestas.length > 0 && (
                            <span className="ml-2 bg-red-600 text-white text-xxs font-black px-2 py-0.5 rounded-full">
                                {pendingEncuestas.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('respondidas')}
                        className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 relative ${
                            activeTab === 'respondidas'
                            ? 'text-red-650 border-red-600 dark:text-red-400'
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        Respondidas
                        {answeredEncuestas.length > 0 && (
                            <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xxs font-black px-2 py-0.5 rounded-full">
                                {answeredEncuestas.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === 'pendientes' ? (
                        pendingEncuestas.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-850 shadow-xl flex flex-col items-center justify-center gap-4">
                                <CheckCircle2 size={48} className="text-green-500" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">¡Estás al día!</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">No tienes encuestas pendientes por responder en este momento.</p>
                            </div>
                        ) : (
                            pendingEncuestas.map((encuesta) => (
                                <div 
                                    key={encuesta.id} 
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500 dark:hover:border-red-500/30 transition-all group"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xxs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-150 dark:border-red-900/30 uppercase tracking-wide">
                                                Obligatorio
                                            </span>
                                            {encuesta.fecha_fin && (
                                                <span className="text-xxs font-bold text-slate-400 flex items-center gap-1">
                                                    <Calendar size={12} /> Cierra: {formatDate(encuesta.fecha_fin)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-850 dark:text-white group-hover:text-red-650 transition-colors">
                                            {encuesta.titulo}
                                        </h3>
                                        {encuesta.descripcion && (
                                            <p className="text-sm text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed">
                                                {encuesta.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/encuestas/responder/${encuesta.uuid}`)}
                                            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-red-500/10 group-hover:translate-x-1"
                                        >
                                            Responder <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        answeredEncuestas.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-850 shadow-xl flex flex-col items-center justify-center gap-4">
                                <FileText size={48} className="text-slate-300 dark:text-slate-700" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Sin historial</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">Aún no has respondido ninguna encuesta en la plataforma.</p>
                            </div>
                        ) : (
                            answeredEncuestas.map((encuesta) => (
                                <div 
                                    key={encuesta.id} 
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-80"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-xxs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-md border border-green-150 dark:border-green-900/30 uppercase tracking-wide">
                                                Respondida
                                            </span>
                                            <span className="text-xxs font-bold text-slate-400">
                                                Lanzado: {formatDate(encuesta.fecha_lanzamiento)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {encuesta.titulo}
                                        </h3>
                                        {encuesta.descripcion && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                                {encuesta.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2 text-slate-400 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Resp. Registrada
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MisEncuestas;
