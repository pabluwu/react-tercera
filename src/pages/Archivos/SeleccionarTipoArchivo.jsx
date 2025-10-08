import { useNavigate } from 'react-router-dom';
import { Card, FileText } from 'lucide-react';
import { useTiposPermitidos } from '../../hooks/useTiposPermitidos';
import Layout from '../../layout/Layout';

const SeleccionarTipoArchivo = () => {
    const navigate = useNavigate();
    const { data: tipos, isLoading } = useTiposPermitidos();

    const handleClick = (tipo) => {
        navigate(`/archivos/${tipo}`);
    };

    return (
        <Layout>

            <div className="container mt-4">
                <h2 className="mb-4">Tipos de Documentos</h2>

                {isLoading ? (
                    <div>Cargando tipos disponibles...</div>
                ) : (
                    <div className="row">
                        {tipos?.map((tipo) => (
                            <div className="col-md-4 mb-4" key={tipo.value}>
                                <div
                                    className="card h-100 shadow-sm cursor-pointer"
                                    onClick={() => handleClick(tipo.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-body d-flex align-items-center">
                                        <FileText className="me-3 text-primary" />
                                        <h5 className="card-title mb-0">{tipo.label}</h5>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SeleccionarTipoArchivo;
