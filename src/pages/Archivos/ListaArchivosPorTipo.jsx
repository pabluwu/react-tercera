import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import Layout from '../../layout/Layout';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

const ListaArchivosPorTipo = () => {
    const { tipo } = useParams();
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['archivos-por-tipo', tipo],
        queryFn: () => fetchWithToken(`/archivos/?tipo=${tipo}`),
    });

    if (isLoading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando archivos...</p>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-50 dark:!bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-xl font-bold text-red-800 dark:text-red-400">Error al cargar archivos</h3>
                <p className="text-red-600 dark:text-red-400/80">Hubo un problema al obtener la lista de documentos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                            <FileText size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
                                {tipo.replaceAll('_', ' ')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Lista de documentos disponibles</p>
                        </div>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {data?.length > 0 ? (
                            data.map((archivo) => (
                                <a 
                                    key={archivo.id} 
                                    href={archivo.archivo} 
                                    className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:!bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <strong className="block text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {archivo.nombre}
                                            </strong>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 line-clamp-1">
                                                {archivo.descripcion || 'Sin descripción adicional'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:!bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Download size={18} />
                                        <span className="hidden sm:inline">Descargar</span>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No hay archivos en esta categoría</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ListaArchivosPorTipo;
