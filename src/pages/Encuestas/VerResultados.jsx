import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { getFormularioResultados } from '../../api/encuestas';
import { 
    BarChart3, ChevronLeft, Loader2, AlertCircle, 
    User, Eye, FileText, CheckCircle2
} from 'lucide-react';

const VerResultados = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [selectedIndividual, setSelectedIndividual] = useState(null);

    const fetchResultados = async () => {
        try {
            setLoading(true);
            const res = await getFormularioResultados(id);
            setData(res);
            setError(null);
        } catch (err) {
            setError('Error al cargar los resultados de la encuesta');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResultados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando resultados...</p>
                </div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate('/encuestas')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold"
                    >
                        <ChevronLeft size={20} /> Volver a Encuestas
                    </button>
                    <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error || 'No se encontraron datos'}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Navigation and Title */}
                <button
                    onClick={() => navigate('/encuestas')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold"
                >
                    <ChevronLeft size={20} /> Volver a Encuestas
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600 dark:text-red-400 shadow-md">
                            <BarChart3 size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">{data.formulario_titulo}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Resultados y agregación de respuestas obtenidas</p>
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl px-6 py-4 flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                        <span className="text-3xl font-black text-red-650 dark:text-red-400">{data.total_respuestas}</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Respuestas</span>
                    </div>
                </div>

                {data.total_respuestas === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center gap-4">
                        <FileText size={56} className="text-slate-200 dark:text-slate-700 animate-pulse" />
                        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-350">Sin respuestas aún</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">Esta encuesta aún no ha recibido ninguna respuesta de los bomberos de la compañía.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Statistics Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-red-650 dark:text-red-400" /> Estadísticas por Pregunta
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {data.estadisticas.map((campo) => {
                                    return (
                                        <div key={campo.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
                                                <h4 className="font-bold text-slate-800 dark:text-white text-lg">{campo.label}</h4>
                                                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg uppercase">
                                                    {campo.tipo_campo === 'seleccion_unica' && 'Opción Única'}
                                                    {campo.tipo_campo === 'seleccion_multiple' && 'Opción Múltiple'}
                                                    {campo.tipo_campo === 'numerico' && 'Numérico'}
                                                    {campo.tipo_campo === 'texto' && 'Texto Libre'}
                                                </span>
                                            </div>

                                            {/* Render by type */}
                                            {campo.tipo_campo === 'numerico' && (
                                                <div className="grid grid-cols-3 gap-4 pt-2">
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center">
                                                        <span className="text-xs text-slate-450 uppercase tracking-widest font-bold">Promedio</span>
                                                        <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{campo.stats.promedio.toFixed(2)}</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center">
                                                        <span className="text-xs text-slate-450 uppercase tracking-widest font-bold">Mínimo</span>
                                                        <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{campo.stats.min}</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center">
                                                        <span className="text-xs text-slate-450 uppercase tracking-widest font-bold">Máximo</span>
                                                        <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{campo.stats.max}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {['seleccion_unica', 'seleccion_multiple'].includes(campo.tipo_campo) && (
                                                <div className="space-y-4 pt-2">
                                                    {Object.entries(campo.stats.frecuencias).map(([option, count]) => {
                                                        const pct = data.total_respuestas > 0 ? (count / data.total_respuestas) * 100 : 0;
                                                        return (
                                                            <div key={option} className="space-y-1">
                                                                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                    <span>{option}</span>
                                                                    <span className="text-red-600 dark:text-red-400 font-bold">{count} ({pct.toFixed(1)}%)</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-200/50 dark:border-slate-700/30">
                                                                    <div 
                                                                        className="bg-red-600 h-full rounded-full transition-all duration-750 shadow-inner" 
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {campo.tipo_campo === 'texto' && (
                                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {campo.stats.respuestas.length === 0 ? (
                                                        <p className="text-sm text-slate-450 italic">No hay respuestas de texto.</p>
                                                    ) : (
                                                        campo.stats.respuestas.map((resp, rIdx) => (
                                                            <div key={rIdx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800/50 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                                "{resp}"
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Individual Responses Table */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-red-600" /> Respuestas Individuales
                            </h3>

                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bombero</th>
                                                <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">RUT</th>
                                                <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha de Respuesta</th>
                                                <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {data.respuestas_individuales.map((individual) => (
                                                <tr 
                                                    key={individual.id} 
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedIndividual(individual)}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                                <User size={18} />
                                                            </div>
                                                            <span className="font-bold text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-base">
                                                                {individual.usuario_nombre}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                        {individual.usuario_rut || '-'}
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                        {formatDate(individual.fecha)}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-red-600 dark:bg-slate-800 dark:hover:bg-red-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white font-bold px-4 py-2 rounded-xl transition-all text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedIndividual(individual);
                                                            }}
                                                        >
                                                            <Eye size={14} />
                                                            Ver Detalle
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Answer Detail Modal */}
                {selectedIndividual && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/10 rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedIndividual.usuario_nombre}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                            RUT: {selectedIndividual.usuario_rut || 'Sin registrar'} • Respondido el: {formatDate(selectedIndividual.fecha)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedIndividual(null)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <ChevronLeft size={24} className="rotate-90 md:rotate-0" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                                {data.estadisticas.map((campo) => {
                                    const value = selectedIndividual.respuestas[campo.id];
                                    return (
                                        <div key={campo.id} className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-4 last:border-b-0 last:pb-0">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                                                {campo.label}
                                            </span>
                                            <div className="text-base text-slate-800 dark:text-slate-200 font-semibold pl-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                                {value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) ? (
                                                    <span className="text-slate-400 italic font-normal">Sin respuesta (opcional)</span>
                                                ) : Array.isArray(value) ? (
                                                    <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                                                        {value.map((val, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 px-2.5 py-0.5 rounded-lg text-sm font-bold">
                                                                <CheckCircle2 size={12} /> {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : campo.tipo_campo === 'seleccion_unica' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                                        <CheckCircle2 size={16} /> {value}
                                                    </span>
                                                ) : (
                                                    <span>{value}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedIndividual(null)}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default VerResultados;
