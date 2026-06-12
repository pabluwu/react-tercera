import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { getFormularioByUuid, submitFormularioRespuesta } from '../../api/encuestas';
import { toast } from 'react-toastify';
import { 
    FileText, Loader2, AlertCircle, Send, CheckCircle2,
    Lock, Calendar
} from 'lucide-react';

const ResponderEncuesta = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formulario, setFormulario] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                setLoading(true);
                const data = await getFormularioByUuid(uuid);
                setFormulario(data);
                
                // Initialize answer states
                const initialAnswers = {};
                data.campos.forEach(campo => {
                    if (campo.tipo_campo === 'seleccion_multiple') {
                        initialAnswers[campo.id] = [];
                    } else {
                        initialAnswers[campo.id] = '';
                    }
                });
                setAnswers(initialAnswers);
                setError(null);
            } catch (err) {
                setError(err.message || 'Error al obtener la encuesta.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            fetchForm();
        }
    }, [uuid]);

    const updateAnswer = (campoId, val) => {
        setAnswers(prev => ({
            ...prev,
            [campoId]: val
        }));
    };

    const handleCheckboxChange = (campoId, option) => {
        const current = answers[campoId] || [];
        const isChecked = current.includes(option);
        const updated = isChecked 
            ? current.filter(item => item !== option) 
            : [...current, option];
        updateAnswer(campoId, updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        for (const campo of formulario.campos) {
            const val = answers[campo.id];
            if (campo.obligatorio) {
                if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                    toast.error(`Por favor responde la pregunta obligatoria: "${campo.label}"`);
                    return;
                }
            }
        }

        try {
            setSubmitting(true);
            const payload = {
                formulario: formulario.id,
                valores: Object.entries(answers).map(([campoId, value]) => ({
                    campo: parseInt(campoId),
                    valor: value
                }))
            };

            await submitFormularioRespuesta(payload);
            setSubmitted(true);
            toast.success('Respuestas enviadas correctamente. ¡Gracias!');
        } catch (err) {
            toast.error(err.message || 'Error al enviar tus respuestas.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando encuesta...</p>
                </div>
            </Layout>
        );
    }

    if (error || !formulario) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto px-4 py-16 text-center">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl">
                        <AlertCircle size={48} className="text-red-600 dark:text-red-400" />
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Encuesta No Disponible</h3>
                        <p className="text-slate-500 dark:text-slate-400">{error || 'El formulario solicitado no existe o no se puede cargar.'}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-2.5 rounded-xl transition-all"
                        >
                            Ir al Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Success Screen
    if (submitted) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-5 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full shadow-inner">
                            <CheckCircle2 size={56} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-850 dark:text-white">¡Respuestas Enviadas!</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
                            Tus respuestas a la encuesta <strong>{formulario.titulo}</strong> han sido registradas con éxito en el sistema.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-850 px-6 py-3 rounded-2xl text-xs text-slate-400 font-bold uppercase tracking-wider mt-2 border border-slate-100 dark:border-slate-800">
                            Solo usuarios registrados • Respuestas no editables
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/20 w-full"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Checking if already responded from the API field
    if (formulario.respondido) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-5">
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full">
                            <Lock size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Ya has respondido</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">
                            Ya enviaste tu respuesta para <strong>{formulario.titulo}</strong>. Las normas del sistema no permiten volver a responder ni editar respuestas previas.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl transition-all w-full"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Form Title Card */}
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800/80 mb-8 space-y-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-red-600" />
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <FileText size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Encuestas Oficiales</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:!text-white">{formulario.titulo}</h2>
                    {formulario.descripcion && (
                        <p className="text-slate-600 dark:!text-slate-300 text-base leading-relaxed whitespace-pre-line font-medium border-t border-slate-50 dark:border-slate-800/50 pt-4">
                            {formulario.descripcion}
                        </p>
                    )}
                    {formulario.fecha_fin && (
                        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50/50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg w-fit">
                            <Calendar size={14} />
                            <span>Disponible hasta: {new Date(formulario.fecha_fin).toLocaleString('es-CL')}</span>
                        </div>
                    )}
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formulario.campos.map((campo, index) => {
                        return (
                            <div key={campo.id} className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <label className="font-bold text-slate-800 dark:!text-white text-lg flex gap-1.5">
                                        <span className="text-red-600 dark:text-red-500">{index + 1}.</span>
                                        {campo.label}
                                        {campo.obligatorio && <span className="text-red-500 font-black">*</span>}
                                    </label>
                                </div>

                                {/* Inputs depending on type */}
                                {campo.tipo_campo === 'texto' && (
                                    <textarea
                                        placeholder="Escribe tu respuesta aquí..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white min-h-[100px] font-medium"
                                        value={answers[campo.id] || ''}
                                        onChange={(e) => updateAnswer(campo.id, e.target.value)}
                                        required={campo.obligatorio}
                                    />
                                )}

                                {campo.tipo_campo === 'numerico' && (
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Ingresa un valor numérico..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white font-medium"
                                        value={answers[campo.id] || ''}
                                        onChange={(e) => updateAnswer(campo.id, e.target.value)}
                                        required={campo.obligatorio}
                                    />
                                )}

                                {campo.tipo_campo === 'seleccion_unica' && (
                                    <div className="flex flex-col gap-2.5">
                                        {campo.opciones.map((opcion) => (
                                            <label 
                                                key={opcion} 
                                                className={`flex items-center gap-3.5 p-3.5 border rounded-2xl cursor-pointer select-none transition-all ${
                                                    answers[campo.id] === opcion 
                                                    ? 'border-red-600 bg-red-50/10 dark:!bg-red-950/20 text-red-600 dark:text-red-400' 
                                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${campo.id}`}
                                                    checked={answers[campo.id] === opcion}
                                                    onChange={() => updateAnswer(campo.id, opcion)}
                                                    className="w-5 h-5 accent-red-600 cursor-pointer"
                                                    required={campo.obligatorio}
                                                />
                                                <span className="font-semibold">{opcion}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {campo.tipo_campo === 'seleccion_multiple' && (
                                    <div className="flex flex-col gap-2.5">
                                        {campo.opciones.map((opcion) => {
                                            const isChecked = (answers[campo.id] || []).includes(opcion);
                                            return (
                                                <label 
                                                    key={opcion} 
                                                    className={`flex items-center gap-3.5 p-3.5 border rounded-2xl cursor-pointer select-none transition-all ${
                                                        isChecked 
                                                        ? 'border-red-600 bg-red-50/10 dark:!bg-red-950/20 text-red-600 dark:text-red-400' 
                                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(campo.id, opcion)}
                                                        className="w-5 h-5 accent-red-600 cursor-pointer rounded"
                                                    />
                                                    <span className="font-semibold">{opcion}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            <Send size={18} />
                            {submitting ? 'Enviando...' : 'Enviar Respuestas'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ResponderEncuesta;

