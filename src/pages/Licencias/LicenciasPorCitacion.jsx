import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import useAuthStore from '../../store/useAuthStore';
import { useParams } from 'react-router-dom';

const columnHelper = createColumnHelper();

const LicenciasPorCitacion = () => {
    const { id: citacionId } = useParams();
    const { data = [], isLoading } = useQuery({
        queryKey: ['licencias_usuario', citacionId],
        queryFn: () => fetchWithToken(`/licencias/?citacion=${citacionId}`),
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
            columnHelper.accessor(row => `${row.autor_info.first_name} ${row.autor_info.last_name}`, {
                id: 'autor_completo', // id necesario cuando no pasas un string key
                header: 'Autor',
                cell: info => info.getValue(),
            }),

            columnHelper.accessor('motivo', {
                header: 'Motivo',
                cell: info => info.getValue(),
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
                        Licencias para citación <span className="text-red-600">#{citacionId}</span>
                    </h3>
                </div>

                <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Cargando licencias...</p>
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

export default LicenciasPorCitacion;
