import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, ClipboardList, CheckCircle2, AlertCircle, Plus, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import { getAccidentes } from '../../api/salud';


export default function AccidentesList() {
  const [accidentes, setAccidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [contextFilter, setContextFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAccidentes();
      setAccidentes(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error al cargar accidentes", error);
      toast.error("No se pudo cargar la lista de accidentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado en el cliente para mejor interactividad
  const filteredAccidentes = accidentes.filter((acc) => {
    const bomberoName = `${acc.bombero_detalle?.nombres} ${acc.bombero_detalle?.apellido_paterno}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = bomberoName.includes(query) || acc.descripcion.toLowerCase().includes(query) || (acc.bombero_detalle?.rut && acc.bombero_detalle.rut.includes(query));
    const matchesStatus = statusFilter ? acc.estado === statusFilter : true;
    const matchesContext = contextFilter ? acc.contexto === contextFilter : true;

    return matchesSearch && matchesStatus && matchesContext;
  });

  // Calcular KPIs
  const total = accidentes.length;
  const abiertos = accidentes.filter(a => a.estado === 'abierto').length;
  const cerrados = accidentes.filter(a => a.estado === 'cerrado').length;

  const contextoLabel = {
    incendio: 'Incendio',
    rescate: 'Rescate',
    ejercicio: 'Ejercicio',
    otro: 'Otro'
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              <Flame className="text-amber-500" size={32} />
              Historial de Accidentes de Servicio
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Bitácora de seguimiento de siniestros, lesiones en actos de servicio y altas médicas.
            </p>
          </div>
          <button
            onClick={() => navigate('/salud/accidentes/crear')}
            className="self-start md:self-auto py-3 px-5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            Registrar Accidente
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Accidentes</span>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{total}</h3>
            </div>
            <div className="p-3.5 bg-slate-100 dark:!bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
              <ClipboardList size={22} />
            </div>
          </div>

          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Casos Abiertos (En Evolución)</span>
              <h3 className="text-3xl font-bold text-red-500 mt-1">{abiertos}</h3>
            </div>
            <div className="p-3.5 bg-red-50 dark:!bg-red-950/20 text-red-500 rounded-xl">
              <AlertCircle size={22} />
            </div>
          </div>

          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Casos Cerrados (Alta Médica)</span>
              <h3 className="text-3xl font-bold text-green-500 mt-1">{cerrados}</h3>
            </div>
            <div className="p-3.5 bg-green-50 dark:!bg-green-950/20 text-green-500 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por bombero o lesión..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            <select
              className="flex-1 md:w-40 px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="abierto">Abierto</option>
              <option value="cerrado">Cerrado</option>
            </select>

            <select
              className="flex-1 md:w-44 px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
            >
              <option value="">Todos los Contextos</option>
              <option value="incendio">Incendio</option>
              <option value="rescate">Rescate</option>
              <option value="ejercicio">Ejercicio</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Tabla/Lista */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-slate-500 mt-4">Cargando accidentes...</p>
          </div>
        ) : filteredAccidentes.length === 0 ? (
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
            <ClipboardList className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No hay accidentes registrados</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Intenta con otros filtros o registra un nuevo siniestro.</p>
          </div>
        ) : (
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Bombero</th>
                    <th className="py-4 px-6">Fecha / Hora</th>
                    <th className="py-4 px-6">Contexto</th>
                    <th className="py-4 px-6">Descripción de Lesión</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredAccidentes.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                            <User size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block">
                              {acc.bombero_detalle?.nombres} {acc.bombero_detalle?.apellido_paterno}
                            </span>
                            <span className="text-xs text-slate-400">RUT: {acc.bombero_detalle?.rut}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{new Date(acc.fecha_hora).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {contextoLabel[acc.contexto] || acc.contexto}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {acc.descripcion}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          acc.estado === 'abierto'
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-800/40'
                            : 'bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-200 dark:border-green-800/40'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${acc.estado === 'abierto' ? 'bg-red-500' : 'bg-green-500'}`} />
                          {acc.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/salud/accidentes/${acc.id}`)}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                        >
                          Ver Bitácora
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
