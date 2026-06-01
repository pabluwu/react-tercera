import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Loader2, Files } from 'lucide-react';
import { useTiposPermitidos } from '../../hooks/useTiposPermitidos';
import Layout from '../../layout/Layout';

const SeleccionarTipoArchivo = () => {
    const navigate = useNavigate();
    const { data: tipos, isLoading } = useTiposPermitidos();

    const handleClick = (tipo) => {
        navigate(`/archivos/${tipo}`);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-50 dark:!bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                        <Files size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Documentos</h2>
                        <p className="text-slate-500 dark:text-slate-400">Selecciona una categoría para ver los archivos disponibles</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando categorías...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tipos?.map((tipo) => (
                            <button
                                key={tipo.value}
                                onClick={() => handleClick(tipo.value)}
                                className="group relative !bg-white dark:!bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Decorative background element */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:!bg-blue-900/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out" />
                                
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 dark:!bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {tipo.label}
                                            </h5>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                                Ver documentos de esta categoría
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SeleccionarTipoArchivo;
