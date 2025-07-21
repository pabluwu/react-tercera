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
            <div className="container mt-4">
                <h3 className="mb-3">Licencias para citación número {citacionId}</h3>
                {isLoading ? <p>Cargando...</p> : <Tabla data={data} columns={columns} />}
            </div>
        </Layout>
    );
};

export default LicenciasPorCitacion;
