import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "../api/fetchWithToken";

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

export const useMesesGrouped = (bomberoId, enabled, canSeeOthers) => {
  const mesesQuery = useQuery({
    queryKey: ["meses-anio"],
    queryFn: () => fetchWithToken("/meses-anio/"),
    enabled,
  });

  const mesesPagadosQuery = useQuery({
    queryKey: ["meses-pagados", bomberoId],
    queryFn: () =>
      fetchWithToken(`/meses-anio/meses_pagados_por_bombero/${bomberoId}/`),
    enabled,
  });

  const { data: meses } = mesesQuery;
  const { data: mesesPagados } = mesesPagadosQuery;

  const pagadosSet = new Set(
    Array.isArray(mesesPagados) ? mesesPagados.map((mes) => mes.id) : []
  );

  const grouped = Array.isArray(meses)
    ? meses.reduce(
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
      )
    : { years: new Set(), dataByYear: {} };

  const years = Array.from(grouped.years).sort(
    (a, b) => Number(a) - Number(b)
  );

  return {
    years,
    dataByYear: grouped.dataByYear,
    mesesQuery,
    mesesPagadosQuery,
  };
};
