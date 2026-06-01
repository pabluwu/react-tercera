import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format } from 'date-fns';
import Layout from '../../layout/Layout';
import { ClipboardList, Calendar, MapPin, Tag, UserCheck, UserX, AlertCircle, Info, Bookmark, Flame, Clock, Hash } from 'lucide-react';

const DetalleListaAsistencia = () => {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['lista-asistencia', id],
        queryFn: () => fetchWithToken(`/listas-asistencia/${id}/`),
    });

    if (isLoading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Hash size={32} className="animate-spin mb-4" />
                <p className="font-medium">Cargando detalles de la lista...</p>
            </div>
        </Layout>
    );

    if (error || !data) return (
        <Layout>
            <div className="max-w-4xl mx-auto p-8 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4 mt-8">
                <AlertCircle size={24} />
                <span className="font-medium">Error al cargar los datos de la lista de asistencia.</span>
            </div>
        </Layout>
    );

    const { evento, tipo, fecha_creacion, asistencias, licencias, excepciones, total_excepciones } = data;

    const renderEventoDetalle = () => {
        if (tipo === 'citacion' || tipo === 'Licencia Extendida') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Nombre</p>
                            <p className="text-slate-800 dark:text-white font-bold text-lg">{evento.nombre}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Descripción</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{evento.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500"><MapPin size={16} /></div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lugar</p>
                                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{evento.lugar}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500"><Tag size={16} /></div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenida</p>
                                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{evento.tenida}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500"><Calendar size={16} /></div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</p>
                                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{format(new Date(evento.fecha), 'dd-MM-yyyy HH:mm')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'emergencia') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg"><Flame size={18} /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clave</p>
                            <p className="text-red-600 dark:text-red-500 text-xl font-black">{evento.clave}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500"><Tag size={18} /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidades</p>
                            <p className="text-slate-700 dark:text-slate-200 text-lg font-bold">{evento.unidades}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500"><Calendar size={18} /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</p>
                            <p className="text-slate-700 dark:text-slate-200 text-lg font-bold">{format(new Date(evento.fecha), 'dd-MM-yyyy HH:mm')}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getTipoLabel = () => {
        if (tipo === 'citacion') return 'Citación';
        if (tipo === 'emergencia') return 'Emergencia';
        if (tipo === 'Licencia Extendida') return 'Licencia Extendida';
        return tipo;
    };

    const isEmergencia = tipo === 'emergencia';

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:!bg-slate-800 text-slate-500 flex items-center justify-center font-mono font-bold">
                            #{id}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Detalle de Lista</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                    isEmergencia ? 'bg-red-50 text-red-600 dark:!bg-red-500/10' : 'bg-blue-50 text-blue-600 dark:!bg-blue-500/10'
                                }`}>
                                    {getTipoLabel()}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1 italic">
                                    <Clock size={12} /> Creada el {format(new Date(fecha_creacion), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                        <Info size={20} className="text-red-600" />
                        <span>Información del Evento</span>
                    </h3>
                    {renderEventoDetalle()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl">
                                <UserCheck size={20} />
                            </div>
                            <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Asistentes</h5>
                            <span className="ml-auto bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-black px-2 py-1 rounded-lg">
                                {asistencias?.length || 0}
                            </span>
                        </div>
                        <div className="flex-1 p-2">
                            {asistencias?.length > 0 ? (
                                <div className="space-y-1">
                                    {asistencias.map((a) => (
                                        <div key={a.bombero_id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                                {`${a.first_name} ${a.last_name}`}
                                            </span>
                                            {a.hora_llegada && (
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:!bg-slate-800 px-2 py-1 rounded-lg">
                                                    Llegó {format(new Date(a.hora_llegada), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400 italic">No hay asistentes registrados</div>
                            )}
                        </div>
                    </div>

                    {tipo === 'citacion' && (
                        <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-xl">
                                    <ClipboardList size={20} />
                                </div>
                                <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Licencias</h5>
                                <span className="ml-auto bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 text-xs font-black px-2 py-1 rounded-lg">
                                    {licencias?.length || 0}
                                </span>
                            </div>
                            <div className="flex-1 p-2">
                                {licencias?.length > 0 ? (
                                    <div className="space-y-1">
                                        {licencias.map((l, i) => (
                                            <div key={i} className="flex flex-col p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{`${l.first_name} ${l.last_name}`}</span>
                                                <span className="text-xs text-slate-400 italic mt-0.5">{l.motivo}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 italic">No hay licencias registradas</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {excepciones && total_excepciones > 0 && (
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:!bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl">
                                <AlertCircle size={20} />
                            </div>
                            <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Excepciones</h5>
                            <span className="ml-auto bg-amber-50 dark:!bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-black px-2 py-1 rounded-lg">
                                {total_excepciones}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {Object.entries(excepciones).map(([tipoExcepcion, bomberos]) => (
                                    <div key={tipoExcepcion} className="space-y-4">
                                        <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{tipoExcepcion}</h6>
                                        <div className="space-y-2">
                                            {bomberos.map((b) => (
                                                <div key={b.bombero_id} className="p-4 rounded-2xl bg-slate-50 dark:!bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">
                                                        {`${b.first_name} ${b.last_name}`}
                                                    </div>
                                                    <div className="text-xs text-red-600 dark:text-red-500 font-medium mt-1">
                                                        {b.motivo}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-wider">
                                                        <Calendar size={10} />
                                                        {format(new Date(b.fecha_inicio), 'dd/MM/yyyy')} — {format(new Date(b.fecha_fin), 'dd/MM/yyyy')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DetalleListaAsistencia;
