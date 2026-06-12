import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { createFormulario } from '../../api/encuestas';
import { toast } from 'react-toastify';
import { 
    Plus, Trash2, ArrowUp, ArrowDown, Save, X, 
    ChevronLeft, Settings, Settings2
} from 'lucide-react';

const CrearEncuesta = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    
    // Form metadata
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    
    // Set default dates to current local date/time (formatted for datetime-local input)
    const getLocalDateTime = (offsetHours = 0) => {
        const d = new Date();
        d.setHours(d.getHours() + offsetHours);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    const [fechaLanzamiento, setFechaLanzamiento] = useState(getLocalDateTime());
    const [fechaInicio, setFechaInicio] = useState(getLocalDateTime());
    const [fechaFin, setFechaFin] = useState('');

    // Form fields (questions)
    const [campos, setCampos] = useState([
        {
            id: Date.now(),
            label: '',
            tipo_campo: 'texto',
            obligatorio: true,
            opciones: ['']
        }
    ]);

    const handleAddCampo = () => {
        setCampos([
            ...campos,
            {
                id: Date.now(),
                label: '',
                tipo_campo: 'texto',
                obligatorio: true,
                opciones: ['']
            }
        ]);
    };

    const handleRemoveCampo = (id) => {
        setCampos(campos.filter(campo => campo.id !== id));
    };

    const handleCampoChange = (id, field, value) => {
        setCampos(campos.map(campo => {
            if (campo.id === id) {
                const updated = { ...campo, [field]: value };
                // If changing type to text/number, options aren't strictly needed in state,
                // but keep them in case they toggle back
                return updated;
            }
            return campo;
        }));
    };

    // Options for selection fields
    const handleAddOption = (campoId) => {
        setCampos(campos.map(campo => {
            if (campo.id === campoId) {
                return { ...campo, opciones: [...campo.opciones, ''] };
            }
            return campo;
        }));
    };

    const handleRemoveOption = (campoId, optIndex) => {
        setCampos(campos.map(campo => {
            if (campo.id === campoId) {
                const newOpts = campo.opciones.filter((_, idx) => idx !== optIndex);
                return { ...campo, opciones: newOpts.length ? newOpts : [''] };
            }
            return campo;
        }));
    };

    const handleOptionChange = (campoId, optIndex, val) => {
        setCampos(campos.map(campo => {
            if (campo.id === campoId) {
                const newOpts = [...campo.opciones];
                newOpts[optIndex] = val;
                return { ...campo, opciones: newOpts };
            }
            return campo;
        }));
    };

    // Reordering fields
    const moveCampo = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === campos.length - 1) return;

        const newCampos = [...campos];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        const temp = newCampos[index];
        newCampos[index] = newCampos[targetIndex];
        newCampos[targetIndex] = temp;
        
        setCampos(newCampos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!titulo.trim()) {
            toast.error('El título de la encuesta es obligatorio.');
            return;
        }
        if (!fechaLanzamiento || !fechaInicio) {
            toast.error('Las fechas de lanzamiento e inicio son obligatorias.');
            return;
        }
        if (campos.length === 0) {
            toast.error('La encuesta debe tener al menos una pregunta.');
            return;
        }

        // Validate each question
        for (const [idx, campo] of campos.entries()) {
            if (!campo.label.trim()) {
                toast.error(`La pregunta #${idx + 1} no tiene texto.`);
                return;
            }
            if (['seleccion_unica', 'seleccion_multiple'].includes(campo.tipo_campo)) {
                const validOptions = campo.opciones.filter(opt => opt.trim() !== '');
                if (validOptions.length === 0) {
                    toast.error(`La pregunta #${idx + 1} (${campo.label}) requiere al menos una opción de selección.`);
                    return;
                }
            }
        }

        try {
            setSubmitting(true);

            // Format dates to ISO
            const payload = {
                titulo,
                descripcion,
                fecha_lanzamiento: new Date(fechaLanzamiento).toISOString(),
                fecha_inicio: new Date(fechaInicio).toISOString(),
                fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
                campos: campos.map((campo, index) => ({
                    label: campo.label,
                    tipo_campo: campo.tipo_campo,
                    obligatorio: campo.obligatorio,
                    opciones: ['seleccion_unica', 'seleccion_multiple'].includes(campo.tipo_campo)
                        ? campo.opciones.filter(opt => opt.trim() !== '')
                        : [],
                    orden: index
                }))
            };

            await createFormulario(payload);
            toast.success('¡Encuesta creada con éxito!');
            navigate('/encuestas');
        } catch (err) {
            toast.error(`Error al crear la encuesta: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate('/encuestas')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold"
                >
                    <ChevronLeft size={20} /> Volver a Encuestas
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Crear Nueva Encuesta</h2>
                    <p className="text-slate-500 dark:text-slate-400">Diseña un nuevo formulario dinámico para la compañía</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings Card */}
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <Settings className="text-red-600 dark:text-red-500" size={22} />
                            <h3 className="text-xl font-bold text-slate-800 dark:!text-white">Datos Generales</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Título de la Encuesta *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Encuesta de Tallas para Uniformes 2026"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white font-semibold"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Descripción / Instrucciones
                                </label>
                                <textarea
                                    placeholder="Indica las instrucciones o el propósito de este formulario..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white min-h-[100px]"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Fecha de Lanzamiento *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white"
                                        value={fechaLanzamiento}
                                        onChange={(e) => setFechaLanzamiento(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Fecha de Inicio (Respuestas) *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Fecha de Cierre (Opcional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:!text-white"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Card */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Settings2 className="text-red-600 dark:text-red-500" size={22} />
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Estructura de Preguntas</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                {campos.length} preguntas
                            </span>
                        </div>

                        {campos.map((campo, index) => (
                            <div 
                                key={campo.id} 
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 relative group transition-all"
                            >
                                {/* Drag/Reorder buttons */}
                                <div className="absolute right-6 top-6 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => moveCampo(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveCampo(index, 'down')}
                                        disabled={index === campos.length - 1}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCampo(campo.id)}
                                        className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-4 pr-24">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Question text */}
                                        <div className="md:col-span-2 flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Pregunta #{index + 1}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Escribe la pregunta..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-white font-medium"
                                                value={campo.label}
                                                onChange={(e) => handleCampoChange(campo.id, 'label', e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Field type */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Tipo de Respuesta
                                            </label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-white font-medium"
                                                value={campo.tipo_campo}
                                                onChange={(e) => handleCampoChange(campo.id, 'tipo_campo', e.target.value)}
                                            >
                                                <option value="texto">Texto Libre</option>
                                                <option value="numerico">Numérico</option>
                                                <option value="seleccion_unica">Selección Única</option>
                                                <option value="seleccion_multiple">Selección Múltiple</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Options configuration for selections */}
                                    {['seleccion_unica', 'seleccion_multiple'].includes(campo.tipo_campo) && (
                                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Opciones de Selección
                                                </label>
                                            </div>
                                            <div className="space-y-2">
                                                {campo.opciones.map((opcion, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-2">
                                                        <span className="text-slate-300 dark:text-slate-500 font-bold">•</span>
                                                        <input
                                                            type="text"
                                                            placeholder={`Opción ${optIdx + 1}`}
                                                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all text-sm dark:bg-slate-800 dark:text-white"
                                                            value={opcion}
                                                            onChange={(e) => handleOptionChange(campo.id, optIdx, e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOption(campo.id, optIdx)}
                                                            className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 rounded-lg text-slate-400 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(campo.id)}
                                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                <Plus size={14} /> Agregar Opción
                                            </button>
                                        </div>
                                    )}

                                    {/* Settings: Required checkbox */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id={`req-${campo.id}`}
                                            className="w-4.5 h-4.5 accent-red-600 rounded cursor-pointer"
                                            checked={campo.obligatorio}
                                            onChange={(e) => handleCampoChange(campo.id, 'obligatorio', e.target.checked)}
                                        />
                                        <label htmlFor={`req-${campo.id}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                            Respuesta obligatoria
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add question button */}
                        <button
                            type="button"
                            onClick={handleAddCampo}
                            className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-red-500 dark:border-slate-800 dark:hover:border-red-500/50 rounded-3xl flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-bold transition-all bg-white dark:bg-slate-900 shadow-md"
                        >
                            <Plus size={20} />
                            Agregar Pregunta
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/encuestas')}
                            className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {submitting ? 'Guardando...' : 'Crear Encuesta'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CrearEncuesta;
