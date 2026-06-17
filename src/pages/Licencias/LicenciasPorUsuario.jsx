import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import useAuthStore from '../../store/useAuthStore';
import { FileText } from 'lucide-react';

const columnHelper = createColumnHelper();

const LicenciasPorUsuario = () => {
    const userId = useAuthStore((s) => s.user?.id);
    const { data = [], isLoading } = useQuery({
        queryKey: ['licencias_usuario', userId],
        queryFn: () => fetchWithToken(`/licencias/?autor=${userId}`),
    });

    console.log(data);

    const columns = useMemo(
        () => [
            columnHelper.accessor('citacion', {
                header: 'Citación ID',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('citacion_info.nombre', {
                header: 'Citación',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('citacion_info.fecha', {
                header: 'Fecha citación',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.accessor('motivo', {
                header: 'Motivo',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('documento', {
                header: 'Documento',
                cell: info => {
                    const doc = info.getValue();
                    if (!doc) return <span className="text-slate-400 dark:text-slate-500 italic text-sm">Sin adjunto</span>;
                    return (
                        <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                        >
                            <FileText size={16} />
                            Ver adjunto
                        </a>
                    );
                }
            }),
            columnHelper.accessor('estado', {
                header: 'Estado',
                cell: info => {
                    const val = info.getValue() || 'pendiente';
                    const config = {
                        pendiente: { text: 'Pendiente', classes: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
                        aceptada: { text: 'Aceptada', classes: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50' },
                        rechazada: { text: 'Rechazada', classes: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50' },
                    };
                    const current = config[val] || config.pendiente;
                    return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.classes}`}>
                            {current.text}
                        </span>
                    );
                }
            }),
            columnHelper.accessor('fecha_licencia', {
                header: 'Fecha licencia',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
        ],
        []
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Mis Licencias
                    </h3>
                </div>

                <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Cargando tus licencias...</p>
                            </div>
                        ) : (
                            <Tabla data={data} columns={columns} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LicenciasPorUsuario;
