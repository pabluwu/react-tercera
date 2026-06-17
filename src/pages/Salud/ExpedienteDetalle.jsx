import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, HeartPulse, FileText, Upload, Trash2, 
  Download, FileUp, Clock, AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import { 
  getExpedientes, createExpediente, deleteExpediente, downloadSaludFile 
} from '../../api/salud';
import { fetchWithToken } from '../../api/fetchWithToken';

export default function ExpedienteDetalle() {
  const { bomberoId } = useParams();
  const navigate = useNavigate();
  const [bombero, setBombero] = useState(null);
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const selectedFile = watch('archivo');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener perfil del bombero
      const bomberoData = await fetchWithToken(`/perfiles/${bomberoId}/`);
      setBombero(bomberoData);

      // Obtener expedientes de salud de este bombero
      const expData = await getExpedientes({ bombero: bomberoId });
      setExpedientes(Array.isArray(expData) ? expData : expData.results || []);

    } catch (error) {
      console.error("Error al cargar expediente", error);
      toast.error("No se pudo cargar la información médica");
    } finally {
      setLoading(false);
    }
  }, [bomberoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('bombero', bomberoId);
      formData.append('categoria', data.categoria);
      formData.append('archivo', data.archivo[0]);
      formData.append('fecha_documento', data.fecha_documento);
      formData.append('observaciones', data.observaciones || '');

      await createExpediente(formData);
      toast.success("Documento médico subido correctamente");
      reset();
      loadData();
    } catch (error) {
      console.error("Error al subir expediente", error);
      toast.error(error.message || "Error al subir el documento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteExpediente(id);
      toast.success("Documento eliminado correctamente");
      loadData();
    } catch (error) {
      console.error("Error al eliminar", error);
      toast.error("No se pudo eliminar el documento");
    }
  };

  const triggerDownload = async (id, filePath) => {
    try {
      const extension = filePath.split('.').pop();
      const cleanName = `Expediente_${bombero.apellido_paterno}_${id}.${extension}`;
      await downloadSaludFile(`/salud/expedientes/${id}/descargar/`, cleanName);
    } catch (error) {
      console.error("Error al descargar", error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const categoriasLabel = {
    examenes: 'Exámenes',
    fichas_medicas: 'Fichas Médicas',
    certificados_aptitud: 'Certificados de Aptitud',
    otros: 'Otros'
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/salud/expedientes')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Volver a Expedientes
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-slate-500 mt-4">Cargando expediente...</p>
          </div>
        ) : !bombero ? (
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bombero no encontrado</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Perfil del Bombero y Formulario de carga */}
            <div className="lg:col-span-1 space-y-6">
              {/* Perfil */}
              <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <HeartPulse className="text-red-500" size={20} />
                  Perfil de Salud
                </h2>
                <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-red-500/20 bg-slate-50 flex items-center justify-center mb-3">
                    {bombero.imagen ? (
                      <img src={bombero.imagen} alt={bombero.nombres} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-400">{bombero.nombres[0]}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                    {bombero.nombres} {bombero.apellido_paterno}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{bombero.cargo || 'Bombero'}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">RUT</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{bombero.rut}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Grupo Sanguíneo</span>
                    <p className="text-sm font-bold text-red-500">{bombero.sangre_grupo || 'No Registrado'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Compañía</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{bombero.cia || 'Sin Compañía'}</p>
                  </div>
                </div>
              </div>

              {/* Formulario de Carga */}
              <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Upload className="text-blue-500" size={18} />
                  Subir Documento Médico
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                      Categoría
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                      {...register('categoria', { required: true })}
                    >
                      <option value="">Seleccione categoría</option>
                      <option value="examenes">Exámenes</option>
                      <option value="fichas_medicas">Fichas Médicas</option>
                      <option value="certificados_aptitud">Certificados de Aptitud</option>
                      <option value="otros">Otros</option>
                    </select>
                    {errors.categoria && <p className="text-xs text-red-500 mt-1">Requerido</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                      Fecha del Documento
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm"
                      {...register('fecha_documento', { required: true })}
                    />
                    {errors.fecha_documento && <p className="text-xs text-red-500 mt-1">Requerido</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                      Observaciones
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Indique detalles relevantes del archivo..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm"
                      {...register('observaciones')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                      Archivo Adjunto (Obligatorio)
                    </label>
                    <div className={`relative group border border-dashed rounded-xl transition-all text-center p-4 ${selectedFile?.length > 0 ? 'border-red-400 bg-red-50/20' : 'border-slate-200 dark:border-slate-700 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        {...register('archivo', { required: true })}
                      />
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileUp size={20} className={selectedFile?.length > 0 ? 'text-red-500' : 'text-slate-400'} />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {selectedFile?.length > 0 ? selectedFile[0].name : 'Subir archivo (PDF/Imagen)'}
                        </span>
                      </div>
                    </div>
                    {errors.archivo && <p className="text-xs text-red-500 mt-1">El archivo es obligatorio</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Subiendo...' : 'Cargar Expediente'}
                  </button>
                </form>
              </div>
            </div>

            {/* Listado de Documentos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FileText className="text-red-500" size={22} />
                  Documentos Clínicos Registrados ({expedientes.length})
                </h2>

                {expedientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="text-slate-300 dark:text-slate-700 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Expediente Vacío</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      No hay registros ni archivos de salud para este bombero. Utiliza el panel izquierdo para subir documentos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expedientes.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 bg-red-50 dark:!bg-red-950/20 text-red-500 rounded-xl mt-0.5">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-white text-sm">
                                {categoriasLabel[doc.categoria] || doc.categoria}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                Doc: {doc.fecha_documento}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                              {doc.observaciones || 'Sin observaciones.'}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                              Subido por: {doc.creado_por_name} • {new Date(doc.creado_en).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => triggerDownload(doc.id, doc.archivo)}
                            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 transition-all"
                            title="Descargar archivo seguro"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
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
