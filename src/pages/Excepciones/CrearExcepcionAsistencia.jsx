import { useForm } from 'react-hook-form';
import { useBomberos } from '../../hooks/useBomberos';
import { useCrearExcepcionAsistencia } from '../../hooks/useCrearExcepcionAsistencia';
import { useTiposExcepcionAsistencia } from '../../hooks/useTiposExcepcionAsistencia';
import { useExcepcionesAsistencia } from '../../hooks/useExcepcionesAsistencia';
import { useEliminarExcepcionAsistencia } from '../../hooks/useEliminarExcepcionAsistencia';
import { useEditarExcepcionAsistencia } from '../../hooks/useEditarExcepcionAsistencia';
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    Loader2, 
    Eye, 
    Edit, 
    Trash2, 
    ShieldAlert, 
    Calendar, 
    User, 
    Search, 
    FileText, 
    X, 
    AlertCircle, 
    CheckCircle2,
    Clock,
    PlusCircle,
    Info
} from 'lucide-react';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';
import Tabla from '../../components/Tabla';

const CrearExcepcionAsistencia = () => {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
    const { data: bomberos, isLoading: loadingBomberos } = useBomberos();
    const { data: tiposExcepcion, isLoading: loadingTipos } = useTiposExcepcionAsistencia();
    const { data: excepciones, isLoading: loadingExcepciones } = useExcepcionesAsistencia();
    const { mutate: crearExcepcion, isLoading: isCreating } = useCrearExcepcionAsistencia();
    const { mutate: eliminarExcepcion, isLoading: isDeleting } = useEliminarExcepcionAsistencia();
    const { mutate: editarExcepcion, isLoading: isEditing } = useEditarExcepcionAsistencia();
    
    const [search, setSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showModalDetalle, setShowModalDetalle] = useState(false);
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [excepcionSeleccionada, setExcepcionSeleccionada] = useState(null);
    const [fechaInicioEdicion, setFechaInicioEdicion] = useState('');
    const [fechaFinEdicion, setFechaFinEdicion] = useState('');

    const bomberoSeleccionado = watch('usuario');

    const onSubmit = (data) => {
        if (!data.usuario) {
            toast.error('Selecciona un bombero para la excepción');
            return;
        }
        crearExcepcion(data, {
            onSuccess: () => {
                toast.success('Excepción de asistencia creada correctamente');
                reset();
                setSearch('');
                setShowSuggestions(false);
            },
            onError: () => {
                toast.error('Error al crear la excepción de asistencia');
            },
        });
    };

    const handleVerDetalle = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setShowModalDetalle(true);
    };

    const handleEditar = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setFechaInicioEdicion(excepcion.fecha_inicio.split('T')[0]);
        setFechaFinEdicion(excepcion.fecha_fin.split('T')[0]);
        setShowModalEditar(true);
    };

    const handleEliminar = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setShowModalEliminar(true);
    };

    const confirmarEliminar = () => {
        eliminarExcepcion(excepcionSeleccionada.id, {
            onSuccess: () => {
                toast.success('Excepción eliminada correctamente');
                setShowModalEliminar(false);
                setExcepcionSeleccionada(null);
            },
            onError: () => {
                toast.error('Error al eliminar la excepción');
            },
        });
    };

    const confirmarEditar = () => {
        editarExcepcion(
            {
                id: excepcionSeleccionada.id,
                data: {
                    fecha_inicio: fechaInicioEdicion,
                    fecha_fin: fechaFinEdicion,
                },
            },
            {
                onSuccess: () => {
                    toast.success('Excepción actualizada correctamente');
                    setShowModalEditar(false);
                    setExcepcionSeleccionada(null);
                },
                onError: () => {
                    toast.error('Error al actualizar la excepción');
                },
            }
        );
    };

    const filtrados = useMemo(() => {
        if (!search) return [];
        return bomberos?.filter(b =>
            `${b.user.first_name} ${b.user.last_name}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [bomberos, search]);

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: info => <span className="font-mono text-xs text-slate-500">#{info.getValue()}</span>
        },
        {
            header: 'Bombero',
            accessorFn: row => `${row.bombero.first_name} ${row.bombero.last_name}`,
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{info.getValue()}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{info.row.original.bombero.username}</p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'tipo_excepcion',
            header: 'Tipo',
            cell: info => (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    {info.getValue()}
                </span>
            )
        },
        {
            accessorKey: 'is_activa',
            header: 'Estado',
            cell: info => (
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${info.getValue() 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                `}>
                    {info.getValue() ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {info.getValue() ? 'Activa' : 'Expirada'}
                </span>
            )
        },
        {
            accessorKey: 'fecha_fin',
            header: 'Finaliza',
            cell: info => (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                    <Calendar size={12} />
                    <span>{new Date(info.getValue()).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-all"
                        onClick={() => handleVerDetalle(row.original)}
                        title="Ver detalle"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 transition-all"
                        onClick={() => handleEditar(row.original)}
                        title="Editar"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-all"
                        onClick={() => handleEliminar(row.original)}
                        title="Eliminar"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:!bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm shadow-blue-100 dark:shadow-none">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Excepciones de Asistencia
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                                Gestiona los permisos especiales y ausencias justificadas a largo plazo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
                >
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tipo de Excepción *</label>
                                {loadingTipos ? (
                                    <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
                                ) : (
                                    <select
                                        className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none appearance-none cursor-pointer"
                                        {...register('tipo_excepcion', { required: true })}
                                        required
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {tiposExcepcion?.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500" /> Fecha de Inicio *
                                </label>
                                <input
                                    className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none"
                                    type="date"
                                    {...register('fecha_inicio', { required: true })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <Calendar size={14} className="text-red-500" /> Fecha de Fin *
                                </label>
                                <input
                                    className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none"
                                    type="date"
                                    {...register('fecha_fin', { required: true })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Search size={14} className="text-blue-500" /> Bombero *
                            </label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 pl-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none"
                                    type="text"
                                    placeholder="Buscar por nombre o apellido..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            </div>

                            {showSuggestions && search && (
                                <div className="absolute z-10 w-full mt-2 !bg-white dark:!bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                        {loadingBomberos ? (
                                            <div className="p-4 flex items-center justify-center text-slate-400 gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span className="text-xs font-bold">Cargando bomberos...</span>
                                            </div>
                                        ) : filtrados?.length > 0 ? (
                                            filtrados.map((bombero) => (
                                                <button
                                                    key={bombero.id}
                                                    type="button"
                                                    className={`
                                                        w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-3
                                                        ${bomberoSeleccionado === bombero.user.id 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}
                                                    `}
                                                    onClick={() => {
                                                        setValue('usuario', bombero.user.id);
                                                        setSearch(`${bombero.user.first_name} ${bombero.user.last_name}`);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                                        {bombero.user.first_name[0]}{bombero.user.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{bombero.user.first_name} {bombero.user.last_name}</p>
                                                        <p className="text-[10px] opacity-60 uppercase tracking-widest">{bombero.user.username}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-5 text-center text-slate-500 italic text-sm">No se encontraron bomberos</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <input type="hidden" {...register('usuario', { required: true })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" /> Motivo detallado *
                            </label>
                            <textarea
                                className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none min-h-[120px]"
                                {...register('motivo', { required: true })}
                                placeholder="Indique la razón médica, laboral o personal de la excepción..."
                                rows={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-6 bg-slate-50 dark:!bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 italic">
                            <Info size={14} /> Los cambios afectarán el cálculo de asistencia anual del voluntario.
                        </p>
                        <button 
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-none transform active:scale-95 disabled:opacity-50" 
                            type="submit" 
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={20} />
                                    <span>Registrar Excepción</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Exceptions List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">Excepciones Registradas</h3>
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 transition-colors duration-300">
                        {loadingExcepciones ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
                                <p className="text-sm font-medium">Cargando historial...</p>
                            </div>
                        ) : excepciones && excepciones.length > 0 ? (
                            <Tabla data={excepciones} columns={columns} pageSize={10} />
                        ) : (
                            <div className="py-20 text-center text-slate-500 italic">No hay excepciones de asistencia registradas.</div>
                        )}
                    </div>
                </div>

                {/* Modal Ver Detalle */}
                {showModalDetalle && excepcionSeleccionada && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModalDetalle(false)}>
                        <div className="bg-white dark:!bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Excepción #{excepcionSeleccionada.id}</h5>
                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" onClick={() => setShowModalDetalle(false)}><X size={24}/></button>
                            </div>
                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</p>
                                        <p className="text-slate-900 dark:text-white font-bold">{excepcionSeleccionada.tipo_excepcion}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bombero</p>
                                        <p className="text-slate-900 dark:text-white font-bold">{excepcionSeleccionada.bombero.username} — {excepcionSeleccionada.bombero.first_name} {excepcionSeleccionada.bombero.last_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</p>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold"><Calendar size={16} className="text-blue-500"/> {new Date(excepcionSeleccionada.fecha_inicio).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</p>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold"><Calendar size={16} className="text-red-500"/> {new Date(excepcionSeleccionada.fecha_fin).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${excepcionSeleccionada.is_activa ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                            {excepcionSeleccionada.is_activa ? 'Activa' : 'Expirada'}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{excepcionSeleccionada.autor_username}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 p-6 bg-slate-50 dark:!bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText size={14}/> Motivo</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{excepcionSeleccionada.motivo}"</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:!bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button className="px-8 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-bold" onClick={() => setShowModalDetalle(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Modal Editar */}
                {showModalEditar && excepcionSeleccionada && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModalEditar(false)}>
                        <div className="bg-white dark:!bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Editar Vigencia</h5>
                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" onClick={() => setShowModalEditar(false)}><X size={24}/></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de Inicio</label>
                                    <input type="date" className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={fechaInicioEdicion} onChange={(e) => setFechaInicioEdicion(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de Fin</label>
                                    <input type="date" className="w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={fechaFinEdicion} onChange={(e) => setFechaFinEdicion(e.target.value)} />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:!bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowModalEditar(false)}>Cancelar</button>
                                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2" onClick={confirmarEditar} disabled={isEditing}>
                                    {isEditing ? <Loader2 className="animate-spin" size={18}/> : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Modal Eliminar */}
                {showModalEliminar && excepcionSeleccionada && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModalEliminar(false)}>
                        <div className="bg-white dark:!bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                            <div className="p-8 text-center space-y-6">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                                    <AlertCircle size={32}/>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">¿Eliminar registro?</h5>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Esta acción es irreversible. Se eliminará la excepción para el bombero <span className="font-bold text-slate-700 dark:text-slate-200">{excepcionSeleccionada.bombero.first_name}</span>.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:!bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowModalEliminar(false)}>Cancelar</button>
                                <button className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2" onClick={confirmarEliminar} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="animate-spin" size={18}/> : 'Sí, eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </Layout>
    );
};

export default CrearExcepcionAsistencia;
