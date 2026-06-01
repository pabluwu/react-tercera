import useAuthStore from '../../store/useAuthStore';
import { LogOut, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '../../layout/Layout';
import { useCitacionesFuturas } from '../../hooks/useCitacionesFuturas';
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMesesGrouped } from '../../hooks/useMesesGrouped';
import { useMemo } from 'react';

export default function Dashboard() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const { data: citaciones, isLoading: loadingCitaciones } = useCitacionesFuturas();

    const archivosQuery = useQuery({
        queryKey: ['archivos-dashboard'],
        queryFn: () => fetchWithToken('/archivos/'),
    });

    const ownId = user?.id ? String(user.id) : null;
    const { dataByYear } = useMesesGrouped(ownId, !!ownId, false);

    const pendingCuotas = useMemo(() => {
        if (!dataByYear) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12

        return Object.entries(dataByYear).reduce((acc, [year, months]) => {
            const yearNum = Number(year);
            const filteredMonths = months.filter((m) => {
                if (m.pagado) return false;
                if (yearNum < currentYear) return true;
                if (yearNum === currentYear && m.numeroMes <= currentMonth) return true;
                return false;
            });
            return acc + filteredMonths.length;
        }, 0);
    }, [dataByYear]);

    const documentosAleatorios = useMemo(() => {
        const docs = Array.isArray(archivosQuery.data) ? archivosQuery.data : [];
        if (docs.length <= 4) return docs;
        const shuffled = [...docs].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, [archivosQuery.data]);

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Bienvenido</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Resumen rápido de citaciones, archivos y tus cuotas pendientes.
                        </p>
                    </div>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:!bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20 rounded-xl font-medium transition-all active:scale-95" 
                        onClick={logout}
                    >
                        <LogOut size={18} /> 
                        <span>Cerrar sesión</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 dark:!bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citaciones próximas</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {loadingCitaciones ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : citaciones?.length ?? 0}
                            </h4>
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:!bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Documentos disponibles</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {archivosQuery.isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : archivosQuery.data?.length ?? 0}
                            </h4>
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-50 dark:!bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cuotas pendientes</p>
                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {pendingCuotas}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h5 className="text-lg font-bold text-slate-800 dark:text-white">Citaciones próximas</h5>
                            <a href="/citaciones/list" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 transition-colors">Ver todas</a>
                        </div>
                        <div className="p-6 flex-1">
                            {loadingCitaciones && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Cargando citaciones...</span>
                                </div>
                            )}
                            {!loadingCitaciones && (!citaciones || citaciones.length === 0) && (
                                <p className="text-slate-500 dark:text-slate-400 italic">No hay citaciones próximas.</p>
                            )}
                            {!loadingCitaciones && citaciones && citaciones.length > 0 && (
                                <div className="space-y-4">
                                    {citaciones.slice(0, 5).map((cita) => (
                                        <div key={cita.id} className="group flex flex-col p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{cita.nombre}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:!bg-slate-600"></span>
                                                {cita.lugar} — {new Date(cita.fecha).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h5 className="text-lg font-bold text-slate-800 dark:text-white">Documentos destacados</h5>
                            <a href="/archivos/ver" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 transition-colors">Ver archivos</a>
                        </div>
                        <div className="p-6 flex-1">
                            {archivosQuery.isLoading && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Cargando documentos...</span>
                                </div>
                            )}
                            {archivosQuery.isError && (
                                <p className="text-red-500 bg-red-50 dark:!bg-red-500/10 p-4 rounded-2xl text-sm">No se pudieron cargar los documentos.</p>
                            )}
                            {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length === 0 && (
                                <p className="text-slate-500 dark:text-slate-400 italic">No hay documentos disponibles.</p>
                            )}
                            {!archivosQuery.isLoading && !archivosQuery.isError && documentosAleatorios.length > 0 && (
                                <div className="space-y-4">
                                    {documentosAleatorios.map((doc) => (
                                        <div key={doc.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="min-w-0 flex-1 pr-4">
                                                <div className="font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{doc.nombre}</div>
                                                <div className="text-slate-500 dark:text-slate-400 text-sm truncate">{doc.descripcion}</div>
                                            </div>
                                            <a 
                                                href={doc.archivo} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="shrink-0 px-3 py-1 !bg-white dark:!bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"
                                            >
                                                Abrir
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
