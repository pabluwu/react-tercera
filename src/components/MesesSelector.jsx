import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

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

    const pagadosIds = (mesesPagados || []).map(m => m.id);
    const grouped = groupByYear(meses);

    return (
        <div className="form-group">
            <label className="form-label">Meses pagados</label>
            {Object.entries(grouped).map(([anio, meses]) => (
                <div key={anio} className="mb-2">
                    <strong>{anio}</strong>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                        {meses.map((mes) => (
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
                                    {mes.mes} {anio} {pagadosIds.includes(mes.id) && '(ya pagado)'}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {error && <div className="text-danger mt-1">{error.message}</div>}
        </div>
    );
};

export default MesesSelector;
