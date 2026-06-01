// src/views/TesoreraRegistrarComprobante.jsx
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import MesesSelector from '../../components/MesesSelector';
import { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';
import { ClipboardList, Search, User, DollarSign, CreditCard, Send, Loader2 } from 'lucide-react';

const TesoreraRegistrarComprobante = () => {
    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm();
    const queryClient = useQueryClient();
    const [usuarios, setUsuarios] = useState([]);

    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchWithToken('/perfiles/').then(setUsuarios);
    }, []);

    useEffect(() => {
        if (search.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const filtered = usuarios.filter((u) =>
            `${u.user.first_name} ${u.user.last_name}`.toLowerCase().includes(search.toLowerCase())
        );
        setSuggestions(filtered);
    }, [search, usuarios]);

    const mutation = useMutation({
        mutationFn: (data) => fetchWithToken('/comprobantes/tesorero/', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-tesorero']);
            toast.success('Comprobante enviado correctamente')
            reset();
            setSearch('');
            setSelectedId('');
        }
    });

    const onSubmit = (data) => {
        mutation.mutate({
            ...data,
            meses_pagados: data.meses_pagados,
            monto_total: Number(data.monto_total),
        });
    };
    
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-10 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                            <ClipboardList size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registrar Comprobante</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Ingreso manual de pagos de cuotas</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <ClipboardList size={16} /> Nº de Comprobante
                                </label>
                                <input 
                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.numero_comprobante ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                    placeholder="Ej: 12345"
                                    {...register('numero_comprobante', { required: true })} 
                                />
                                {errors.numero_comprobante && <p className="text-xs text-red-500 ml-1">Este campo es obligatorio</p>}
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <User size={16} /> Bombero
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.bombero ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                        placeholder="Buscar por nombre o apellido"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                    />
                                </div>
                                
                                {errors.bombero && <p className="text-xs text-red-500 ml-1">Selecciona un bombero de la lista</p>}

                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 !bg-white dark:!bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-slate-50 dark:divide-slate-700">
                                        {suggestions.map((u) => (
                                            <button
                                                key={u.user.id}
                                                type="button"
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col"
                                                onClick={() => {
                                                    setSelectedId(u.user.id);
                                                    setSearch(`${u.user.first_name} ${u.user.last_name}`);
                                                    setSuggestions([]);
                                                    setValue('bombero', u.user.id, { shouldValidate: true });
                                                }}
                                            >
                                                <span className="font-semibold text-slate-700 dark:text-white">{u.user.first_name} {u.user.last_name}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{u.user.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
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
                                        bomberoId={watch('bombero')}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <DollarSign size={16} /> Monto Total
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        className={`w-full pl-8 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.monto_total ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                        placeholder="0.00"
                                        {...register('monto_total', { required: true })} 
                                    />
                                </div>
                                {errors.monto_total && <p className="text-xs text-red-500 ml-1">Este campo es obligatorio</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <CreditCard size={16} /> Método de Pago
                                </label>
                                <select 
                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${errors.metodo_pago ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                    {...register('metodo_pago', { required: true })}
                                >
                                    <option value="">Seleccionar método</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                </select>
                                {errors.metodo_pago && <p className="text-xs text-red-500 ml-1">Selecciona un método</p>}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={mutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 group"
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Registrar Comprobante
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

export default TesoreraRegistrarComprobante;
