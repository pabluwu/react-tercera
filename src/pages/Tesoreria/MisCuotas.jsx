import { useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { useMesesGrouped } from "../../hooks/useMesesGrouped";
import useAuthStore from "../../store/useAuthStore";

const columns = [
  {
    accessorKey: "mes",
    header: "Mes",
  },
  {
    accessorKey: "estadoLabel",
    header: "Estado",
    cell: (info) => {
      const pagado = info.row.original.pagado;
      const className = pagado ? "bg-success" : "bg-warning text-dark";
      return (
        <span className={`badge ${className}`}>
          {pagado ? "Pagado" : "Pendiente"}
        </span>
      );
    },
  },
];

const MisCuotas = () => {
  const user = useAuthStore((state) => state.user);
  const ownId = user?.id ? String(user.id) : null;

  const [selectedYear, setSelectedYear] = useState(null);

  const { years, dataByYear, mesesQuery, mesesPagadosQuery } = useMesesGrouped(
    ownId,
    !!ownId,
    false
  );

  useEffect(() => {
    if (!years || years.length === 0) return;
    setSelectedYear((prev) => (prev && years.includes(prev) ? prev : years[0]));
  }, [years]);

  const datosTabla = useMemo(() => {
    if (!selectedYear) return [];
    const datos = dataByYear[selectedYear] || [];
    return [...datos].sort((a, b) => a.numeroMes - b.numeroMes);
  }, [selectedYear, dataByYear]);

  const isLoading = mesesQuery.isLoading || mesesPagadosQuery.isLoading;
  const hasError = mesesQuery.isError || mesesPagadosQuery.isError;
  const errorMessage =
    mesesQuery.error?.message ||
    mesesPagadosQuery.error?.message ||
    "No se pudo obtener la información.";

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <h2 className="mb-4">Mis cuotas</h2>

        {!ownId && (
          <div className="alert alert-danger">
            No se encontró la información de tu usuario.
          </div>
        )}

        {isLoading && <div>Cargando información de tus cuotas...</div>}

        {hasError && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {!isLoading && !hasError && years.length > 0 && (
          <>
            <div className="btn-group mb-3" role="group" aria-label="Seleccionar año">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`btn btn-sm ${
                    year === selectedYear ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>

            <Tabla data={datosTabla} columns={columns} pageSize={12} />
          </>
        )}

        {!isLoading && !hasError && years.length === 0 && (
          <div className="alert alert-info">
            No se encontraron registros de cuotas para tu usuario.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MisCuotas;
