import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { fetchWithToken } from "../../api/fetchWithToken";
import { format } from "date-fns";

const formatFecha = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return format(date, "yyyy-MM-dd HH:mm");
};

const AsistenciasEmergencias = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["listas-asistencias", "emergencias"],
    queryFn: () => fetchWithToken("/listas-asistencia/?content_type=emergencia"),
    staleTime: 5 * 60 * 1000,
  });

  const emergencias = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item.tipo === "emergencia");
  }, [data]);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h2 className="mb-1">Asistencias de emergencias</h2>
            <p className="text-muted mb-0">
              Consulta las listas de asistencia generadas para cada emergencia
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
            <Link to="/lista/crear" className="btn btn-primary btn-sm">
              Nueva lista
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div>Cargando listas de asistencia...</div>
        ) : isError ? (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la información de asistencia."}
          </div>
        ) : emergencias.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No se encontraron listas de asistencia para emergencias.
          </div>
        ) : (
          <Tabla
            data={emergencias}
            columns={[
              {
                accessorKey: "evento.id",
                header: "ID evento",
                cell: (info) => info.row.original.evento?.id ?? "—",
              },
              {
                accessorKey: "evento.clave",
                header: "Clave",
                cell: (info) => info.row.original.evento?.clave ?? "—",
              },
              {
                accessorKey: "evento.fecha",
                header: "Fecha",
                cell: (info) => formatFecha(info.row.original.evento?.fecha),
              },
              {
                accessorKey: "evento.unidades",
                header: "Unidades",
                cell: (info) => info.row.original.evento?.unidades ?? "—",
              },
              {
                id: "acciones",
                header: "Acciones",
                cell: (info) => (
                  <div className="d-flex justify-content-center">
                    <Link
                      to={`/asistencia/detalle/emergencia/${info.row.original.evento?.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Ver detalle
                    </Link>
                  </div>
                ),
              },
            ]}
            pageSize={8}
          />
        )}
      </div>
    </Layout>
  );
};

export default AsistenciasEmergencias;
