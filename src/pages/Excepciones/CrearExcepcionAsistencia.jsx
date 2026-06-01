import { useForm } from 'react-hook-form';
import { useBomberos } from '../../hooks/useBomberos';
import { useCrearExcepcionAsistencia } from '../../hooks/useCrearExcepcionAsistencia';
import { useTiposExcepcionAsistencia } from '../../hooks/useTiposExcepcionAsistencia';
import { useExcepcionesAsistencia } from '../../hooks/useExcepcionesAsistencia';
import { useEliminarExcepcionAsistencia } from '../../hooks/useEliminarExcepcionAsistencia';
import { useEditarExcepcionAsistencia } from '../../hooks/useEditarExcepcionAsistencia';
import { useState } from 'react';
import { Loader, Eye, Edit, Trash2 } from 'lucide-react';
import Layout from '../../layout/Layout';
import { toast } from 'react-toastify';

const CrearExcepcionAsistencia = () => {
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    const { data: bomberos, isLoading: loadingBomberos } = useBomberos();
    const { data: tiposExcepcion, isLoading: loadingTipos } = useTiposExcepcionAsistencia();
    const { data: excepciones, isLoading: loadingExcepciones } = useExcepcionesAsistencia();
    const { mutate: crearExcepcion, isLoading: isCreating } = useCrearExcepcionAsistencia();
    const { mutate: eliminarExcepcion, isLoading: isDeleting } = useEliminarExcepcionAsistencia();
    const { mutate: editarExcepcion, isLoading: isEditing } = useEditarExcepcionAsistencia();
    const [search, setSearch] = useState('');
    const [showModalDetalle, setShowModalDetalle] = useState(false);
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [excepcionSeleccionada, setExcepcionSeleccionada] = useState(null);
    const [fechaInicioEdicion, setFechaInicioEdicion] = useState('');
    const [fechaFinEdicion, setFechaFinEdicion] = useState('');

    const bomberoSeleccionado = watch('usuario');

    const onSubmit = (data) => {
        if (!data.usuario) {
            toast.error('Selecciona un bombero para la excepción');
            return;
        }
        crearExcepcion(data, {
            onSuccess: () => {
                toast.success('Excepción de asistencia creada correctamente');
                reset();
                setSearch('');
            },
            onError: () => {
                toast.error('Error al crear la excepción de asistencia');
            },
        });
    };

    const handleVerDetalle = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setShowModalDetalle(true);
    };

    const handleEditar = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setFechaInicioEdicion(excepcion.fecha_inicio.split('T')[0]);
        setFechaFinEdicion(excepcion.fecha_fin.split('T')[0]);
        setShowModalEditar(true);
    };

    const handleEliminar = (excepcion) => {
        setExcepcionSeleccionada(excepcion);
        setShowModalEliminar(true);
    };

    const confirmarEliminar = () => {
        eliminarExcepcion(excepcionSeleccionada.id, {
            onSuccess: () => {
                toast.success('Excepción eliminada correctamente');
                setShowModalEliminar(false);
                setExcepcionSeleccionada(null);
            },
            onError: () => {
                toast.error('Error al eliminar la excepción');
            },
        });
    };

    const confirmarEditar = () => {
        editarExcepcion(
            {
                id: excepcionSeleccionada.id,
                data: {
                    fecha_inicio: fechaInicioEdicion,
                    fecha_fin: fechaFinEdicion,
                },
            },
            {
                onSuccess: () => {
                    toast.success('Excepción actualizada correctamente');
                    setShowModalEditar(false);
                    setExcepcionSeleccionada(null);
                },
                onError: () => {
                    toast.error('Error al actualizar la excepción');
                },
            }
        );
    };

    const filtrados = bomberos?.filter(b =>
        `${b.user.first_name} ${b.user.last_name}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="container-fluid p-3 p-md-4 rounded shadow-sm">
                <h2 className="mb-4">Crear Excepción de Asistencia</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de Excepción</label>
                        {loadingTipos ? (
                            <p>Cargando tipos...</p>
                        ) : (
                            <select
                                className="form-control"
                                {...register('tipo_excepcion', { required: true })}
                                required
                            >
                                <option value="">Seleccionar tipo...</option>
                                {tiposExcepcion?.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Fecha de Inicio</label>
                        <input
                            className="form-control"
                            type="date"
                            {...register('fecha_inicio', { required: true })}
                            required
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Fecha de Fin</label>
                        <input
                            className="form-control"
                            type="date"
                            {...register('fecha_fin', { required: true })}
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Bombero (buscar por nombre o apellido)</label>
                        <input
                            className="form-control mb-2"
                            type="text"
                            placeholder="Buscar bombero por nombre o apellido..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {loadingBomberos && <p>Cargando bomberos...</p>}
                        {search && filtrados?.length > 0 && (
                            <ul className="list-group mb-2">
                                {filtrados.map((bombero) => (
                                    <li
                                        key={bombero.id}
                                        className={`list-group-item list-group-item-action ${bomberoSeleccionado === bombero.user.id ? 'active' : '' }`}
                                        onClick={() => {
                                            setValue('usuario', bombero.user.id);
                                            setSearch(`${bombero.user.first_name} ${bombero.user.last_name}`);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {bombero.user.first_name} {bombero.user.last_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <input type="hidden" {...register('usuario', { required: true })} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Motivo</label>
                        <textarea
                            className="form-control"
                            {...register('motivo', { required: true })}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={isCreating}>
                            {isCreating ? <Loader className="spinner-border spinner-border-sm" /> : 'Crear Excepción'}
                        </button>
                    </div>
                </form>

                {/* Tabla de Excepciones */}
                <div className="mt-5">
                    <h3 className="mb-4">Excepciones de Asistencia</h3>
                    {loadingExcepciones ? (
                        <p>Cargando excepciones...</p>
                    ) : excepciones && excepciones.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Bombero</th>
                                        <th>Activa</th>
                                        <th>Fecha Fin</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excepciones.map((excepcion) => (
                                        <tr key={excepcion.id}>
                                            <td>{excepcion.id}</td>
                                            <td>{excepcion.bombero.username} - {excepcion.bombero.first_name}</td>
                                            <td>
                                                <span className={`badge ${excepcion.is_activa ? 'bg-success' : 'bg-secondary'}`}>
                                                    {excepcion.is_activa ? 'Sí' : 'No'}
                                                </span>
                                            </td>
                                            <td>{new Date(excepcion.fecha_fin).toLocaleDateString()}</td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap">
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleVerDetalle(excepcion)}
                                                        title="Ver detalle"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleEditar(excepcion)}
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleEliminar(excepcion)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No hay excepciones registradas.</p>
                    )}
                </div>

                {/* Modal Ver Detalle */}
                {showModalDetalle && excepcionSeleccionada && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Detalle de Excepción #{excepcionSeleccionada.id}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModalDetalle(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Tipo de Excepción:</strong>
                                            <p>{excepcionSeleccionada.tipo_excepcion}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Bombero:</strong>
                                            <p>{excepcionSeleccionada.bombero.username} - {excepcionSeleccionada.bombero.first_name} {excepcionSeleccionada.bombero.last_name}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Fecha de Inicio:</strong>
                                            <p>{new Date(excepcionSeleccionada.fecha_inicio).toLocaleDateString()}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Fecha de Fin:</strong>
                                            <p>{new Date(excepcionSeleccionada.fecha_fin).toLocaleDateString()}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Activa:</strong>
                                            <p>{excepcionSeleccionada.is_activa ? 'Sí' : 'No'}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Autor:</strong>
                                            <p>{excepcionSeleccionada.autor_username}</p>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <strong>Motivo:</strong>
                                            <p>{excepcionSeleccionada.motivo}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Fecha de Creación:</strong>
                                            <p>{new Date(excepcionSeleccionada.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <strong>Última Actualización:</strong>
                                            <p>{new Date(excepcionSeleccionada.updated_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Editar */}
                {showModalEditar && excepcionSeleccionada && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Editar Excepción #{excepcionSeleccionada.id}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModalEditar(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={fechaInicioEdicion}
                                            onChange={(e) => setFechaInicioEdicion(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Fecha de Fin</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={fechaFinEdicion}
                                            onChange={(e) => setFechaFinEdicion(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModalEditar(false)}>Cancelar</button>
                                    <button type="button" className="btn btn-primary" onClick={confirmarEditar} disabled={isEditing}>
                                        {isEditing ? <Loader className="spinner-border spinner-border-sm" /> : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Eliminar */}
                {showModalEliminar && excepcionSeleccionada && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirmar Eliminación</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModalEliminar(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>¿Está seguro que desea eliminar la excepción #{excepcionSeleccionada.id}?</p>
                                    <p><strong>Bombero:</strong> {excepcionSeleccionada.bombero.username} - {excepcionSeleccionada.bombero.first_name}</p>
                                    <p><strong>Tipo:</strong> {excepcionSeleccionada.tipo_excepcion}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModalEliminar(false)}>Cancelar</button>
                                    <button type="button" className="btn btn-danger" onClick={confirmarEliminar} disabled={isDeleting}>
                                        {isDeleting ? <Loader className="spinner-border spinner-border-sm" /> : 'Eliminar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CrearExcepcionAsistencia;
