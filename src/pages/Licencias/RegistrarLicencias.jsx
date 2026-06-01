import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/useAuthStore';
import { fetchWithToken } from '../../api/fetchWithToken';
import { toast } from 'react-toastify';
import { useLicenciaExistente } from '../../hooks/useLicenciaExistente';
import Layout from '../../layout/Layout';
import { ClipboardEdit, AlertCircle, Info, CalendarClock, Send } from 'lucide-react';

const RegistrarLicencia = () => {
    const { id: citacionId } = useParams();
    const userId = useAuthStore((s) => s.user?.id);
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const { data, isLoading } = useLicenciaExistente(userId, citacionId);
    const licenciaYaExiste = data?.length > 0;

    const {
        data: citacion,
        isLoading: isLoadingCitacion,
        isError: isErrorCitacion,
        error: errorCitacion,
    } = useQuery({
        queryKey: ['citacion', citacionId],
        queryFn: () => fetchWithToken(`/citaciones/${citacionId}/`),
        enabled: !!citacionId,
    });

    const fechaCitacion = citacion?.fecha ? new Date(citacion.fecha) : null;
    const fechaCitacionValida = !!fechaCitacion && !Number.isNaN(fechaCitacion.getTime());
    const ahora = new Date();
    const horasParaCitacion = fechaCitacionValida
        ? (fechaCitacion.getTime() - ahora.getTime()) / (1000 * 60 * 60)
        : null;
    const fueraDePlazo = fechaCitacionValida ? horasParaCitacion < 24 : false;

    const onSubmit = async (formData) => {
        if (fueraDePlazo) {
            toast.error('Fuera de plazo: la citación es en menos de 24 horas.');
            return;
        }
        try {
            await fetchWithToken('/licencias/', {
                method: 'POST',
                body: JSON.stringify({
                    motivo: formData.motivo,
                    autor: userId,
                    citacion: citacionId,
                }),
            });
            toast.success('Licencia registrada');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Error al registrar la licencia');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-red-50 dark:!bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                            <ClipboardEdit size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registrar Licencia</h2>
                            <p className="text-slate-500 dark:text-slate-400">Completa el motivo de tu ausencia</p>
                        </div>
                    </div>

                    {isLoading || isLoadingCitacion ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando información...</p>
                        </div>
                    ) : isErrorCitacion ? (
                        <div className="flex items-start gap-4 p-4 bg-red-50 dark:!bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm font-medium">{errorCitacion?.message || 'No se pudo obtener la citación.'}</p>
                        </div>
                    ) : licenciaYaExiste ? (
                        <div className="flex items-start gap-4 p-4 bg-blue-50 dark:!bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <Info className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm font-medium">Ya registraste una licencia para esta citación.</p>
                        </div>
                    ) : fueraDePlazo ? (
                        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:!bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <CalendarClock className="shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-bold">Fuera de plazo</p>
                                <p className="text-sm">La citación es en menos de 24 horas. No se pueden registrar licencias.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {citacion && (
                                <div className="p-4 bg-slate-50 dark:!bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Para la citación:</p>
                                    <p className="text-slate-700 dark:text-slate-200 font-bold">{citacion.nombre}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(citacion.fecha).toLocaleString()}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Motivo de la licencia
                                </label>
                                <textarea
                                    {...register('motivo')}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                                    rows={5}
                                    placeholder="Explica brevemente por qué no puedes asistir..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-600/20 transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Enviar licencia
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RegistrarLicencia;
