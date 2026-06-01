import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { useResumenCuotas } from "../../hooks/useResumenCuotas";
import { Users, Search, AlertTriangle, CheckCircle2, Eye } from "lucide-react";

const getFirstValue = (source, keys) => {
    if (!source) return undefined;
    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return undefined;
};

const formatNumeric = (value) => {
    if (value === null || value === undefined) return "0";
    if (typeof value === "number") return value.toLocaleString();
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString() : String(value);
};

const isTruthLike = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "1" || normalized === "true" || normalized === "sí" || normalized === "si";
    }
    return false;
};

const RevisarCuotas = () => {
    const { data, isLoading, isError, error } = useResumenCuotas();
    const navigate = useNavigate();

    const handleVerMas = useCallback(
        (row) => {
            if (!row?.id) {
                console.warn("No se encontró id para la fila seleccionada", row);
                return;
            }
            navigate(`/tesorero/revisar/${row.id}`);
        },
        [navigate]
    );

    const tableData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.map((item) => {
            const firstName =
                getFirstValue(item.user || {}, ["first_name"]) ||
                getFirstValue(item, ["nombre", "first_name"]) ||
                "";
            const lastName =
                getFirstValue(item.user || {}, ["last_name"]) ||
                getFirstValue(item, ["apellido", "apellidos", "last_name"]) ||
                "";
            const nombre = `${firstName} ${lastName}`.trim() || "-";
            const rut = getFirstValue(item, ["rut", "rut_bombero", "documento"]) || "-";
            const bomberoId =
                getFirstValue(item, [
                    "bombero_id",
                    "bomberoId",
                    "usuario_id",
                    "user_id",
                    "userId",
                    "id",
                    "pk",
                ]) ||
                getFirstValue(item.user || {}, ["id", "pk"]);
            const totalPagadasRaw = getFirstValue(item, [
                "total_pagadas",
                "pagadas",
                "cuotas_pagadas",
            ]);
            const totalPendientesRaw = getFirstValue(item, [
                "total_pendientes",
                "pendientes",
                "cuotas_pendientes",
            ]);

            const totalPagadas = Number(totalPagadasRaw);
            const totalPendientes = Number(totalPendientesRaw);
            const morosoRaw = getFirstValue(item, ["isMoroso", "moroso", "es_moroso", "debe_consejo"]);

            return {
                id: bomberoId,
                nombre,
                rut,
                totalPagadas: Number.isFinite(totalPagadas) ? totalPagadas : 0,
                totalPendientes: Number.isFinite(totalPendientes) ? totalPendientes : 0,
                isMoroso: isTruthLike(morosoRaw),
            };
        });
    }, [data]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "nombre",
                header: "Nombre",
                cell: (info) => <span className="font-bold text-slate-700 dark:text-slate-200">{info.getValue()}</span>
            },
            {
                accessorKey: "rut",
                header: "Rut",
            },
            {
                accessorKey: "totalPagadas",
                header: "Pagadas",
                cell: (info) => (
                    <span className="font-black text-green-600 dark:text-green-400">
                        {formatNumeric(info.getValue())}
                    </span>
                ),
            },
            {
                accessorKey: "totalPendientes",
                header: "Pendientes",
                cell: (info) => (
                    <span className="font-black text-amber-600 dark:text-amber-400">
                        {formatNumeric(info.getValue())}
                    </span>
                ),
            },
            {
                accessorKey: "isMoroso",
                header: "Estado",
                cell: (info) => {
                    const moroso = isTruthLike(info.getValue());
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-3 h-3 rounded-full ${moroso ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"}`}
                            />
                            <span className={`text-xs font-black uppercase tracking-wider ${moroso ? "text-red-600" : "text-green-600"}`}>
                                {moroso ? "Consejo" : "Al día"}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "acciones",
                header: "Acciones",
                cell: (info) => (
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                        onClick={() => handleVerMas(info.row.original)}
                    >
                        <Eye size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                        Ver detalle
                    </button>
                ),
            },
        ],
        [handleVerMas]
    );

    const shouldRenderTable = Array.isArray(data);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 sm:p-3 bg-red-50 dark:!bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                            <Users size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Revisar Cuotas</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">Estado general de pagos de la compañía</p>
                        </div>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 rounded-2xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {isLoading && (
                        <div className="p-12 md:p-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight text-sm md:text-base">Cargando resumen de cuotas...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="p-4 md:p-10">
                            <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-red-50 dark:!bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl md:rounded-3xl border border-red-100 dark:border-red-900/30">
                                <AlertTriangle className="shrink-0" size={24} />
                                <p className="font-bold text-sm md:text-base">{error?.message || "Ocurrió un error al obtener el resumen."}</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isError && shouldRenderTable && (
                        <div className="p-0.5 sm:p-1 overflow-x-auto">
                            <Tabla data={tableData} columns={columns} pageSize={20} />
                        </div>
                    )}

                    {!isLoading && !isError && !shouldRenderTable && (
                        <div className="p-12 md:p-20 text-center text-slate-400 dark:text-slate-600 font-medium text-sm md:text-base">
                            No hay información de cuotas para mostrar.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default RevisarCuotas;
