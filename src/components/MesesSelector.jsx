import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];

const groupByYear = (meses) => {
    return meses.reduce((acc, mes) => {
        const year = mes.anio;
        if (!acc[year]) acc[year] = [];
        acc[year].push(mes);
        return acc;
    }, {});
};

const MesesSelector = ({ value, onChange, name, error, bomberoId = null }) => {
    const { data: meses, isLoading } = useQuery({
        queryKey: ['meses-anio'],
        queryFn: () => fetchWithToken('/meses-anio/')
    });

    const { data: mesesPagados } = useQuery({
        queryKey: ['meses-pagados', bomberoId],
        queryFn: () => {
            if (!bomberoId) return Promise.resolve([]);
            return fetchWithToken(`/meses-anio/meses_pagados_por_bombero/${bomberoId}/`);
        },
        enabled: !!bomberoId
    });

    const handleToggle = (id) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    if (isLoading || !meses) return <div>Cargando meses...</div>;

    const pagadosIds = (mesesPagados || []).map((m) => m.id);
    const grouped = groupByYear(meses);

    return (
        <div className="form-group">
            <label className="form-label">Meses pagados</label>
            {Object.entries(grouped)
                .sort(([anioA], [anioB]) => Number(anioA) - Number(anioB))
                .map(([anio, mesesDelAnio]) => {
                    const mesesOrdenados = [...mesesDelAnio].sort(
                        (a, b) => Number(a.mes) - Number(b.mes)
                    );

                    return (
                        <div key={anio} className="mb-2">
                            <strong>{anio}</strong>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                                {mesesOrdenados.map((mes) => {
                                    const monthIndex = Number(mes.mes) - 1;
                                    const nombreMes = MONTH_NAMES[monthIndex] || mes.mes;

                                    return (
                                        <div key={mes.id} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`mes-${mes.id}`}
                                                checked={value.includes(mes.id)}
                                                onChange={() => handleToggle(mes.id)}
                                                disabled={pagadosIds.includes(mes.id)}
                                            />
                                            <label className="form-check-label" htmlFor={`mes-${mes.id}`}>
                                                {nombreMes} {anio} {pagadosIds.includes(mes.id) && '(ya pagado)'}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            {error && <div className="text-danger mt-1">{error.message}</div>}
        </div>
    );
};

export default MesesSelector;
