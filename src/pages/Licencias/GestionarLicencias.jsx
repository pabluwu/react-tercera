import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, ChevronRight, RefreshCw, Hash } from 'lucide-react';
import { format } from 'date-fns';

const columnHelper = createColumnHelper();

const GestionarLicencias = () => {
    const { data = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['all_citaciones'],
        queryFn: () => fetchWithToken(`/citaciones/`),
    });

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'ID',
                cell: info => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>,
            }),
            columnHelper.accessor('nombre', {
                header: 'Nombre de Citación',
                cell: info => <span className="font-bold text-slate-700 dark:text-slate-200">{info.getValue()}</span>,
            }),
            columnHelper.accessor('fecha', {
                header: 'Fecha y Hora',
                cell: info => (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={14} />
                        <span className="text-sm">{format(new Date(info.getValue()), 'dd-MM-yyyy HH:mm')}</span>
                    </div>
                ),
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Link
                            to={`/licencia/gestionar/${row.original.id}`}
                            className="flex items-center gap-2 px-4 py-1.5 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm group"
                        >
                            <span>Gestionar</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                ),
            }),
        ],
        []
    );

    return (
        <Layout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !bg-white dark:!bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestionar Licencias</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Administración de permisos y ausencias por citación</p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:!bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
                        onClick={() => refetch()}
                        disabled={isLoading || isFetching}
                    >
                        <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                        <span>Actualizar</span>
                    </button>
                </div>

                <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <RefreshCw size={32} className="animate-spin mb-4" />
                            <p className="font-medium">Cargando citaciones...</p>
                        </div>
                    ) : (
                        <Tabla data={data} columns={columns} pageSize={10} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GestionarLicencias;
