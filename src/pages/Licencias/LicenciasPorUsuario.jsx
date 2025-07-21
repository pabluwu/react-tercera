import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import useAuthStore from '../../store/useAuthStore';

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
            columnHelper.accessor('fecha_licencia', {
                header: 'Fecha licencia',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
        ],
        []
    );

    return (
        <Layout>
            <div className="container mt-4">
                <h3 className="mb-3">Licencias del Usuario</h3>
                {isLoading ? <p>Cargando...</p> : <Tabla data={data} columns={columns} />}
            </div>
        </Layout>
    );
};

export default LicenciasPorUsuario;
