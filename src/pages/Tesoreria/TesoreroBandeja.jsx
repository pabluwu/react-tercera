import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';
import { Inbox, FileText, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink, DollarSign, Hash, Send, Clock, User } from 'lucide-react';

const BandejaItem = ({ item, onAprobar, onRechazar }) => {
    const [showForm, setShowForm] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleAprobar = (data) => {
        onAprobar(item.id, {
            numero_comprobante: data.numero_comprobante,
            monto_total: data.monto_total,
        });
    };

    return (
        <div className="!bg-white dark:!bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none mb-6 overflow-hidden transition-all duration-300">
            <div className="p-5 md:p-8 flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-red-50 dark:!bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <User size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-1 leading-tight">{item.bombero.nombre}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold">
                            <span className="flex items-center gap-1.5 bg-slate-100 dark:!bg-slate-800 px-3 py-1 rounded-full">
                                <Clock size={12} className="md:w-3.5 md:h-3.5" /> {new Date(item.fecha_envio).toLocaleDateString()}
                            </span>
                            <a 
                                href={item.archivo} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
                            >
                                <ExternalLink size={12} className="md:w-3.5 md:h-3.5" /> Ver Comprobante
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button 
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 ${
                            showForm 
                                ? 'bg-slate-100 text-slate-500 dark:!bg-slate-800 dark:text-slate-400' 
                                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
                        }`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <><ChevronUp size={18} /> Cancelar</> : <><CheckCircle2 size={18} /> Aprobar</>}
                    </button>
                    <button 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 !bg-white dark:!bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-black text-sm border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/30 transition-all"
                        onClick={() => onRechazar(item.id)}
                    >
                        <XCircle size={18} /> Rechazar
                    </button>
                </div>
            </div>

            <div className="px-5 md:px-8 pb-6 md:pb-8 space-y-4">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-red-600" /> Meses Declarados
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {item.meses_pagados_detalle.map(m => (
                            <span key={`${m.mes}-${m.anio}`} className="px-3 sm:px-4 py-1.5 bg-slate-50 dark:!bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] sm:text-xs font-black border border-slate-100 dark:border-slate-700">
                                {m.mes} {m.anio}
                            </span>
                        ))}
                    </div>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit(handleAprobar)} className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-end animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Hash size={16} className="text-red-600" /> Nº Comprobante
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" 
                                placeholder="Ej: 12345678"
                                {...register('numero_comprobante', { required: true })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <DollarSign size={16} className="text-red-600" /> Monto Total ($)
                            </label>
                            <input 
                                type="number" 
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" 
                                placeholder="0.00"
                                {...register('monto_total', { required: true })} 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-slate-800 dark:!bg-white text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-slate-100 font-black py-4 rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Send size={20} /> Confirmar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const TesoreroBandeja = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['comprobantes-pendientes'],
        queryFn: () => fetchWithToken('/comprobantes/transferencia/pendientes/')
    });

    const aprobar = useMutation({
        mutationFn: ({ id, data }) => fetchWithToken(`/comprobantes/transferencia/${id}/aprobar/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-pendientes']);
            toast.success('Comprobante aprobado correctamente');
        }
    });

    const rechazar = useMutation({
        mutationFn: (id) => fetchWithToken(`/comprobantes/transferencia/${id}/rechazar/`, {
            method: 'PATCH',
            body: JSON.stringify({ observacion: 'Rechazado por la tesorería' })
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-pendientes']);
            toast.info('Comprobante rechazado');
        }
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-10">
                    <div className="p-2.5 sm:p-3 bg-red-50 dark:!bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 w-fit">
                        <Inbox size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Bandeja de Entrada</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Comprobantes pendientes de revisión</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="!bg-white dark:!bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl p-12 md:p-20 text-center border border-slate-100 dark:border-slate-700">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-red-600 border-t-transparent mb-4 md:mb-6"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-black text-lg md:text-xl tracking-tight">Cargando bandeja...</p>
                    </div>
                ) : data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 md:p-20 !bg-white dark:!bg-slate-800 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-center">
                        <Inbox className="text-slate-200 dark:text-slate-700 mb-6 w-16 h-16 md:w-20 md:h-20" size={80} />
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Bandeja Vacía</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm md:text-base">No hay comprobantes de transferencia pendientes de aprobación en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {data?.map(item => (
                            <BandejaItem
                                key={item.id}
                                item={item}
                                onAprobar={(id, data) => aprobar.mutate({ id, data })}
                                onRechazar={(id) => rechazar.mutate(id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};


export default TesoreroBandeja;
