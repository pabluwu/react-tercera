import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSala, getSalas, getItems, createItem, updateItem, deleteItem, transferItem } from '../../api/inventario';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import Layout from '../../layout/Layout';

const SalaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sala, setSala] = useState(null);
  const [items, setItems] = useState([]);
  const [allSalas, setAllSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transferSalaId, setTransferSalaId] = useState('');

  // Form data for item
  const [itemFormData, setItemFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    cantidad: 1,
    estado: 'Bueno'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salaData, itemsData, salasData] = await Promise.all([
        getSala(id),
        getItems(id),
        getSalas()
      ]);
      setSala(salaData);
      // Filter active items only
      const activeItems = itemsData.filter(item => item.is_active !== false);
      setItems(activeItems);
      // Filter active salas for transfer
      const activeSalas = salasData.filter(s => s.is_active !== false && s.id !== parseInt(id));
      setAllSalas(activeSalas);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateItem = async (motivo) => {
    try {
      await createItem({ ...itemFormData, sala: parseInt(id) }, motivo);
      setShowCreateItemModal(false);
      setItemFormData({ nombre: '', descripcion: '', codigo: '', cantidad: 1, estado: 'Bueno' });
      fetchData();
    } catch (err) {
      alert('Error al crear el item: ' + err.message);
    }
  };

  const handleEditItem = async (motivo) => {
    try {
      await updateItem(selectedItem.id, itemFormData, motivo);
      setShowEditItemModal(false);
      setSelectedItem(null);
      setItemFormData({ nombre: '', descripcion: '', codigo: '', cantidad: 1, estado: 'Bueno' });
      fetchData();
    } catch (err) {
      alert('Error al actualizar el item: ' + err.message);
    }
  };

  const handleDeleteItem = async (motivo) => {
    try {
      await deleteItem(selectedItem.id, motivo);
      setShowDeleteItemModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert('Error al eliminar el item: ' + err.message);
    }
  };

  const handleTransfer = async (motivo) => {
    if (!transferSalaId) {
      alert('Por favor seleccione una sala');
      return;
    }
    try {
      await transferItem(selectedItem.id, parseInt(transferSalaId), motivo);
      setShowTransferModal(false);
      setSelectedItem(null);
      setTransferSalaId('');
      fetchData();
    } catch (err) {
      alert('Error al transferir el item: ' + err.message);
    }
  };

  const openEditItemModal = (item) => {
    setSelectedItem(item);
    setItemFormData({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      codigo: item.codigo || '',
      cantidad: item.cantidad || 1,
      estado: item.estado || 'Bueno'
    });
    setShowEditItemModal(true);
  };

  const openDeleteItemModal = (item) => {
    setSelectedItem(item);
    setShowDeleteItemModal(true);
  };

  const openTransferModal = (item) => {
    setSelectedItem(item);
    setTransferSalaId('');
    setShowTransferModal(true);
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

  if (error && !sala) {
    return (
      <Layout>
        <div className="container-fluid py-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/inventario/salas')}>
            Volver a Salas
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid py-3 py-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <button
              className="btn btn-link text-decoration-none mb-2"
              onClick={() => navigate('/inventario/salas')}
            >
              ← Volver a Salas
            </button>
            <h2>{sala?.nombre || 'Detalle de Sala'}</h2>
          </div>
          <button
            className="btn btn-primary w-100 w-md-auto"
            onClick={() => {
              setItemFormData({ nombre: '', descripcion: '', codigo: '', cantidad: 1, estado: 'Bueno' });
              setShowCreateItemModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Item
          </button>
        </div>

        {/* Sala Info Card */}
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Información de la Sala</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <p><strong>Nombre:</strong> {sala?.nombre}</p>
              </div>
              <div className="col-md-4">
                <p><strong>Descripción:</strong> {sala?.descripcion || '-'}</p>
              </div>
              <div className="col-md-4">
                <p><strong>Ubicación:</strong> {sala?.ubicacion || '-'}</p>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-4">
                <p><strong>Estado:</strong> <span className="badge bg-success">Activa</span></p>
              </div>
              <div className="col-md-4">
                <p><strong>Total Items:</strong> {items.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">Items en esta Sala</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No hay items en esta sala
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.codigo || '-'}</td>
                        <td>{item.nombre}</td>
                        <td>{item.descripcion || '-'}</td>
                        <td>{item.cantidad}</td>
                        <td>
                          <span className={`badge ${item.estado === 'Bueno' ? 'bg-success' :
                            item.estado === 'Regular' ? 'bg-warning' : 'bg-danger'
                            }`}>
                            {item.estado}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openEditItemModal(item)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-info text-white"
                              onClick={() => openTransferModal(item)}
                            >
                              Mover
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openDeleteItemModal(item)}
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

        {/* Create Item Modal */}
        <ModalConfirmacion
          isOpen={showCreateItemModal}
          onClose={() => setShowCreateItemModal(false)}
          onConfirm={handleCreateItem}
          titulo="Agregar Nuevo Item"
          mensaje="Ingrese los datos del item y el motivo de creación:"
          botonConfirmar="Crear"
        >
          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-control"
              value={itemFormData.nombre}
              onChange={(e) => setItemFormData({ ...itemFormData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Código</label>
            <input
              type="text"
              className="form-control"
              value={itemFormData.codigo}
              onChange={(e) => setItemFormData({ ...itemFormData, codigo: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={itemFormData.descripcion}
              onChange={(e) => setItemFormData({ ...itemFormData, descripcion: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={itemFormData.cantidad}
              onChange={(e) => setItemFormData({ ...itemFormData, cantidad: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Estado *</label>
            <select
              className="form-select"
              value={itemFormData.estado}
              onChange={(e) => setItemFormData({ ...itemFormData, estado: e.target.value })}
            >
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>
        </ModalConfirmacion>

        {/* Edit Item Modal */}
        <ModalConfirmacion
          isOpen={showEditItemModal}
          onClose={() => setShowEditItemModal(false)}
          onConfirm={handleEditItem}
          titulo="Editar Item"
          mensaje="Modifique los datos del item y ingrese el motivo de los cambios:"
          botonConfirmar="Guardar"
        >
          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-control"
              value={itemFormData.nombre}
              onChange={(e) => setItemFormData({ ...itemFormData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Código</label>
            <input
              type="text"
              className="form-control"
              value={itemFormData.codigo}
              onChange={(e) => setItemFormData({ ...itemFormData, codigo: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={itemFormData.descripcion}
              onChange={(e) => setItemFormData({ ...itemFormData, descripcion: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={itemFormData.cantidad}
              onChange={(e) => setItemFormData({ ...itemFormData, cantidad: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Estado *</label>
            <select
              className="form-select"
              value={itemFormData.estado}
              onChange={(e) => setItemFormData({ ...itemFormData, estado: e.target.value })}
            >
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>
        </ModalConfirmacion>

        {/* Delete Item Modal */}
        <ModalConfirmacion
          isOpen={showDeleteItemModal}
          onClose={() => setShowDeleteItemModal(false)}
          onConfirm={handleDeleteItem}
          titulo="Eliminar Item"
          mensaje={`¿Está seguro de que desea eliminar el item "${selectedItem?.nombre}"? Esta acción lo marcará como inactivo.`}
          botonConfirmar="Eliminar"
        />

        {/* Transfer Modal */}
        <ModalConfirmacion
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransfer}
          titulo="Transferir Item"
          mensaje="Seleccione la sala de destino y el motivo de la transferencia:"
          botonConfirmar="Transferir"
        >
          <div className="mb-3">
            <label className="form-label">Sala de Destino *</label>
            <select
              className="form-select"
              value={transferSalaId}
              onChange={(e) => setTransferSalaId(e.target.value)}
            >
              <option value="">Seleccione una sala...</option>
              {allSalas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nombre} - {sala.ubicacion || 'Sin ubicación'}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2 text-muted small">
            Item a transferir: <strong>{selectedItem?.nombre}</strong>
          </div>
        </ModalConfirmacion>
      </div>
    </Layout>
  );
};

export default SalaDetail;