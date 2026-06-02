import React, { useState, useEffect } from 'react';
import { getLogs } from '../../api/inventario';
import Layout from '../../layout/Layout';
import Tabla from '../../components/Tabla';
import { ClipboardList, History, User, Calendar, Box, Tag, Info, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventarioLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getLogs();
            setLogs(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los logs de inventario');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns = [
        {
            header: 'Fecha',
            accessorKey: 'fecha',
            cell: ({ getValue }) => {
                const date = new Date(getValue());
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white">
                            {date.toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Usuario',
            accessorKey: 'usuario_nombre',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:!bg-slate-800 rounded-lg text-slate-500">
                        <User size={14} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {row.original.usuario_nombre || 'Sistema'}
                    </span>
                </div>
            )
        },
        {
            header: 'Acción',
            accessorKey: 'accion',
            cell: ({ getValue }) => {
                const accion = getValue();
                const colors = {
                    'CREATE': 'bg-green-100 text-green-700 border-green-200 dark:!bg-green-900/30 dark:text-green-400 dark:border-green-800',
                    'UPDATE': 'bg-blue-100 text-blue-700 border-blue-200 dark:!bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                    'DELETE': 'bg-red-100 text-red-700 border-red-200 dark:!bg-red-900/30 dark:text-red-400 dark:border-red-800',
                    'TRANSFER': 'bg-amber-100 text-amber-700 border-amber-200 dark:!bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[accion] || 'bg-slate-100 text-slate-700'}`}>
                        {accion}
                    </span>
                );
            }
        },
        {
            header: 'Sala / Item',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.sala_nombre && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Box size={12} className="text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Sala: {row.original.sala_nombre}</span>
                        </div>
                    )}
                    {row.original.item_nombre && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Tag size={12} className="text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Item: {row.original.item_nombre}</span>
                        </div>
                    )}
                    {!row.original.sala_nombre && !row.original.item_nombre && (
                        <span className="text-slate-400 italic text-xs">N/A</span>
                    )}
                </div>
            )
        },
        {
            header: 'Motivo / Detalle',
            accessorKey: 'motivo',
            cell: ({ getValue }) => (
                <p className="text-slate-600 dark:text-slate-400 max-w-md line-clamp-2 text-xs leading-relaxed">
                    {getValue() || 'Sin motivo registrado'}
                </p>
            )
        }
    ];

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando historial...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-4">
                        <button
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold transition-colors w-fit"
                            onClick={() => navigate('/inventario/salas')}
                        >
                            <ArrowLeft size={18} />
                            Volver a Inventario
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:!bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                <History size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Historial de Inventario</h2>
                                <p className="text-slate-500 dark:text-slate-400">Registro completo de movimientos y cambios</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:!bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <Tabla data={logs} columns={columns} pageSize={15} />
            </div>
        </Layout>
    );
};

export default InventarioLogs;
