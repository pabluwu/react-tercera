// src/views/TesoreraBandeja.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { Button } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import MesesSelector from '../../components/MesesSelector';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';

const BandejaItem = ({ item, onAprobar, onRechazar }) => {
    const [showForm, setShowForm] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const mesesSeleccionados = watch('meses_pagados_detalle') || [];

    const handleAprobar = (data) => {
        onAprobar(item.id, {
            numero_comprobante: data.numero_comprobante,
            monto_total: data.monto_total,
        });
    };

    return (
        <div className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>{item.bombero.nombre}</strong> - {item.fecha_envio}
                </div>
                <a href={item.archivo} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                    Ver archivo
                </a>
            </div>
            <div className="mt-2">
                Meses: {item.meses_pagados_detalle.map(m => `${m.mes} ${m.anio}`).join(', ')}
            </div>
            <div className="mt-2">
                <button className='btn btn-primary' size="sm" variant="success" onClick={() => setShowForm(!showForm)}>
                    Aprobar
                </button>{' '}
                <button className='btn btn-primary' size="sm" variant="danger" onClick={() => onRechazar(item.id)}>
                    Rechazar
                </button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit(handleAprobar)} className="mt-3">
                    <div className="mb-2">
                        <label className="form-label">Nº comprobante</label>
                        <input type="text" className="form-control" {...register('numero_comprobante', { required: true })} />
                        {errors.numero_comprobante && <div className="text-danger">Obligatorio</div>}
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Monto total</label>
                        <input type="number" className="form-control" {...register('monto_total', { required: true })} />
                        {errors.monto_total && <div className="text-danger">Obligatorio</div>}
                    </div>
                    <button className='btn btn-primary' type="submit" size="sm" variant="primary">
                        Confirmar aprobación
                    </button>
                </form>
            )}
        </div>
    );
};

const TesoreraBandeja = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['comprobantes-pendientes'],
        queryFn: () => fetchWithToken('/comprobantes/transferencia/pendientes/')
    });

    console.log(data);

    const aprobar = useMutation({
        mutationFn: ({ id, data }) => fetchWithToken(`/comprobantes/transferencia/${id}/aprobar/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-pendientes']);
            toast.success('Comprobante enviado correctamente');
        }
    });

    const rechazar = useMutation({
        mutationFn: (id) => fetchWithToken(`/comprobantes/transferencia/${id}/rechazar/`, {
            method: 'PATCH',
            body: JSON.stringify({ observacion: 'Rechazado por la tesorera' })
        }),
        onSuccess: () => queryClient.invalidateQueries(['comprobantes-pendientes'])
    });

    if (isLoading) return <div className="container mt-4">Cargando bandeja...</div>;

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="mb-4">Bandeja de comprobantes pendientes</h2>
                {data.length === 0 ? (
                    <div className="text-muted">No hay comprobantes pendientes.</div>
                ) : (
                    data.map(item => (
                        <BandejaItem
                            key={item.id}
                            item={item}
                            onAprobar={(id, data) => aprobar.mutate({ id, data })}
                            onRechazar={(id) => rechazar.mutate(id)}
                        />
                    ))
                )}
            </div>
        </Layout>
    );
};

export default TesoreraBandeja;
