import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSala, getSalas, getItems, createItem, updateItem, deleteItem, transferItem } from '../../api/inventario';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import Layout from '../../layout/Layout';
import { ArrowLeft, Plus, Edit2, Trash2, Move, Box, MapPin, Info, Tag, Layers, Activity, Loader2, AlertCircle } from 'lucide-react';

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
    ubicacion_especifica: '',
    cantidad: 1
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
      setItemFormData({ nombre: '', descripcion: '', ubicacion_especifica: '', cantidad: 1 });
      fetchData();
    } catch (err) {
      alert('Error al crear el item: ' + err.message);
    }
  };

  const handleEditItem = async (motivo) => {
    try {
      await updateItem(selectedItem.id, { ...itemFormData, sala: parseInt(id) }, motivo);
      setShowEditItemModal(false);
      setSelectedItem(null);
      setItemFormData({ nombre: '', descripcion: '', ubicacion_especifica: '', cantidad: 1 });
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
      ubicacion_especifica: item.ubicacion_especifica || '',
      cantidad: item.cantidad || 1
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando detalles de sala...</p>
        </div>
      </Layout>
    );
  }

  if (error && !sala) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-50 dark:!bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center gap-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">Error al cargar datos</h3>
            <p className="text-red-600 dark:text-red-400/80 mt-2">{error}</p>
          </div>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 dark:!bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all"
            onClick={() => navigate('/inventario/salas')}
          >
            <ArrowLeft size={20} />
            Volver a Salas
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <button
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold mb-4 transition-colors"
              onClick={() => navigate('/inventario/salas')}
            >
              <ArrowLeft size={18} />
              Volver a Salas
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                <Box size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{sala?.nombre || 'Detalle de Sala'}</h2>
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-none group"
            onClick={() => {
              setItemFormData({ nombre: '', descripcion: '', ubicacion_especifica: '', cantidad: 1 });
              setShowCreateItemModal(true);
            }}
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Agregar Item
          </button>
        </div>

        {/* Sala Info Card */}
        <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8 border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-widest">
            <Info size={14} />
            Información de la Sala
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nombre</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{sala?.nombre}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ubicación</p>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <MapPin size={16} className="text-slate-400" />
                <span>{sala?.ubicacion || '-'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estado</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:!bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                Activa
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Items</p>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Layers size={16} className="text-slate-400" />
                <span>{items.length} productos</span>
              </div>
            </div>
            <div className="md:col-span-3 lg:col-span-4 space-y-1 pt-2 border-t border-slate-50 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Descripción</p>
              <p className="text-slate-600 dark:text-slate-400">{sala?.description || sala?.descripcion || 'Sin descripción adicional.'}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <Tag size={18} className="text-blue-500" />
              Items en esta Sala
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:!bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Ubicación Específica</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Layers size={48} className="text-slate-200 dark:text-slate-700" />
                        <p className="text-lg">No hay items registrados en esta sala</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.nombre}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs">
                        <span className="line-clamp-1">{item.description || item.descripcion || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{item.ubicacion_especifica || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.cantidad} unidades
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                            title="Editar"
                            onClick={() => openEditItemModal(item)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="p-2 bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
                            title="Mover de Sala"
                            onClick={() => openTransferModal(item)}
                          >
                            <Move size={16} />
                          </button>
                          <button
                            className="p-2 bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm"
                            title="Eliminar"
                            onClick={() => openDeleteItemModal(item)}
                          >
                            <Trash2 size={16} />
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

        {/* Create Item Modal Content */}
        <ModalConfirmacion
          isOpen={showCreateItemModal}
          onClose={() => setShowCreateItemModal(false)}
          onConfirm={handleCreateItem}
          titulo="Agregar Nuevo Item"
          mensaje="Ingrese el motivo de creación del item:"
          botonConfirmar="Crear Item"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nombre *</label>
              <input
                type="text"
                placeholder="Nombre del producto o herramienta"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.nombre}
                onChange={(e) => setItemFormData({ ...itemFormData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Ubicación Específica</label>
              <input
                type="text"
                placeholder="Ej: Estante A, Nivel 2"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.ubicacion_especifica}
                onChange={(e) => setItemFormData({ ...itemFormData, ubicacion_especifica: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.cantidad}
                onChange={(e) => setItemFormData({ ...itemFormData, cantidad: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Descripción</label>
              <textarea
                placeholder="Detalles del item..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                rows="2"
                value={itemFormData.descripcion}
                onChange={(e) => setItemFormData({ ...itemFormData, descripcion: e.target.value })}
              />
            </div>
          </div>
        </ModalConfirmacion>

        {/* Edit Item Modal Content */}
        <ModalConfirmacion
          isOpen={showEditItemModal}
          onClose={() => setShowEditItemModal(false)}
          onConfirm={handleEditItem}
          titulo="Editar Item"
          mensaje="Ingrese el motivo de los cambios realizados:"
          botonConfirmar="Guardar Cambios"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nombre *</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.nombre}
                onChange={(e) => setItemFormData({ ...itemFormData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Ubicación Específica</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.ubicacion_especifica}
                onChange={(e) => setItemFormData({ ...itemFormData, ubicacion_especifica: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={itemFormData.cantidad}
                onChange={(e) => setItemFormData({ ...itemFormData, cantidad: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Descripción</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                rows="2"
                value={itemFormData.descripcion}
                onChange={(e) => setItemFormData({ ...itemFormData, descripcion: e.target.value })}
              />
            </div>
          </div>
        </ModalConfirmacion>

        {/* Delete Item Modal */}
        <ModalConfirmacion
          isOpen={showDeleteItemModal}
          onClose={() => setShowDeleteItemModal(false)}
          onConfirm={handleDeleteItem}
          titulo="Eliminar Item"
          mensaje={`¿Está seguro de que desea eliminar el item "${selectedItem?.nombre}"? Esta acción lo marcará como inactivo. Ingrese el motivo:`}
          botonConfirmar="Eliminar Item"
        />

        {/* Transfer Modal Content */}
        <ModalConfirmacion
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransfer}
          titulo="Transferir Item"
          mensaje="Ingrese el motivo de la transferencia:"
          botonConfirmar="Transferir Ahora"
        >
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Seleccionar Sala de Destino *</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
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
            <div className="p-4 bg-amber-50 dark:!bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase mb-1">Item a mover</p>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{selectedItem?.nombre}</p>
            </div>
          </div>
        </ModalConfirmacion>
      </div>
    </Layout>
  );
};

export default SalaDetail;