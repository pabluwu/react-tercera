import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useTiposPermitidos } from '../../hooks/useTiposPermitidos';
import Layout from '../../layout/Layout';

const subirArchivo = async (data) => {
    const formData = new FormData();
    formData.append('tipo', data.tipo);
    formData.append('nombre', data.nombre);
    formData.append('archivo', data.archivo[0]);
    formData.append('descripcion', data.descripcion || '');

    return await fetchWithToken('/archivos/', {
        method: 'POST',
        body: formData,
    });
};

const SubirArchivo = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const { data: tipos, isLoading: cargandoTipos } = useTiposPermitidos();

    const mutation = useMutation({
        mutationFn: subirArchivo,
        onSuccess: () => {
            toast.success('Archivo subido exitosamente');
            reset();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => setIsUploading(false),
    });

    const onSubmit = (data) => {
        setIsUploading(true);
        mutation.mutate(data);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h3 className="mb-4 d-flex align-items-center gap-2">
                    <Upload size={20} /> Subir Documento
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="bg-white p-4 shadow-sm rounded">
                    <div className="mb-3">
                        <label className="form-label">Tipo de documento</label>
                        <select className="form-select" {...register('tipo', { required: true })} disabled={cargandoTipos}>
                            <option value="">Seleccione un tipo</option>
                            {tipos?.map((tipo) => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                        </select>
                        {errors.tipo && <div className="text-danger">Campo requerido</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            {...register('nombre', { required: true })}
                        />
                        {errors.nombre && <div className="text-danger">Campo requerido</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Archivo</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".pdf,.doc,.docx"
                            {...register('archivo', { required: true })}
                        />
                        {errors.archivo && <div className="text-danger">Debe seleccionar un archivo</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Descripción (opcional)</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            {...register('descripcion')}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isUploading || cargandoTipos}
                    >
                        {isUploading ? 'Subiendo...' : 'Subir'}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default SubirArchivo;
