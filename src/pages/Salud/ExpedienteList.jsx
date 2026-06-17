import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HeartPulse, ShieldAlert, User, Filter, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import { getBomberosPerfiles } from '../../api/salud';

export default function ExpedienteList() {
  const [bomberos, setBomberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCia, setSelectedCia] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBomberosPerfiles();
        // data puede ser un array o venir dentro de una estructura
        setBomberos(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error al cargar bomberos", error);
        toast.error("No se pudo cargar la lista de bomberos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Extraer las compañías únicas para el filtro
  const ciasUnicas = Array.from(new Set(bomberos.map(b => b.cia).filter(Boolean)));

  // Filtrar bomberos según búsqueda y compañía
  const filteredBomberos = bomberos.filter(b => {
    const fullName = `${b.nombres} ${b.apellido_paterno} ${b.apellido_materno}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || (b.rut && b.rut.toLowerCase().includes(query)) || (b.cargo && b.cargo.toLowerCase().includes(query));
    const matchesCia = selectedCia ? b.cia === selectedCia : true;
    return matchesSearch && matchesCia;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              <HeartPulse className="text-red-500 animate-pulse" size={32} />
              Expedientes Médicos de Salud
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Bandeja de control de fichas clínicas, certificados y aptitudes físicas del personal.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o cargo..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="text-slate-400 hidden md:block" size={18} />
            <select
              className="w-full md:w-48 px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:!bg-slate-800 dark:border-slate-700 dark:text-white outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
              value={selectedCia}
              onChange={(e) => setSelectedCia(e.target.value)}
            >
              <option value="">Todas las Compañías</option>
              {ciasUnicas.map(cia => (
                <option key={cia} value={cia}>{cia}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-slate-500 mt-4">Cargando personal...</p>
          </div>
        ) : filteredBomberos.length === 0 ? (
          <div className="!bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
            <User className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No se encontraron bomberos</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Intenta ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBomberos.map((b) => (
              <div
                key={b.id}
                className="group !bg-white dark:!bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:border-red-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-50 flex items-center justify-center text-slate-400">
                      {b.imagen ? (
                        <img src={b.imagen} alt={b.nombres} className="h-full w-full object-cover" onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<span class="text-xl font-bold">B</span>';
                        }} />
                      ) : (
                        <span className="text-xl font-bold text-slate-500 dark:text-slate-400">
                          {b.nombres[0] || 'B'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                        {b.nombres} {b.apellido_paterno}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">RUT: {b.rut}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 py-4 border-t border-b border-slate-100 dark:border-slate-800/60 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-650 dark:text-slate-300">
                      <Building2 size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold">Compañía:</span>
                      <span className="ml-auto bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                        {b.cia || 'Sin Asignar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-650 dark:text-slate-300">
                      <ShieldAlert size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold">Cargo:</span>
                      <span className="ml-auto text-slate-500 dark:text-slate-400 text-xs font-medium truncate max-w-[150px]">
                        {b.cargo || 'Bombero'}
                      </span>
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => navigate(`/salud/expedientes/${b.id}`)}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <HeartPulse size={16} />
                  Ver Expediente Médico
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
