import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Flame, User, Calendar, Activity, Loader2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import { getBomberosPerfiles, createAccidente } from '../../api/salud';

export default function AccidenteCrear() {
  const [bomberos, setBomberos] = useState([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Autocomplete States
  const [searchText, setSearchText] = useState('');
  const [selectedBombero, setSelectedBombero] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fecha_hora: new Date().toISOString().slice(0, 16), // Setea fecha actual
      contexto: 'incendio',
      bombero: ''
    }
  });

  useEffect(() => {
    async function loadPerfiles() {
      try {
        setLoadingPerfiles(true);
        const data = await getBomberosPerfiles();
        setBomberos(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error al cargar bomberos", error);
        toast.error("No se pudo cargar la lista de bomberos");
      } finally {
        setLoadingPerfiles(false);
      }
    }
    loadPerfiles();
  }, []);

  // Filtrar bomberos según el término de búsqueda
  const filteredPerfiles = bomberos.filter((b) => {
    const fullName = `${b.nombres} ${b.apellido_paterno} ${b.apellido_materno}`.toLowerCase();
    const query = searchText.toLowerCase();
    return fullName.includes(query) || (b.rut && b.rut.toLowerCase().includes(query));
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const payload = {
        bombero: parseInt(data.bombero),
        fecha_hora: new Date(data.fecha_hora).toISOString(),
        descripcion: data.descripcion,
        contexto: data.contexto,
        estado: 'abierto'
      };

      await createAccidente(payload);
      toast.success("Accidente registrado exitosamente");
      navigate('/salud/accidentes');
    } catch (error) {
      console.error("Error al registrar accidente", error);
      toast.error(error.message || "No se pudo registrar el accidente");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/salud/accidentes')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Volver a Accidentes
        </button>

        <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 dark:!bg-amber-950/20 rounded-2xl text-amber-500">
              <Flame size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registrar Accidente de Servicio</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Carga una nueva ficha de siniestro para el personal afectado</p>
            </div>
          </div>

          {loadingPerfiles ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-red-500" size={32} />
              <p className="text-slate-500 text-sm mt-2">Cargando lista de bomberos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Bombero con Autocomplete Buscador */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  Bombero Afectado
                </label>
                
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Escribe el nombre o RUT del bombero a buscar..."
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-red-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${
                        errors.bombero ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-red-500'
                      }`}
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setShowDropdown(true);
                        if (selectedBombero) {
                          setSelectedBombero(null);
                          setValue('bombero', '');
                        }
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => {
                        // setTimeout da tiempo para capturar el click en la opción de la lista
                        setTimeout(() => setShowDropdown(false), 250);
                      }}
                    />
                  </div>
                  
                  {/* Campo oculto registrado en react-hook-form para la validación */}
                  <input 
                    type="hidden" 
                    value={selectedBombero ? selectedBombero.id : ''} 
                    {...register('bombero', { required: true })} 
                  />

                  {/* Dropdown de Resultados */}
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredPerfiles.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">No se encontraron bomberos</div>
                      ) : (
                        filteredPerfiles.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-sm text-slate-750 dark:text-slate-300 transition-colors flex items-center justify-between"
                            onClick={() => {
                              setSelectedBombero(b);
                              setSearchText(`${b.nombres} ${b.apellido_paterno} ${b.apellido_materno} (${b.rut})`);
                              setValue('bombero', String(b.id), { shouldValidate: true });
                              setShowDropdown(false);
                            }}
                          >
                            <span className="font-semibold">{b.nombres} {b.apellido_paterno} {b.apellido_materno}</span>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                              {b.rut}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.bombero && <p className="text-xs text-red-500">Debe seleccionar y buscar un bombero de la lista.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha / Hora */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Fecha y Hora del Siniestro
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-red-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.fecha_hora ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-red-500'}`}
                    {...register('fecha_hora', { required: true })}
                  />
                  {errors.fecha_hora && <p className="text-xs text-red-500">Debe ingresar la fecha y hora.</p>}
                </div>

                {/* Contexto */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Activity size={16} className="text-slate-400" />
                    Contexto del Acto de Servicio
                  </label>
                  <select
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-red-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${errors.contexto ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-red-500'}`}
                    {...register('contexto', { required: true })}
                  >
                    <option value="incendio">Incendio</option>
                    <option value="rescate">Rescate</option>
                    <option value="ejercicio">Ejercicio</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Descripción del Siniestro y Lesión
                </label>
                <textarea
                  rows="4"
                  placeholder="Detalle cómo ocurrió el accidente y el diagnóstico o síntomas de la lesión sufrida (Ej: Fractura de radio izquierdo por caída en rescate vehicular)..."
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-red-500/20 dark:!bg-slate-800 dark:border-slate-700 dark:text-white ${errors.descripcion ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-red-500'}`}
                  {...register('descripcion', { required: true })}
                />
                {errors.descripcion && <p className="text-xs text-red-500">Debe detallar la descripción de la lesión.</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Registrando...' : 'Registrar Siniestro'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
