import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, User, FileText, ArrowLeft, Loader2, AlertCircle, Shirt, Info, ExternalLink } from 'lucide-react';
import Layout from '../../layout/Layout';
import { fetchWithToken } from '../../api/fetchWithToken';
import { format, parseISO } from 'date-fns';

const DetalleCitacion = () => {
  const { id } = useParams();

  const { data: citacion, isLoading, error } = useQuery({
    queryKey: ['citacion', id],
    queryFn: () => fetchWithToken(`/citaciones/${id}/`),
  });

  if (isLoading) return (
    <Layout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4 text-red-500" size={48} />
            <p className="text-lg font-medium tracking-tight">Cargando detalles de citación...</p>
        </div>
    </Layout>
  );

  if (error || !citacion) return (
    <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="p-8 text-center bg-red-50 dark:bg-red-500/10 rounded-[2rem] border border-red-100 dark:border-red-900/20">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Error al cargar citación</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">No se pudo obtener la información solicitada.</p>
                <Link 
                    to="/citaciones/list" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all hover:bg-slate-800"
                >
                    <ArrowLeft size={16} /> Volver al listado
                </Link>
            </div>
        </div>
    </Layout>
  );

  const fechaCitacion = parseISO(citacion.fecha);
  const fechaTexto = format(fechaCitacion, 'dd/MM/yyyy');
  const horaTexto = format(fechaCitacion, 'HH:mm');

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link to="/citaciones/list" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors mb-2">
                <ArrowLeft size={16} /> Volver a citaciones
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {citacion.nombre}
            </h2>
            <div className="flex items-center gap-3">
                <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Citación Oficial
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 font-medium">
                    <Clock size={14} /> {fechaTexto} a las {horaTexto}
                </span>
            </div>
          </div>
          
          <Link 
            to={`/licencia/citacion/${citacion.id}`}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-red-200 dark:shadow-none transform active:scale-95"
          >
            Solicitar Licencia
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Core Info */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Details Card */}
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Info className="text-red-500" size={20} />
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Información General</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                <MapPin size={18} className="text-red-500" />
                                <span>{citacion.lugar || '—'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uniforme / Tenida</p>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                <Shirt size={18} className="text-red-500" />
                                <span>{citacion.tenida || '—'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizador</p>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                <User size={18} className="text-red-500" />
                                <span>{citacion.autor_info?.username || '—'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Publicación</p>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                <CalendarDays size={18} className="text-red-500" />
                                <span>{citacion.fecha_publicacion ? format(parseISO(citacion.fecha_publicacion), 'dd/MM/yyyy HH:mm') : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <FileText className="text-red-500" size={20} />
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Descripción y Objetivos</h3>
                    </div>
                    <div className="p-8">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            "{citacion.descripcion || 'No se ha proporcionado una descripción detallada.'}"
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Actions / Document */}
            <div className="space-y-8">
                {citacion.archivo && (
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Orden del Día / Anexo</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 px-4">
                            Hay un documento adjunto con información adicional para esta citación.
                        </p>
                        <a 
                            href={citacion.archivo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all hover:bg-slate-800 dark:hover:bg-slate-700 shadow-lg shadow-slate-200 dark:shadow-none transform active:scale-95"
                        >
                            <ExternalLink size={18} />
                            Ver documento adjunto
                        </a>
                    </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-500/5 rounded-3xl border border-amber-100 dark:border-amber-900/20 p-8 space-y-4">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <Info size={20} /> Importante
                    </h4>
                    <ul className="space-y-3 text-sm text-amber-700/80 dark:text-amber-400/80">
                        <li className="flex gap-2">
                            <span className="font-black">•</span>
                            <span>La asistencia a esta citación es de carácter obligatorio.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-black">•</span>
                            <span>Debe presentarse con la tenida indicada puntualmente.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-black">•</span>
                            <span>Inasistencias sin licencia previa serán sancionadas según reglamento.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetalleCitacion;
