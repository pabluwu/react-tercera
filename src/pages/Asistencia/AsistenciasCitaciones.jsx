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

const AsistenciasCitaciones = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["listas-asistencias", "citaciones"],
    queryFn: () => fetchWithToken("/listas-asistencia/"),
    staleTime: 5 * 60 * 1000,
  });

  const citaciones = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item.tipo === "citacion");
  }, [data]);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h2 className="mb-1">Asistencias de citaciones</h2>
            <p className="text-muted mb-0">
              Consulta las listas de asistencia generadas para cada citación
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
        ) : citaciones.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No se encontraron listas de asistencia para citaciones.
          </div>
        ) : (
          <Tabla
            data={citaciones}
            columns={[
              {
                accessorKey: "evento.id",
                header: "ID evento",
                cell: (info) => info.row.original.evento?.id ?? "—",
              },
              {
                accessorKey: "evento.nombre",
                header: "Nombre",
                cell: (info) => info.row.original.evento?.nombre ?? "—",
              },
              {
                accessorKey: "evento.fecha",
                header: "Fecha",
                cell: (info) => formatFecha(info.row.original.evento?.fecha),
              },
              {
                accessorKey: "evento.lugar",
                header: "Lugar",
                cell: (info) => info.row.original.evento?.lugar ?? "—",
              },
              {
                id: "acciones",
                header: "Acciones",
                cell: (info) => {
                  const eventoId = info.row.original.evento?.id;
                  if (!eventoId) return "—";

                  return (
                    <div className="d-flex justify-content-center">
                      <Link
                        to={`/asistencia/resumen/${eventoId}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Resumen citación
                      </Link>
                    </div>
                  );
                },
              },
            ]}
            pageSize={8}
          />
        )}
      </div>
    </Layout>
  );
};

export default AsistenciasCitaciones;
