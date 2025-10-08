import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import Layout from '../../layout/Layout';

const ListaArchivosPorTipo = () => {
    const { tipo } = useParams();
    console.log(tipo);
    const { data, isLoading, error } = useQuery({
        queryKey: ['archivos-por-tipo', tipo],
        queryFn: () => fetchWithToken(`/archivos/?tipo=${tipo}`),
    });
    console.log(data);

    if (isLoading) return <div className="container mt-4">Cargando archivos...</div>;
    if (error) return <div className="container mt-4 text-danger">Error al cargar archivos</div>;

    return (
        <Layout>
            <div className="container">
                <h3 className="mb-4">Archivos: {tipo.replaceAll('_', ' ')}</h3>
                <div className="list-group">
                    {data?.map((archivo) => (
                        <a key={archivo.id} href={archivo.archivo} className="list-group-item list-group-item-action" target="_blank" rel="noopener noreferrer">
                            <strong>{archivo.nombre}</strong> — {archivo.descripcion}
                        </a>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default ListaArchivosPorTipo;
