import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import MesesSelector from '../../components/MesesSelector';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore.js';
import { Upload, FileText, CheckCircle2, AlertCircle, Send, Calendar, RefreshCw } from 'lucide-react';

const BomberoSubirComprobante = () => {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const mutation = useMutation({
        mutationFn: (formData) => fetchWithToken('/comprobantes/transferencia/', {
            method: 'POST',
            body: formData
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-transferencia']);
            toast.success('Comprobante enviado correctamente')
            reset();
        }
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('archivo', data.archivo[0]);
        data.meses_pagados.forEach(id => formData.append('meses_pagados', id));
        mutation.mutate(formData);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
                <div className="!bg-white dark:!bg-slate-800 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-5 sm:p-8 md:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-10">
                        <div className="p-3 sm:p-4 bg-red-50 dark:!bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 w-fit">
                            <Upload size={28} className="sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Subir Comprobante</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Registra tu transferencia bancaria</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10">
                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <FileText size={18} className="text-red-600" /> Archivo del comprobante
                            </label>
                            <div className={`relative group border-2 border-dashed rounded-2xl sm:rounded-[2rem] transition-all duration-200 ${
                                errors.archivo 
                                    ? 'border-red-300 bg-red-50/50 dark:border-red-900/30 dark:!bg-red-900/10' 
                                    : 'border-slate-200 hover:border-red-400 bg-slate-50 dark:border-slate-700 dark:!bg-slate-900/50'
                            }`}>
                                <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                                    <Upload size={40} className={`mb-4 transition-colors sm:w-12 sm:h-12 ${errors.archivo ? 'text-red-400' : 'text-slate-400 group-hover:text-red-500'}`} />
                                    <p className="text-slate-600 dark:text-slate-300 font-bold mb-1 text-sm sm:text-base">
                                        Haz clic para seleccionar o arrastra el archivo
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                                        PDF, JPG o PNG (Máx. 10MB)
                                    </p>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        accept="application/pdf,image/*" 
                                        {...register('archivo', { required: true })} 
                                    />
                                </div>
                            </div>
                            {errors.archivo && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold ml-1">
                                    <AlertCircle size={16} />
                                    <span>Debes subir un archivo para continuar</span>
                                </div>
                            )}
                        </div>

                        {/* Month Selector Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Calendar size={18} className="text-red-600" /> Meses a pagar
                            </label>
                            <div className="bg-slate-50 dark:!bg-slate-900/50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 dark:border-slate-700">
                                <Controller
                                    name="meses_pagados"
                                    control={control}
                                    defaultValue={[]}
                                    rules={{ validate: v => v.length > 0 || 'Selecciona al menos un mes' }}
                                    render={({ field, fieldState }) => (
                                        <MesesSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error}
                                            bomberoId={user.id}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] ${
                                mutation.isPending
                                    ? 'bg-slate-100 text-slate-400 dark:!bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                            }`}
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <RefreshCw size={24} className="animate-spin" />
                                    Enviando comprobante...
                                </>
                            ) : (
                                <>
                                    <Send size={24} />
                                    Enviar Comprobante
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default BomberoSubirComprobante;
