import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { useResumenCuotas } from "../../hooks/useResumenCuotas";

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
            },
            {
                accessorKey: "rut",
                header: "Rut",
            },
            {
                accessorKey: "totalPagadas",
                header: "Total Pagadas",
                cell: (info) => formatNumeric(info.getValue()),
            },
            {
                accessorKey: "totalPendientes",
                header: "Total Pendientes",
                cell: (info) => formatNumeric(info.getValue()),
            },
            {
                accessorKey: "isMoroso",
                header: "Pasar a consejo",
                cell: (info) => {
                    const moroso = isTruthLike(info.getValue());
                    const color = moroso ? "#dc3545" : "#198754";
                    return (
                        <span
                            aria-label={moroso ? "Moroso" : "Al día"}
                            title={moroso ? "Moroso" : "Al día"}
                            style={{
                                display: "inline-block",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                backgroundColor: color,
                            }}
                        />
                    );
                },
            },
            {
                id: "acciones",
                header: "Acciones",
                cell: (info) => (
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleVerMas(info.row.original)}
                    >
                        Ver más
                    </button>
                ),
            },
        ],
        [handleVerMas]
    );

    const shouldRenderTable = Array.isArray(data);

    return (
        <Layout>
            <div className="container rounded shadow-sm bg-white p-4">
                <h2 className="mb-4">Revisar cuotas bomberos</h2>
                {isLoading && <div>Cargando resumen...</div>}
                {isError && (
                    <div className="alert alert-danger" role="alert">
                        {error?.message || "Ocurrió un error al obtener el resumen."}
                    </div>
                )}
                {!isLoading && !isError && shouldRenderTable && (
                    <Tabla data={tableData} columns={columns} pageSize={20} />
                )}
                {!isLoading && !isError && !shouldRenderTable && (
                    <div className="alert alert-info" role="alert">
                        No hay información de cuotas para mostrar.
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default RevisarCuotas;
