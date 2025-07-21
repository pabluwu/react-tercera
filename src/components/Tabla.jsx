import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useMemo } from 'react';

const Tabla = ({ data, columns, pageSize = 10 }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        pageSize,
        state: {
            pagination: {
                pageIndex: 0,
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
        <div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    No hay datos
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    Mostrando {start}-{end} de {total} registros
                </small>

                <div className="btn-group">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tabla;
