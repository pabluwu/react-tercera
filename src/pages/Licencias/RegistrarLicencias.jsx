import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/useAuthStore';
import { fetchWithToken } from '../../api/fetchWithToken';
import { toast } from 'react-toastify';
import { useLicenciaExistente } from '../../hooks/useLicenciaExistente';
import Layout from '../../layout/Layout';

const RegistrarLicencia = () => {
    const { id: citacionId } = useParams();
    const userId = useAuthStore((s) => s.user?.id);
    console.log(userId);
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const { data, isLoading } = useLicenciaExistente(userId, citacionId);
    const licenciaYaExiste = data?.length > 0;

    const onSubmit = async (formData) => {
        try {
            await fetchWithToken('/licencias/', {
                method: 'POST',
                body: JSON.stringify({
                    motivo: formData.motivo,
                    autor: userId,
                    citacion: citacionId,
                }),
            });
            toast.success('Licencia registrada');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Error al registrar la licencia');
        }
    };

    return (
        <Layout>
            <div className="container bg-white rounded shadow-sm p-4">
                <h2 className="mb-4">Registrar Licencia</h2>

                {isLoading ? (
                    <p>Cargando...</p>
                ) : licenciaYaExiste ? (
                    <div className="alert alert-info">
                        Ya registraste una licencia para esta citación.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Motivo</label>
                            <textarea {...register('motivo')} className="form-control" rows={4} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Enviar licencia</button>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default RegistrarLicencia;
