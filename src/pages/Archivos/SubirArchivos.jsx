import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Upload, FileText, Info, Loader2, CheckCircle, FileUp } from 'lucide-react';
import { useState } from 'react';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useTiposPermitidos } from '../../hooks/useTiposPermitidos';
import Layout from '../../layout/Layout';

const subirArchivo = async (data) => {
    const formData = new FormData();
    formData.append('tipo', data.tipo);
    formData.append('nombre', data.nombre);
    formData.append('archivo', data.archivo[0]);
    formData.append('descripcion', data.descripcion || '');

    return await fetchWithToken('/archivos/', {
        method: 'POST',
        body: formData,
    });
};

const SubirArchivo = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const { data: tipos, isLoading: cargandoTipos } = useTiposPermitidos();
    const selectedFile = watch('archivo');

    const mutation = useMutation({
        mutationFn: subirArchivo,
        onSuccess: () => {
            toast.success('Archivo subido exitosamente');
            reset();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => setIsUploading(false),
    });

    const onSubmit = (data) => {
        setIsUploading(true);
        mutation.mutate(data);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-10 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                            <Upload size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Subir Documento</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Carga nuevos archivos al repositorio digital</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <FileText size={16} /> Tipo de Documento
                                </label>
                                <select 
                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${errors.tipo ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                    {...register('tipo', { required: true })} 
                                    disabled={cargandoTipos}
                                >
                                    <option value="">Seleccione un tipo</option>
                                    {tipos?.map((tipo) => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                                {errors.tipo && <p className="text-xs text-red-500 ml-1">Campo requerido</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <Info size={16} /> Nombre del Documento
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Reglamento Interno 2024"
                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.nombre ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                    {...register('nombre', { required: true })}
                                />
                                {errors.nombre && <p className="text-xs text-red-500 ml-1">Campo requerido</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <FileUp size={16} /> Seleccionar Archivo
                            </label>
                            <div className={`relative group border-2 border-dashed rounded-2xl transition-all duration-200 text-center p-8 ${selectedFile?.length > 0 ? 'border-blue-400 bg-blue-50/50 dark:!bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept=".pdf,.doc,.docx"
                                    {...register('archivo', { required: true })}
                                />
                                <div className="flex flex-col items-center gap-3">
                                    {selectedFile?.length > 0 ? (
                                        <div className="p-4 bg-blue-100 dark:!bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                                            <CheckCircle size={32} />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-100 dark:!bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            <Upload size={32} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                                            {selectedFile?.length > 0 ? selectedFile[0].name : 'Haz clic o arrastra un archivo aquí'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Formatos permitidos: PDF, DOC, DOCX (Máx. 10MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {errors.archivo && <p className="text-xs text-red-500 ml-1 text-center">Debe seleccionar un archivo</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Info size={16} /> Descripción (opcional)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                                rows="3"
                                placeholder="Breve detalle sobre el contenido del documento..."
                                {...register('descripcion')}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isUploading || cargandoTipos}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 group"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Subiendo Documento...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                                        <span>Subir Archivo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default SubirArchivo;
