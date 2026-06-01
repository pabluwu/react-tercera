import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import BomberoSelector from '../../components/BomberoSelector';
import CitacionSelector from '../../components/CitacionSelector';
import EmergenciaForm from '../../components/EmergenciaForm';
import { fetchWithToken } from '../../api/fetchWithToken';
import Layout from '../../layout/Layout';
import { ClipboardList, Save, Info, RefreshCw, AlertCircle, Users } from 'lucide-react';

const CrearListaAsistencia = () => {
    const { register, handleSubmit, watch, reset } = useForm();
    const tipo = watch('tipo');
    const [filtro, setFiltro] = useState('');

    const { data: usuariosData } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => fetchWithToken('/perfiles/')
    });

    const { data: citacionesData } = useQuery({
        queryKey: ['citaciones'],
        queryFn: () => fetchWithToken('/citaciones/disponibles/')
    });

    const mutation = useMutation({
        mutationFn: (data) => fetchWithToken('/listas-asistencia/', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            toast.success('Lista creada correctamente')
            reset();
        },
        onError: () => toast.error('Error al crear lista')
    });

    const handleForm = async (form) => {
        const payload = { bomberos: form.bomberos || [] };

        if (form.tipo === 'emergencia') {
            const emergencia = await fetchWithToken('/emergencias/', {
                method: 'POST',
                body: JSON.stringify({
                    clave: form.clave,
                    fecha: form.fecha,
                    unidades: form.unidades,
                    is_declarado: form.is_declarado
                })
            });
            payload.content_type = 'emergencia';
            payload.object_id = emergencia.id;
        } else if (form.tipo === 'citacion') {
            payload.content_type = 'citacion';
            payload.object_id = form.citacion_id;
        }
        mutation.mutate(payload);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Crear Lista</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Generar nueva lista de asistencia</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(handleForm)} className="space-y-6">
                    <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Info size={18} className="text-red-600" />
                            <span>Información Básica</span>
                        </h3>
                        
                        <div className="max-w-md">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1 uppercase tracking-wider">
                                Tipo de Lista
                            </label>
                            <select 
                                {...register('tipo')} 
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 dark:text-slate-200 transition-all appearance-none"
                            >
                                <option value="">Seleccione un tipo...</option>
                                <option value="citacion">Citación</option>
                                <option value="emergencia">Emergencia</option>
                            </select>
                            <p className="mt-2 text-xs text-slate-400 px-1 italic">
                                Seleccione si la lista corresponde a una citación programada o una emergencia.
                            </p>
                        </div>
                    </div>

                    {tipo && (
                        <div className="animate-in slide-in-from-top-4 duration-300 space-y-6">
                            <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                                    <span>Detalles del Evento</span>
                                </h3>
                                
                                {tipo === 'citacion' && (
                                    <CitacionSelector citaciones={citacionesData} register={register} />
                                )}

                                {tipo === 'emergencia' && (
                                    <EmergenciaForm register={register} />
                                )}
                            </div>

                            <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <Users size={20} className="text-red-600" />
                                    <span>Selección de Personal</span>
                                </h3>
                                
                                <BomberoSelector
                                    usuarios={usuariosData}
                                    filtro={filtro}
                                    onFiltroChange={setFiltro}
                                    register={register}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50" 
                                    type="submit" 
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <RefreshCw size={20} className="animate-spin" />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    <span>{mutation.isPending ? 'Guardando...' : 'Crear Lista de Asistencia'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!tipo && (
                        <div className="bg-slate-50 dark:!bg-slate-900/50 p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:!bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h4 className="text-slate-600 dark:text-slate-300 font-bold">Seleccione el tipo para continuar</h4>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs">
                                Debe elegir entre Citación o Emergencia para cargar el formulario correspondiente.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
};

export default CrearListaAsistencia;
