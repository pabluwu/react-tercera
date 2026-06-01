import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Eye, ClipboardList, RefreshCw, Calendar, Flame, Bookmark } from 'lucide-react';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';

const ListasAsistencia = () => {
    const { data = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['listas-asistencia'],
        queryFn: () => fetchWithToken('/listas-asistencia/'),
    });

    const columns = [
        {
            header: 'Tipo',
            accessorFn: (row) => row.tipo,
            cell: (info) => {
                const tipo = info.getValue();
                const isEmergencia = tipo.toLowerCase() === 'emergencia';
                return (
                    <div className="flex items-center gap-2">
                        {isEmergencia ? (
                            <Flame size={14} className="text-red-500" />
                        ) : (
                            <Bookmark size={14} className="text-blue-500" />
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            isEmergencia ? 'bg-red-50 text-red-600 dark:!bg-red-500/10 dark:text-red-500' : 'bg-blue-50 text-blue-600 dark:!bg-blue-500/10 dark:text-blue-500'
                        }`}>
                            {tipo}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Evento',
            accessorFn: (row) => row.evento.nombre || row.evento.clave || 'Sin información',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{info.getValue()}</span>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{info.row.original.evento.id}</span>
                </div>
            )
        },
        {
            header: 'Creada',
            accessorFn: (row) => row.fecha_creacion,
            cell: (info) => (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={14} />
                    <span className="text-sm">{format(new Date(info.getValue()), 'dd-MM-yyyy HH:mm')}</span>
                </div>
            )
        },
        {
            header: 'Asistentes',
            accessorFn: (row) => row.asistencias?.length || 0,
            cell: (info) => (
                <span className="px-2.5 py-1 bg-slate-100 dark:!bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold">
                    {info.getValue()}
                </span>
            )
        },
        {
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Link
                        to={`/lista/${row.original.id}`}
                        className="flex items-center gap-2 px-4 py-1.5 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"
                    >
                        <Eye size={16} />
                        <span>Detalles</span>
                    </Link>
                </div>
            ),
        }
    ];

    return (
        <Layout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:!bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Listas de Asistencia</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Gestión y visualización de registros históricos</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:!bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
                            onClick={() => refetch()}
                            disabled={isLoading || isFetching}
                        >
                            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                            <span>Actualizar</span>
                        </button>
                        <Link 
                            to="/lista/crear" 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-all active:scale-95 shadow-sm shadow-red-200 dark:shadow-none"
                        >
                            <span>Nueva Lista</span>
                        </Link>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <RefreshCw size={32} className="animate-spin mb-4" />
                            <p className="font-medium">Cargando registros...</p>
                        </div>
                    ) : (
                        <Tabla data={data} columns={columns} pageSize={10} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ListasAsistencia;
