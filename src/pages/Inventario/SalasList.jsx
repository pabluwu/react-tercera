import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalas, createSala, updateSala, deleteSala } from '../../api/inventario';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import Layout from '../../layout/Layout';

const SalasList = () => {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSala, setSelectedSala] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: ''
  });

  const fetchSalas = async () => {
    try {
      setLoading(true);
      const data = await getSalas();
      // Filter only active salas
      const activeSalas = data.filter(sala => sala.is_active !== false);
      setSalas(activeSalas);
      setError(null);
    } catch (err) {
      setError('Error al cargar las salas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalas();
  }, []);

  const handleCreate = async (motivo) => {
    try {
      await createSala(formData, motivo);
      setShowCreateModal(false);
      setFormData({ nombre: '', descripcion: '', ubicacion: '' });
      fetchSalas();
    } catch (err) {
      alert('Error al crear la sala: ' + err.message);
    }
  };

  const handleEdit = async (motivo) => {
    try {
      await updateSala(selectedSala.id, formData, motivo);
      setShowEditModal(false);
      setSelectedSala(null);
      setFormData({ nombre: '', descripcion: '', ubicacion: '' });
      fetchSalas();
    } catch (err) {
      alert('Error al actualizar la sala: ' + err.message);
    }
  };

  const handleDelete = async (motivo) => {
    try {
      await deleteSala(selectedSala.id, motivo);
      setShowDeleteModal(false);
      setSelectedSala(null);
      fetchSalas();
    } catch (err) {
      alert('Error al eliminar la sala: ' + err.message);
    }
  };

  const openEditModal = (sala) => {
    setSelectedSala(sala);
    setFormData({
      nombre: sala.nombre || '',
      descripcion: sala.descripcion || '',
      ubicacion: sala.ubicacion || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (sala) => {
    setSelectedSala(sala);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid py-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestión de Salas</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({ nombre: '', descripcion: '', ubicacion: '' });
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Sala
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {salas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No hay salas disponibles
                      </td>
                    </tr>
                  ) : (
                    salas.map((sala) => (
                      <tr key={sala.id}>
                        <td>{sala.nombre}</td>
                        <td>{sala.descripcion || '-'}</td>
                        <td>{sala.ubicacion || '-'}</td>
                        <td>
                          <span className="badge bg-success">Activa</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-info text-white"
                              onClick={() => navigate(`/inventario/salas/${sala.id}`)}
                            >
                              Ver Detalle
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openEditModal(sala)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openDeleteModal(sala)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        <ModalConfirmacion
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreate}
          titulo="Crear Nueva Sala"
          mensaje="Ingrese los datos de la sala y el motivo de creación:"
          botonConfirmar="Crear"
        >
          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-control"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ubicación</label>
            <input
              type="text"
              className="form-control"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            />
          </div>
        </ModalConfirmacion>

        {/* Edit Modal */}
        <ModalConfirmacion
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEdit}
          titulo="Editar Sala"
          mensaje="Modifique los datos de la sala y ingrese el motivo de los cambios:"
          botonConfirmar="Guardar"
        >
          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-control"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ubicación</label>
            <input
              type="text"
              className="form-control"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            />
          </div>
        </ModalConfirmacion>

        {/* Delete Modal */}
        <ModalConfirmacion
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          titulo="Eliminar Sala"
          mensaje={`¿Está seguro de que desea eliminar la sala "${selectedSala?.nombre}"? Esta acción la marcará como inactiva.`}
          botonConfirmar="Eliminar"
        />
      </div>
    </Layout>
  );
};

export default SalasList;