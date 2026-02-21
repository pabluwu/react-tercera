import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "../api/fetchWithToken";

export const useCuotasPorBombero = (bomberoId, enabled = true) => {
  return useQuery({
    queryKey: ["meses-pagados", bomberoId],
    queryFn: () =>
      fetchWithToken(`/meses-anio/meses_pagados_por_bombero/${bomberoId}/`),
    enabled: enabled && !!bomberoId,
  });
};
