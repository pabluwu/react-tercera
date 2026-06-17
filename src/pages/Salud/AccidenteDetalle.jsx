import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, Flame, Calendar, Activity, AlertCircle, 
  CheckCircle2, Clock, Plus, Trash2, Download, FileUp 
} from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import { 
  getAccidenteDetalle, updateAccidente, createMovimiento, deleteMovimiento, downloadSaludFile 
} from '../../api/salud';

export default function AccidenteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accidente, setAccidente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingHito, setSubmittingHito] = useState(false);
  const [togglingState, setTogglingState] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const selectedFile = watch('archivo');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAccidenteDetalle(id);
      setAccidente(data);
    } catch (error) {
      console.error("Error al cargar accidente", error);
      toast.error("No se pudo cargar el detalle del accidente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleToggleEstado = async () => {
    if (!accidente) return;
    const nuevoEstado = accidente.estado === 'abierto' ? 'cerrado' : 'abierto';
    const msg = nuevoEstado === 'cerrado' 
      ? "¿Confirmar cierre del accidente? Esto indica que el bombero ha recibido el alta definitiva." 
      : "¿Confirmar reapertura del accidente?";

    if (!window.confirm(msg)) return;

    try {
      setTogglingState(true);
      await updateAccidente(id, { estado: nuevoEstado });
      toast.success(`Accidente ${nuevoEstado === 'cerrado' ? 'cerrado' : 'reabierto'} exitosamente`);
      loadData();
    } catch (error) {
      console.error("Error al cambiar estado", error);
      toast.error("No se pudo cambiar el estado del accidente");
    } finally {
      setTogglingState(false);
    }
  };

  const onSubmitHito = async (data) => {
    try {
      setSubmittingHito(true);
      const formData = new FormData();
      formData.append('accidente', id);
      formData.append('fecha_hito', data.fecha_hito);
      formData.append('tipo_accion', data.tipo_accion);
      formData.append('detalle', data.detalle || '');
      
      // El archivo es opcional, lo agregamos solo si existe
      if (data.archivo && data.archivo.length > 0) {
        formData.append('archivo', data.archivo[0]);
      }

      await createMovimiento(formData);
      toast.success("Hito registrado correctamente en la bitácora");
      reset();
      loadData();
    } catch (error) {
      console.error("Error al registrar hito", error);
      toast.error(error.message || "No se pudo registrar el hito");
    } finally {
      setSubmittingHito(false);
    }
  };

  const handleDeleteHito = async (hitoId) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este hito de la bitácora?")) {
      return;
    }
    try {
      await deleteMovimiento(hitoId);
      toast.success("Hito eliminado correctamente");
      loadData();
    } catch (error) {
      console.error("Error al eliminar hito", error);
      toast.error("No se pudo eliminar el hito");
    }
  };

  const triggerDownload = async (hitoId, filePath) => {
    try {
      const extension = filePath.split('.').pop();
      const cleanName = `Hito_${accidente.bombero_detalle.apellido_paterno}_${hitoId}.${extension}`;
      await downloadSaludFile(`/salud/movimientos/${hitoId}/descargar/`, cleanName);
    } catch (error) {
      console.error("Error al descargar archivo", error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const contextoLabel = {
    incendio: 'Incendio',
    rescate: 'Rescate',
    ejercicio: 'Ejercicio',
    otro: 'Otro'
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/salud/accidentes')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Volver a Accidentes
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-slate-500 mt-4">Cargando bitácora del accidente...</p>
          </div>
        ) : !accidente ? (
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Accidente no encontrado</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resumen del Accidente */}
            <div className="lg:col-span-1 space-y-6">
              <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Flame className="text-red-500" size={20} />
                    Detalle Siniestro
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    accidente.estado === 'abierto'
                      ? 'bg-red-50 text-red-500 border border-red-200'
                      : 'bg-green-50 text-green-500 border border-green-200'
                  }`}>
                    {accidente.estado}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Bombero Afectado</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {accidente.bombero_detalle?.nombres} {accidente.bombero_detalle?.apellido_paterno}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">RUT: {accidente.bombero_detalle?.rut}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Fecha y Hora</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(accidente.fecha_hora).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Contexto</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {contextoLabel[accidente.contexto] || accidente.contexto}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Lesión / Diagnóstico</span>
                    <div className="p-3 bg-slate-50 dark:!bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      "{accidente.descripcion}"
                    </div>
                  </div>

                </div>

                {/* Botón para cambiar estado */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleToggleEstado}
                    disabled={togglingState}
                    className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      accidente.estado === 'abierto'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {accidente.estado === 'abierto' ? (
                      <>
                        <CheckCircle2 size={16} />
                        Cerrar Caso (Dar de Alta)
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Reabrir Caso
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Registrar Hito en la Bitácora */}
              {accidente.estado === 'abierto' && (
                <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="text-blue-500" size={18} />
                    Registrar Hito Médico
                  </h2>
                  <form onSubmit={handleSubmit(onSubmitHito)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                        Fecha del Hito
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm"
                        {...register('fecha_hito', { required: true })}
                      />
                      {errors.fecha_hito && <p className="text-xs text-red-500 mt-1">Requerido</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                        Tipo de Acción
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Derivación a centro médico, Sesión kinesiología, Alta médica"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm"
                        {...register('tipo_accion', { required: true })}
                      />
                      {errors.tipo_accion && <p className="text-xs text-red-500 mt-1">Requerido</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                        Detalle / Observaciones
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Comentarios adicionales del hito..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm"
                        {...register('detalle')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                        Documento Adjunto (Opcional)
                      </label>
                      <div className={`relative group border border-dashed rounded-xl transition-all text-center p-4 ${selectedFile?.length > 0 ? 'border-red-400 bg-red-50/20' : 'border-slate-200 dark:border-slate-700 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          {...register('archivo')}
                        />
                        <div className="flex flex-col items-center justify-center gap-1">
                          <FileUp size={20} className={selectedFile?.length > 0 ? 'text-red-500' : 'text-slate-400'} />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {selectedFile?.length > 0 ? selectedFile[0].name : 'Subir archivo (PDF/Imagen)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingHito}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {submittingHito ? 'Guardando...' : 'Agregar Hito'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bitácora Cronológica de Movimientos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                  <Activity className="text-red-500" size={22} />
                  Bitácora Cronológica de Movimientos ({accidente.movimientos?.length || 0})
                </h2>

                {!accidente.movimientos || accidente.movimientos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Clock className="text-slate-300 dark:text-slate-700 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sin Movimientos</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      No hay hitos médicos registrados. Agregue derivaciones, tratamientos o sesiones de rehabilitación para llevar la evolución.
                    </p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6 space-y-8">
                    {accidente.movimientos.map((hito) => (
                      <div key={hito.id} className="relative group">
                        {/* Indicador de Línea de Tiempo */}
                        <div className="absolute -left-[31px] top-1 bg-red-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
                          <CheckCircle2 size={10} />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 bg-slate-50/50 dark:!bg-slate-800/20 rounded-2xl border border-slate-100/50 dark:border-slate-800 hover:shadow-sm transition-all">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                {hito.tipo_accion}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {hito.fecha_hito}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {hito.detalle || 'Sin observaciones detalladas.'}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <span>Registrado por: {hito.creado_por_name}</span>
                              <span>•</span>
                              <span>F. Registro: {new Date(hito.creado_en).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 self-end md:self-start">
                            {hito.archivo && (
                              <button
                                onClick={() => triggerDownload(hito.id, hito.archivo)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 transition-all"
                                title="Descargar documento de hito"
                              >
                                <Download size={14} />
                              </button>
                            )}
                            {accidente.estado === 'abierto' && (
                              <button
                                onClick={() => handleDeleteHito(hito.id)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-all"
                                title="Eliminar hito"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
