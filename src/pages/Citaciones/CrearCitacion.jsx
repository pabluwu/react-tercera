import { useForm } from 'react-hook-form';
import { usePerfiles } from '../../hooks/usePerfiles';
import { useResponsables } from '../../hooks/useResponsables';
import { useCrearCitacion } from '../../hooks/useCrearCitacion';
import { useState, useEffect } from 'react';
import { Loader2, PlusCircle, ArrowLeft, Calendar, MapPin, Shirt, Info, Search, User, ShieldCheck } from 'lucide-react';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';

const CrearCitacion = () => {
    const user = useAuthStore(state => state.user);
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
    const { data: perfiles } = usePerfiles();
    const { data: responsables, isLoading: loadingResponsables } = useResponsables();
    const { mutate, isPending } = useCrearCitacion();

    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (user) {
            setValue('autor', user.id);
            setSearchTerm(`${user.first_name} ${user.last_name}`);
        }
    }, [user, setValue]);

    const filteredPerfiles = (perfiles || []).filter((p) => {
        const full = `${p.user.first_name} ${p.user.last_name} ${p.user.username}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const onSubmit = (data) => {
        mutate(data, {
            onSuccess: () => {
                toast.success('Citación publicada correctamente');
                reset();
                if (user) {
                    setValue('autor', user.id);
                    setSearchTerm(`${user.first_name} ${user.last_name}`);
                }
                setShowSuggestions(false);
            },
            onError: (error) => {
                toast.error(error?.message || 'Error al publicar la citación');
            }
        });
    };

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link to="/citaciones/list" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors mb-2">
                            <ArrowLeft size={16} /> Volver a citaciones
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Crear Nueva Citación
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Ingresa los detalles para convocar al personal.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 transition-all duration-300">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Título de la Citación *</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none" 
                                        placeholder="Ej: Ejercicio Doctrinal Mensual"
                                        {...register('nombre', { required: true })} 
                                    />
                                    {errors.nombre && <p className="text-xs font-bold text-red-500 pl-1">El título es requerido</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                            <Calendar size={14} className="text-red-500" /> Fecha y Hora *
                                        </label>
                                        <input 
                                            type="datetime-local" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none" 
                                            {...register('fecha', { required: true })} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-red-500" /> Lugar *
                                        </label>
                                        <input 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none" 
                                            placeholder="Cuartel General, Plaza, etc."
                                            {...register('lugar', { required: true })} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Shirt size={14} className="text-red-500" /> Tenida / Uniforme *
                                    </label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none" 
                                        placeholder="Ej: Tenida N°1 (Parada)"
                                        {...register('tenida', { required: true })} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Info size={14} className="text-red-500" /> Descripción y Objetivos
                                    </label>
                                    <textarea 
                                        rows="4"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none min-h-[120px]" 
                                        placeholder="Detalla los puntos a tratar en la citación..."
                                        {...register('descripcion')} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Secondary Details */}
                    <div className="space-y-6">
                        <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-all duration-300">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-red-500" /> Responsable *
                                    </label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none appearance-none"
                                        {...register('responsable', { required: true })}
                                        disabled={loadingResponsables}
                                    >
                                        <option value="">Seleccione un cargo...</option>
                                        {responsables?.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                    {errors.responsable && <p className="text-xs font-bold text-red-500 pl-1">El responsable es requerido</p>}
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Search size={14} className="text-red-500" /> Autor / Quien cita *
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none" 
                                            placeholder="Buscar bombero..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                    
                                    {showSuggestions && searchTerm.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 !bg-white dark:!bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {filteredPerfiles.length > 0 ? (
                                                    filteredPerfiles.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                                                            onClick={() => {
                                                                setValue('autor', p.user.id);
                                                                setSearchTerm(`${p.user.first_name} ${p.user.last_name}`);
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold">
                                                                {p.user.first_name[0]}
                                                            </div>
                                                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                                                                {p.user.first_name} {p.user.last_name}
                                                            </span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-slate-500 italic">No se encontraron resultados</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {errors.autor && <p className="text-xs font-bold text-red-500 pl-1">El autor es requerido</p>}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                                <button 
                                    type="submit" 
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-red-200 dark:shadow-none transform active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Creando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle size={20} />
                                            <span>Publicar Citación</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-3xl border border-amber-100 dark:border-amber-900/20 p-6">
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2 text-sm">
                                <Info size={16} /> Recordatorio
                            </h4>
                            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed italic">
                                Una vez publicada, la citación será visible para todo el personal y podrán solicitar licencias hasta 24 horas antes del inicio.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CrearCitacion;
