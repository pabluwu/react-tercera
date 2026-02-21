import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "../../layout/Layout";
import Tabla from "../../components/Tabla";
import { fetchWithToken } from "../../api/fetchWithToken";
import useAuthStore from "../../store/useAuthStore";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const RevisarCuotaDetalleBombero = () => {
  const { id: bomberoId } = useParams();
  const user = useAuthStore((state) => state.user);

  const ownId = user?.id ? String(user.id) : null;
  const requestedId = bomberoId ? String(bomberoId) : null;
  const canSeeOthers = user?.permissions?.includes(
    "bomberos.add_comprobantetesorero"
  );

  const shouldRestrict =
    !canSeeOthers && requestedId && requestedId !== ownId;

  const targetBomberoId = canSeeOthers
    ? requestedId || ownId
    : ownId;

  const queryEnabled = !shouldRestrict && !!targetBomberoId;

  const {
    data: meses,
    isLoading: isLoadingMeses,
    isError: isErrorMeses,
    error: errorMeses,
  } = useQuery({
    queryKey: ["meses-anio"],
    queryFn: () => fetchWithToken("/meses-anio/"),
    enabled: !shouldRestrict,
  });

  const {
    data: mesesPagados,
    isLoading: isLoadingPagados,
    isError: isErrorPagados,
    error: errorPagados,
  } = useQuery({
    queryKey: ["meses-pagados", targetBomberoId],
    queryFn: () =>
      fetchWithToken(`/meses-anio/meses_pagados_por_bombero/${targetBomberoId}/`),
    enabled: queryEnabled,
  });

  const { years, dataByYear } = useMemo(() => {
    if (!Array.isArray(meses)) {
      return { years: [], dataByYear: {} };
    }

    const pagadosSet = new Set(
      Array.isArray(mesesPagados) ? mesesPagados.map((mes) => mes.id) : []
    );

    const acumulado = meses.reduce(
      (acc, mes) => {
        const year = String(mes.anio);
        const monthNumber = Number(mes.mes);
        const monthName = MONTH_NAMES[monthNumber - 1] || mes.mes;

        if (!acc.dataByYear[year]) {
          acc.dataByYear[year] = [];
          acc.years.add(year);
        }

        acc.dataByYear[year].push({
          id: mes.id,
          mes: monthName,
          numeroMes: monthNumber,
          estadoLabel: pagadosSet.has(mes.id) ? "Pagado" : "Pendiente",
          pagado: pagadosSet.has(mes.id),
        });

        return acc;
      },
      { years: new Set(), dataByYear: {} }
    );

    const sortedYears = Array.from(acumulado.years).sort(
      (a, b) => Number(a) - Number(b)
    );

    return { years: sortedYears, dataByYear: acumulado.dataByYear };
  }, [meses, mesesPagados]);

  const [selectedYear, setSelectedYear] = useState(
    () => (years && years.length > 0 ? years[0] : null)
  );

  useEffect(() => {
    if (!years || years.length === 0) return;
    if (!selectedYear || !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const datosTabla = useMemo(() => {
    if (!selectedYear) return [];
    const datos = dataByYear[selectedYear] || [];
    return [...datos].sort((a, b) => a.numeroMes - b.numeroMes);
  }, [selectedYear, dataByYear]);

  const columns = useMemo(
    () => [
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
    ],
    []
  );

  if (shouldRestrict) {
    return ownId ? (
      <Navigate to={`/tesorero/revisar/${ownId}`} replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  const isLoading = isLoadingMeses || isLoadingPagados;
  const hasError = isErrorMeses || isErrorPagados;
  const errorMessage =
    errorMeses?.message || errorPagados?.message || "No se pudo obtener la información.";

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <h2 className="mb-4">Detalle de cuotas del bombero</h2>

        {!targetBomberoId && (
          <div className="alert alert-danger">
            No se proporcionó un identificador de bombero.
          </div>
        )}

        {isLoading && <div>Cargando información de cuotas...</div>}

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
            No hay registros de meses para mostrar.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RevisarCuotaDetalleBombero;
