import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../../api/fetchWithToken';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Tabla from '../../components/Tabla';
import Layout from '../../layout/Layout';
import { useParams } from 'react-router-dom';
import { FileDown, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper();

const LicenciasPorCitacion = () => {
    const { id: citacionId } = useParams();
    const { data = [], isLoading, refetch } = useQuery({
        queryKey: ['licencias_usuario', citacionId],
        queryFn: () => fetchWithToken(`/licencias/?citacion=${citacionId}`),
    });

    const handleAceptar = async (id) => {
        try {
            await fetchWithToken(`/licencias/${id}/aceptar/`, { method: 'PATCH' });
            toast.success('Licencia aceptada');
            refetch();
        } catch (err) {
            toast.error('Error al aceptar la licencia');
        }
    };

    const handleRechazar = async (id) => {
        try {
            await fetchWithToken(`/licencias/${id}/rechazar/`, { method: 'PATCH' });
            toast.success('Licencia rechazada');
            refetch();
        } catch (err) {
            toast.error('Error al rechazar la licencia');
        }
    };

    const downloadPDF = () => {
        if (!data || data.length === 0) return;

        const aceptadas = data.filter(item => item.estado === 'aceptada');
        if (aceptadas.length === 0) {
            toast.info('No hay licencias aceptadas para exportar en esta citación.');
            return;
        }

        const doc = new jsPDF();
        const firstItem = data[0];
        const citacionInfo = firstItem.citacion_info || {};

        // Título del PDF
        doc.setFontSize(18);
        doc.text('Reporte de Licencias por Citación (Aceptadas)', 14, 22);

        // Detalle de la citación
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Citación: ${citacionInfo.nombre || 'N/A'} (#${citacionId})`, 14, 32);
        doc.text(`Fecha: ${citacionInfo.fecha ? new Date(citacionInfo.fecha).toLocaleString() : 'N/A'}`, 14, 38);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 44);

        // Tabla de datos
        const tableColumn = ["Autor", "Fecha Licencia", "Motivo", "Estado"];
        const tableRows = aceptadas.map(item => [
            `${item.autor_info.first_name} ${item.autor_info.last_name}`,
            new Date(item.fecha_licencia).toLocaleString(),
            item.motivo,
            'Aceptada'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38] }, // Red-600
            styles: { fontSize: 9 },
        });

        doc.save(`licencias-citacion-${citacionId}.pdf`);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('citacion', {
                header: 'Citación ID',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('citacion_info.nombre', {
                header: 'Citación',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('citacion_info.fecha', {
                header: 'Fecha citación',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.accessor(row => `${row.autor_info.first_name} ${row.autor_info.last_name}`, {
                id: 'autor_completo',
                header: 'Autor',
                cell: info => info.getValue(),
            }),

            columnHelper.accessor('motivo', {
                header: 'Motivo',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('documento', {
                header: 'Documento',
                cell: info => {
                    const doc = info.getValue();
                    if (!doc) return <span className="text-slate-400 dark:text-slate-500 italic text-sm">Sin adjunto</span>;
                    return (
                        <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                        >
                            <FileText size={16} />
                            Ver adjunto
                        </a>
                    );
                }
            }),
            columnHelper.accessor('estado', {
                header: 'Estado',
                cell: info => {
                    const val = info.getValue() || 'pendiente';
                    const config = {
                        pendiente: { text: 'Pendiente', classes: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
                        aceptada: { text: 'Aceptada', classes: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50' },
                        rechazada: { text: 'Rechazada', classes: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50' },
                    };
                    const current = config[val] || config.pendiente;
                    return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.classes}`}>
                            {current.text}
                        </span>
                    );
                }
            }),
            columnHelper.accessor('fecha_licencia', {
                header: 'Fecha licencia',
                cell: info => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const item = row.original;
                    if (item.estado !== 'pendiente') return null;
                    return (
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => handleAceptar(item.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-green-600/10"
                            >
                                Aceptar
                            </button>
                            <button
                                onClick={() => handleRechazar(item.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-red-600/10"
                            >
                                Rechazar
                            </button>
                        </div>
                    );
                }
            }),
        ],
        []
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Licencias para citación <span className="text-red-600">#{citacionId}</span>
                    </h3>
                    <button
                        onClick={downloadPDF}
                        disabled={isLoading || data.length === 0}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileDown size={20} />
                        Descargar PDF
                    </button>
                </div>

                <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Cargando licencias...</p>
                            </div>
                        ) : (
                            <Tabla data={data} columns={columns} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LicenciasPorCitacion;
