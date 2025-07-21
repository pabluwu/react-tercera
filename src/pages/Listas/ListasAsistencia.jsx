import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';

const ListasAsistencia = () => {
    const { data = [], isLoading } = useQuery({
        queryKey: ['listas-asistencia'],
        queryFn: () => fetchWithToken('/listas-asistencia/'),
    });
    console.log(data);

    const columns = [
        {
            header: 'Tipo',
            accessorFn: (row) => row.tipo.toUpperCase(),
        },
        {
            header: 'Evento',
            accessorFn: (row) => row.evento.nombre || `Clave: ${row.evento.clave}` || 'Sin información',
        },
        {
            header: 'Fecha creación',
            accessorFn: (row) => format(new Date(row.fecha_creacion), 'dd-MM-yyyy HH:mm'),
        },
        {
            header: 'Asistentes',
            accessorFn: (row) => row.asistencias?.length || 0,
        },
        {
            header: 'Licencias',
            accessorFn: (row) => row.licencias?.length || 0,
        },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <Link
                    to={`/lista/${row.original.id}`}
                    className="btn btn-outline-primary btn-sm"
                >
                    <Eye size={16} className="me-1" />
                    Ver detalle
                </Link>
            ),
        }
    ];

    const inferirTipo = (row) => {
        const model = row?.evento?.clave ? 'emergencia' : 'citacion';
        return model.charAt(0).toUpperCase() + model.slice(1);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h2>Listas de Asistencia</h2>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <Tabla data={data} columns={columns} pageSize={10} />
                )}
            </div>
        </Layout>
    );
};

export default ListasAsistencia;
