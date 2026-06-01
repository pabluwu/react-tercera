import { User, Search, CheckCircle2, Circle } from 'lucide-react';

const BomberoSelector = ({ usuarios, filtro, onFiltroChange, register, watch }) => {
    const selectedBomberos = watch('bomberos') || [];
    
    const filtrados = (usuarios || []).filter((u) => {
        return (`${u?.user.first_name} ${u?.user.last_name}`.toLowerCase().includes(filtro.toLowerCase()))
    });

    return (
        <div className="col-span-full space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                    <User size={16} /> Seleccionar Bomberos
                </label>
                <div className="relative w-full md:w-72">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                    </span>
                    <input
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 dark:!bg-slate-800 dark:text-white"
                        value={filtro}
                        onChange={(e) => onFiltroChange(e.target.value)}
                        placeholder="Buscar por nombre..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {filtrados.length > 0 ? (
                    filtrados.map((user) => {
                        const isSelected = selectedBomberos.includes(user?.user.id.toString()) || selectedBomberos.includes(user?.user.id);
                        
                        return (
                            <label 
                                key={user.id} 
                                className={`
                                    relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
                                    ${isSelected 
                                        ? 'bg-blue-50 dark:!bg-blue-900/20 border-blue-500 shadow-md shadow-blue-100 dark:shadow-none' 
                                        : '!bg-white dark:!bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    {...register('bomberos')}
                                    value={user?.user.id}
                                />
                                
                                <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:!bg-slate-800 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400'}`}>
                                    <User size={20} />
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {user?.user.first_name} {user?.user.last_name}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                        Voluntario
                                    </span>
                                </div>

                                <div className="ml-auto">
                                    {isSelected ? (
                                        <CheckCircle2 size={18} className="text-blue-500 animate-in zoom-in duration-200" />
                                    ) : (
                                        <Circle size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-200 transition-colors" />
                                    )}
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:!bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Search size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No se encontraron bomberos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BomberoSelector;
