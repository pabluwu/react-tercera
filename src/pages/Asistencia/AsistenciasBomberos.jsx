import { useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { usePerfiles } from "../../hooks/usePerfiles";

const buildRows = (perfiles) => {
  if (!Array.isArray(perfiles)) return [];

  return perfiles.map((perfil) => {
    const user = perfil.user || {};
    return {
      id: user.id ?? perfil.id ?? "-",
      nombre: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Sin nombre",
      rut: perfil.rut || "—",
    };
  });
};

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "rut",
    header: "RUT",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: (info) => (
      <div className="d-flex justify-content-center">
        <Link
          to={`/asistencia/bombero/${info.row.original.id}`}
          className="btn btn-outline-primary btn-sm"
        >
          Ver detalle
        </Link>
      </div>
    ),
  },
];

const AsistenciasBomberos = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = usePerfiles();

  const rows = useMemo(() => buildRows(data), [data]);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h2 className="mb-1">Asistencias por bomberos</h2>
            <p className="text-muted mb-0">
              Consulta la información de los bomberos registrados para gestionar su asistencia
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            {isFetching ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {isLoading ? (
          <div>Cargando bomberos...</div>
        ) : isError ? (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la información de bomberos."}
          </div>
        ) : rows.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No se encontraron bomberos registrados.
          </div>
        ) : (
          <Tabla data={rows} columns={columns} pageSize={10} />
        )}
      </div>
    </Layout>
  );
};

export default AsistenciasBomberos;
