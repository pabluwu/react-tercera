// src/views/BomberoSubirComprobante.jsx
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import MesesSelector from '../../components/MesesSelector';
// import { Button } from 'react-bootstrap';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore.js';


const BomberoSubirComprobante = () => {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const mutation = useMutation({
        mutationFn: (formData) => fetchWithToken('/comprobantes/transferencia/', {
            method: 'POST',
            body: formData
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-transferencia']);
            toast.success('Comprobante enviado correctamente')
            reset();
        }
    });

    const onSubmit = (data) => {
        console.log(data);
        const formData = new FormData();
        formData.append('archivo', data.archivo[0]);
        data.meses_pagados.forEach(id => formData.append('meses_pagados', id));
        mutation.mutate(formData);
    };

    return (
        <Layout>
            <div className="container rounded shadow-sm p-4 bg-white">
                <h2 className="mb-4">Subir comprobante de transferencia</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Archivo comprobante</label>
                        <input type="file" className="form-control" accept="application/pdf,image/*" {...register('archivo', { required: true })} />
                        {errors.archivo && <div className="text-danger">Debes subir un archivo</div>}
                    </div>

                    <div className="mb-3">
                        <Controller
                            name="meses_pagados"
                            control={control}
                            defaultValue={[]}
                            rules={{ validate: v => v.length > 0 || 'Selecciona al menos un mes' }}
                            render={({ field, fieldState }) => (
                                <MesesSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error}
                                    bomberoId={user.id}
                                />
                            )}
                        />
                    </div>

                    <button className='btn btn-primary' type="submit" variant="primary">Enviar comprobante</button>
                </form>
            </div>
        </Layout>
    );
};

export default BomberoSubirComprobante;
