import { Hash, Calendar, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const EmergenciaForm = ({ register }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Hash size={16} /> Clave
            </label>
            <input 
                placeholder="Ej: 10-0-1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                {...register('clave')} 
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Calendar size={16} /> Fecha y Hora
            </label>
            <input 
                type="datetime-local" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                {...register('fecha')} 
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Truck size={16} /> Unidades
            </label>
            <input 
                placeholder="Ej: B-1, R-1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                {...register('unidades')} 
            />
        </div>

        <div className="flex items-end pb-1">
            <label className="relative flex items-center gap-3 p-3 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    id="is_declarado" 
                    {...register('is_declarado')} 
                />
                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all peer-checked:border-amber-500 peer-checked:bg-amber-500 text-transparent peer-checked:text-white">
                    <CheckCircle2 size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-500" />
                        Es X1 (Declarado)
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Marcado como emergencia mayor</span>
                </div>
            </label>
        </div>
    </div>
);

export default EmergenciaForm;