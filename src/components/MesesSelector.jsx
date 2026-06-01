import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';
import { Calendar, CheckCircle2, Lock, AlertCircle, Loader2 } from 'lucide-react';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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

    if (isLoading || !meses) return (
        <div className="flex items-center gap-2 text-slate-500 py-4 font-medium">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            <span>Cargando meses disponibles...</span>
        </div>
    );

    const pagadosIds = (mesesPagados || []).map((m) => m.id);
    const grouped = groupByYear(meses);

    return (
        <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Calendar size={16} /> Meses a Pagar
            </label>

            <div className="space-y-8">
                {Object.entries(grouped)
                    .sort(([anioA], [anioB]) => Number(anioA) - Number(anioB))
                    .map(([anio, mesesDelAnio]) => {
                        const mesesOrdenados = [...mesesDelAnio].sort(
                            (a, b) => Number(a.mes) - Number(b.mes)
                        );

                        return (
                            <div key={anio} className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-lg font-black text-slate-300 dark:text-slate-700 tabular-nums leading-none">
                                        {anio}
                                    </span>
                                    <div className="h-[1px] flex-grow bg-slate-100 dark:!bg-slate-800"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {mesesOrdenados.map((mes) => {
                                        const monthIndex = Number(mes.mes) - 1;
                                        const nombreMes = MONTH_NAMES[monthIndex] || mes.mes;
                                        const isPaid = pagadosIds.includes(mes.id);
                                        const isSelected = value.includes(mes.id);

                                        return (
                                            <button
                                                key={mes.id}
                                                type="button"
                                                disabled={isPaid}
                                                onClick={() => handleToggle(mes.id)}
                                                className={`
                                                    relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center group
                                                    ${isPaid 
                                                        ? 'bg-slate-50 dark:!bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed' 
                                                        : isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none translate-y-[-2px]'
                                                        : '!bg-white dark:!bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600'
                                                    }
                                                `}
                                            >
                                                <span className={`text-xs uppercase font-bold tracking-wider mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    Mes {mes.mes}
                                                </span>
                                                <span className="font-bold">{nombreMes}</span>
                                                
                                                <div className="absolute top-2 right-2">
                                                    {isPaid ? (
                                                        <Lock size={12} className="text-slate-400" />
                                                    ) : isSelected ? (
                                                        <CheckCircle2 size={16} className="text-white animate-in zoom-in duration-300" />
                                                    ) : null}
                                                </div>

                                                {isPaid && (
                                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                                                        Pagado
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 dark:!bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                    <AlertCircle size={16} />
                    <span className="text-sm font-semibold">{error.message}</span>
                </div>
            )}
        </div>
    );
};

export default MesesSelector;
