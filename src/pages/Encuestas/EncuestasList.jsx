import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { getFormularios, deleteFormulario } from '../../api/encuestas';
import { toast } from 'react-toastify';
import { 
    ClipboardList, Plus, Trash2, BarChart3, Copy, Check, 
    Calendar, Loader2, AlertCircle
} from 'lucide-react';

const EncuestasList = () => {
    const navigate = useNavigate();
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

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

    const handleDelete = async (id, titulo) => {
        if (window.confirm(`¿Está seguro de que desea eliminar la encuesta "${titulo}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteFormulario(id);
                toast.success('Encuesta eliminada correctamente');
                fetchEncuestas();
            } catch (err) {
                toast.error(`Error al eliminar la encuesta: ${err.message}`);
            }
        }
    };

    const handleCopyLink = (uuid, id) => {
        const url = `${window.location.origin}/encuestas/responder/${uuid}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopiedId(id);
                toast.success('¡Enlace copiado al portapapeles!');
                setTimeout(() => setCopiedId(null), 2000);
            })
            .catch(() => {
                toast.error('No se pudo copiar el enlace.');
            });
    };

    const getStatusBadge = (encuesta) => {
        const ahora = new Date();
        const lanzamiento = new Date(encuesta.fecha_lanzamiento);
        const inicio = new Date(encuesta.fecha_inicio);
        const fin = encuesta.fecha_fin ? new Date(encuesta.fecha_fin) : null;

        if (ahora < lanzamiento || ahora < inicio) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    Programada
                </span>
            );
        } else if (fin && ahora > fin) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Finalizada
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                    Activa
                </span>
            );
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando encuestas...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600 dark:text-red-400 shadow-md">
                            <ClipboardList size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Encuestas</h2>
                            <p className="text-slate-500 dark:text-slate-400">Crea y administra formularios para oficiales y bomberos</p>
                        </div>
                    </div>
                    <div>
                        <button
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-red-500/20 group w-full md:w-auto"
                            onClick={() => navigate('/encuestas/crear')}
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            Nueva Encuesta
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fechas</th>
                                    <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Respuestas</th>
                                    <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {encuestas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <ClipboardList size={56} className="text-slate-200 dark:text-slate-700" />
                                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No hay encuestas disponibles</h3>
                                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Comienza creando tu primera encuesta para recopilar información de los bomberos.</p>
                                                <button
                                                    onClick={() => navigate('/encuestas/crear')}
                                                    className="mt-2 inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl transition-all duration-200"
                                                >
                                                    <Plus size={16} /> Crear Formulario
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    encuestas.map((encuesta) => (
                                        <tr key={encuesta.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col max-w-md">
                                                    <span className="font-bold text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-base">
                                                        {encuesta.titulo}
                                                    </span>
                                                    {encuesta.descripcion && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
                                                            {encuesta.descripcion}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        <span>Lanzamiento: {formatDate(encuesta.fecha_lanzamiento)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        <span>Inicio: {formatDate(encuesta.fecha_inicio)}</span>
                                                    </div>
                                                    {encuesta.fecha_fin && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-red-400" />
                                                            <span className="text-red-600 dark:text-red-400 font-semibold">Cierre: {formatDate(encuesta.fecha_fin)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                                                        {encuesta.num_respuestas}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-normal">
                                                        respuestas
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {getStatusBadge(encuesta)}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${
                                                            copiedId === encuesta.id 
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400'
                                                        }`}
                                                        title="Copiar enlace público"
                                                        onClick={() => handleCopyLink(encuesta.uuid, encuesta.id)}
                                                    >
                                                        {copiedId === encuesta.id ? <Check size={18} /> : <Copy size={18} />}
                                                    </button>
                                                    <button
                                                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all shadow-sm"
                                                        title="Ver Estadísticas y Respuestas"
                                                        onClick={() => navigate(`/encuestas/${encuesta.id}/resultados`)}
                                                    >
                                                        <BarChart3 size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm"
                                                        title="Eliminar encuesta"
                                                        onClick={() => handleDelete(encuesta.id, encuesta.titulo)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EncuestasList;
