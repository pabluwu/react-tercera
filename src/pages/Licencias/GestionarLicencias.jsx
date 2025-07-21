import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper();

const GestionarLicencias = () => {
    const { data = [], isLoading } = useQuery({
        queryKey: ['all_citaciones'],
        queryFn: () => fetchWithToken(`/citaciones/`),
    });

    console.log(data);

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Citación ID',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('nombre', {
                header: 'Nombre',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('fecha', {
                header: 'Fecha citación',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => (
                    <Link
                        to={`/licencia/gestionar/${row.original.id}`}
                        className="btn btn-sm btn-outline-primary"
                    >
                        Gestionar
                    </Link>
                ),
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

export default GestionarLicencias;
