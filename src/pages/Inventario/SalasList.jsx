import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalas, createSala, updateSala, deleteSala } from '../../api/inventario';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import Layout from '../../layout/Layout';
import { Plus, Edit2, Trash2, Eye, MapPin, Box, Loader2, AlertCircle, History } from 'lucide-react';

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
    descripcion: ''
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
      setFormData({ nombre: '', descripcion: '' });
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
      setFormData({ nombre: '', descripcion: '' });
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
      descripcion: sala.descripcion || ''
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando salas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <Box size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Salas</h2>
              <p className="text-slate-500 dark:text-slate-400">Administra las ubicaciones del inventario</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex items-center justify-center gap-2 bg-slate-100 dark:!bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-4 rounded-2xl transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={() => navigate('/inventario/logs')}
            >
              <History size={20} />
              Ver Historial
            </button>
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-none group"
              onClick={() => {
                setFormData({ nombre: '', descripcion: '' });
                setShowCreateModal(true);
              }}
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Nueva Sala
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:!bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:!bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {salas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Box size={48} className="text-slate-200 dark:text-slate-700" />
                        <p className="text-lg">No hay salas disponibles</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  salas.map((sala) => (
                    <tr key={sala.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sala.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-400">
                        <span className="line-clamp-1">{sala.description || sala.descripcion || '-'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:!bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                          Activa
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2.5 bg-blue-50 dark:!bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                            title="Ver Detalle"
                            onClick={() => navigate(`/inventario/salas/${sala.id}`)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2.5 bg-amber-50 dark:!bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
                            title="Editar"
                            onClick={() => openEditModal(sala)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2.5 bg-red-50 dark:!bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm"
                            title="Eliminar"
                            onClick={() => openDeleteModal(sala)}
                          >
                            <Trash2 size={18} />
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

        {/* Create Modal Content */}
        <ModalConfirmacion
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreate}
          titulo="Crear Nueva Sala"
          mensaje="Ingrese el motivo de creación de la sala:"
          botonConfirmar="Crear Sala"
        >
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Box size={16} /> Nombre *
              </label>
              <input
                type="text"
                placeholder="Ej: Bodega Central"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Descripción</label>
              <textarea
                placeholder="Detalles adicionales sobre la sala..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                rows="2"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
          </div>
        </ModalConfirmacion>

        {/* Edit Modal Content */}
        <ModalConfirmacion
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEdit}
          titulo="Editar Sala"
          mensaje="Ingrese el motivo de los cambios realizados:"
          botonConfirmar="Guardar Cambios"
        >
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Box size={16} /> Nombre *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Descripción</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                rows="2"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
          </div>
        </ModalConfirmacion>

        {/* Delete Modal */}
        <ModalConfirmacion
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          titulo="Eliminar Sala"
          mensaje={`¿Está seguro de que desea eliminar la sala "${selectedSala?.nombre}"? Esta acción la marcará como inactiva. Por favor ingrese el motivo:`}
          botonConfirmar="Confirmar Eliminación"
        />
      </div>
    </Layout>
  );
};

export default SalasList;