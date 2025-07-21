import { useForm } from 'react-hook-form';
import { usePerfiles } from '../../hooks/usePerfiles';
import { useCrearCitacion } from '../../hooks/useCrearCitacion';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';

const CrearCitacion = () => {
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    const { data: perfiles, isLoading: loadingPerfiles } = usePerfiles();
    const { mutate, isLoading } = useCrearCitacion();
    const [search, setSearch] = useState('');

    const autorSeleccionado = watch('autor');

    const onSubmit = (data) => {
        mutate(data, {
            onSuccess: () => {
                toast.success('Citación creada correctamente');
                reset();
            },
            onError: () => {
                toast.error('Error al crear la citación');
            },
        });
    };

    const filtrados = perfiles?.filter(p =>
        p.user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>

            <div className="container bg-white p-4 rounded shadow-sm">
                <h2 className="mb-4">Crear Citación</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" {...register('nombre')} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Lugar</label>
                        <input className="form-control" {...register('lugar')} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tenida</label>
                        <input className="form-control" {...register('tenida')} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Fecha</label>
                        <input className="form-control" type="datetime-local" {...register('fecha')} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-control" {...register('descripcion')} rows={3} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Autor (buscar por email)</label>
                        <input
                            className="form-control mb-2"
                            type="text"
                            placeholder="Buscar autor por email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {loadingPerfiles && <p>Cargando usuarios...</p>}
                        {search && filtrados?.length > 0 && (
                            <ul className="list-group mb-2">
                                {filtrados.map((perfil) => (
                                    <li
                                        key={perfil.id}
                                        className={`list-group-item list-group-item-action ${autorSeleccionado === perfil.id ? 'active' : ''
                                            }`}
                                        onClick={() => {
                                            setValue('autor', perfil.id);
                                            setSearch(perfil.user.email); // muestra como seleccionado
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {perfil.user.email}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <input type="hidden" {...register('autor')} />
                    </div>

                    <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader className="spinner-border spinner-border-sm" /> : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CrearCitacion;
