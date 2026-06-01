import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const Tabla = ({ data, columns, pageSize = 10 }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    const total = data.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSizeActual = table.getState().pagination.pageSize;
    const start = total === 0 ? 0 : pageIndex * pageSizeActual + 1;
    const end = Math.min(total, (pageIndex + 1) * pageSizeActual);

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 !bg-white dark:!bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:!bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    headerGroup.headers.map((header) => (
                                        <th key={header.id} className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider whitespace-nowrap">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic !bg-white dark:!bg-slate-900">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 align-middle">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center px-2 py-1 gap-4">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Mostrando <span className="text-slate-700 dark:text-slate-200">{start}</span> a <span className="text-slate-700 dark:text-slate-200">{end}</span> de <span className="text-slate-700 dark:text-slate-200">{total}</span> registros
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 !bg-white dark:!bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-50 disabled:hover:text-slate-600 transition-all shadow-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        title="Anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center justify-center min-w-[32px] text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:!bg-slate-800 h-9 px-3 rounded-lg">
                        {pageIndex + 1}
                    </div>
                    <button
                        className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 !bg-white dark:!bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-50 disabled:hover:text-slate-600 transition-all shadow-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        title="Siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tabla;
