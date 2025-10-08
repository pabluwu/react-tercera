// src/views/TesoreraRegistrarComprobante.jsx
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import MesesSelector from '../../components/MesesSelector';
import { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';

const TesoreraRegistrarComprobante = () => {
    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm();
    const queryClient = useQueryClient();
    const [usuarios, setUsuarios] = useState([]);

    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchWithToken('/perfiles/').then(setUsuarios);
    }, []);

    useEffect(() => {
        if (search.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const filtered = usuarios.filter((u) =>
            `${u.user.first_name} ${u.user.last_name}`.toLowerCase().includes(search.toLowerCase())
        );
        setSuggestions(filtered);
    }, [search, usuarios]);

    const mutation = useMutation({
        mutationFn: (data) => fetchWithToken('/comprobantes/tesorero/', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comprobantes-tesorero']);
            toast.success('Comprobante enviado correctamente')
            reset();
        }
    });

    const onSubmit = (data) => {
        mutation.mutate({
            ...data,
            meses_pagados: data.meses_pagados,
            monto_total: Number(data.monto_total),
        });
    };
    
    return (
        <Layout>
            <div className="container rounded shadow-sm bg-white p-4">
                <h2 className="mb-4">Registrar nuevo comprobante</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Nº de comprobante</label>
                        <input className="form-control" {...register('numero_comprobante', { required: true })} />
                        {errors.numero_comprobante && <div className="text-danger">Este campo es obligatorio</div>}
                    </div>

                    <div className="mb-3 position-relative">
                        <label className="form-label">Bombero</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre o apellido"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => setTimeout(() => setSuggestions([]), 150)} // para no ocultar inmediatamente al hacer clic
                        />
                        {/* <input type="hidden" {...register('bombero', { required: true })} value={selectedId} /> */}

                        {errors.bombero && <div className="text-danger">Selecciona un bombero</div>}

                        {suggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-1 shadow-sm" style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {suggestions.map((u) => (
                                    <li
                                        key={u.user.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => {
                                            setSelectedId(u.user.id);
                                            setSearch(`${u.user.first_name} ${u.user.last_name}`);
                                            setSuggestions([]);
                                            setValue('bombero', u.user.id);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {u.user.first_name} {u.user.last_name} – {u.user.email}
                                    </li>
                                ))}
                            </ul>
                        )}
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
                                    bomberoId={watch('bombero')}
                                />

                            )}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Monto total</label>
                        <input type="number" className="form-control" {...register('monto_total', { required: true })} />
                        {errors.monto_total && <div className="text-danger">Este campo es obligatorio</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Método de pago</label>
                        <select className="form-select" {...register('metodo_pago', { required: true })}>
                            <option value="">Seleccionar método</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                        {errors.metodo_pago && <div className="text-danger">Selecciona un método</div>}
                    </div>

                    <button className='btn btn-primary' type="submit" variant="primary">Registrar</button>
                </form>
            </div>
        </Layout>
    );
};

export default TesoreraRegistrarComprobante;
