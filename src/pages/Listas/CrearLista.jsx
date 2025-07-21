import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import BomberoSelector from '../../components/BomberoSelector';
import CitacionSelector from '../../components/CitacionSelector';
import EmergenciaForm from '../../components/EmergenciaForm';
import { fetchWithToken } from '../../api/fetchWithToken';
import Layout from '../../layout/Layout';

const CrearListaAsistencia = () => {
    const { register, handleSubmit, watch, reset } = useForm();
    const tipo = watch('tipo');
    const [filtro, setFiltro] = useState('');

    const { data: usuariosData } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => fetchWithToken('/perfiles/')
    });

    console.log(usuariosData);

    const { data: citacionesData } = useQuery({
        queryKey: ['citaciones'],
        queryFn: () => fetchWithToken('/citaciones/disponibles/')
    });

    const mutation = useMutation({
        mutationFn: (data) => fetchWithToken('/listas-asistencia/', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            toast.success('Lista creada correctamente')
            reset();
        },
        onError: () => toast.error('Error al crear lista')
    });

    const handleForm = async (form) => {
        const payload = { bomberos: form.bomberos || [] };

        if (form.tipo === 'emergencia') {
            const emergencia = await fetchWithToken('/emergencias/', {
                method: 'POST',
                body: JSON.stringify({
                    clave: form.clave,
                    fecha: form.fecha,
                    unidades: form.unidades
                })
            });
            payload.content_type = 'emergencia';
            payload.object_id = emergencia.id;
        } else if (form.tipo === 'citacion') {
            payload.content_type = 'citacion';
            payload.object_id = form.citacion_id;
        }
        console.log(payload);
        mutation.mutate(payload);
    };

    return (
        <Layout>
            <div className="container bg-white rounded shadow-sm p-4">
                <h2>Crear Lista de Asistencia</h2>
                <form onSubmit={handleSubmit(handleForm)} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Tipo de Lista</label>
                        <select {...register('tipo')} className="form-select">
                            <option value="">Seleccione</option>
                            <option value="citacion">Citación</option>
                            <option value="emergencia">Emergencia</option>
                        </select>
                    </div>

                    {tipo === 'citacion' && (
                        <CitacionSelector citaciones={citacionesData} register={register} />
                    )}

                    {tipo === 'emergencia' && (
                        <EmergenciaForm register={register} />
                    )}

                    <BomberoSelector
                        usuarios={usuariosData}
                        filtro={filtro}
                        onFiltroChange={setFiltro}
                        register={register}
                    />

                    <div className="col-12">
                        <button className="btn btn-success" type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Creando...' : 'Crear Lista'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CrearListaAsistencia;
