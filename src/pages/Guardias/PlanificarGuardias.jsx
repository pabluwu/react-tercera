import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { fetchWithToken } from '../../api/fetchWithToken';
import { Calendar as CalendarIcon, Users, User, SteeringWheel, Plus, Trash2, Download, Save, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    addMonths, 
    subMonths, 
    startOfWeek, 
    endOfWeek,
    isSameMonth,
    getYear,
    getMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para select con buscador simple
const SearchSelect = ({ options, value, onChange, placeholder, label, emptyLabel = "No se encontraron resultados" }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (selectedOption) {
            setSearch(selectedOption.label);
        } else {
            setSearch('');
        }
    }, [value, selectedOption]);

    return (
        <div className="relative flex-1">
            {label && <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{label}</label>}
            <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 dark:text-slate-200"
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => {
                    // Retraso para permitir click en las opciones
                    setTimeout(() => {
                        setIsOpen(false);
                        if (selectedOption) {
                            setSearch(selectedOption.label);
                        } else {
                            setSearch('');
                        }
                    }, 200);
                }}
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg custom-scrollbar">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-2.5 text-xs text-slate-400 italic">{emptyLabel}</div>
                    ) : (
                        filteredOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                                onMouseDown={() => {
                                    onChange(opt.value);
                                    setSearch(opt.label);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default function PlanificarGuardias() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDays, setSelectedDays] = useState([]); // Array de objetos Date
    const [formData, setFormData] = useState({}); // { "2026-06-12": { oficial_id, conductor_id, bomberos_ids: [] } }
    
    const [oficiales, setOficiales] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [bomberos, setBomberos] = useState([]);
    
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const today = new Date();
    const currentYear = getYear(today);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Cargar listas de personal
    useEffect(() => {
        const fetchPersonal = async () => {
            try {
                setLoadingData(true);
                const [oficialesRes, conductoresRes, bomberosRes] = await Promise.all([
                    fetchWithToken('/guardias/oficiales-disponibles/'),
                    fetchWithToken('/guardias/conductores-disponibles/'),
                    fetchWithToken('/guardias/bomberos-disponibles/')
                ]);
                
                const mapUser = u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` + (u.cargo ? ` (${u.cargo})` : '') });
                setOficiales(oficialesRes.map(mapUser));
                setConductores(conductoresRes.map(mapUser));
                setBomberos(bomberosRes.map(mapUser));

                // Cargar guardias existentes para el mes seleccionado
                const y = getYear(currentMonth);
                const m = getMonth(currentMonth) + 1;
                const guardiasExistentes = await fetchWithToken(`/guardias/rango/?fecha-inicio=${format(monthStart, 'yyyy-MM-dd')}&fecha-fin=${format(monthEnd, 'yyyy-MM-dd')}`);
                
                const initialDays = [];
                const initialFormData = {};
                
                if (Array.isArray(guardiasExistentes)) {
                    guardiasExistentes.forEach(g => {
                        const dateObj = new Date(g.fecha + 'T00:00:00');
                        initialDays.push(dateObj);
                        initialFormData[g.fecha] = {
                            oficial_id: g.oficial?.id || '',
                            conductor_id: g.conductor?.id || '',
                            bomberos_ids: g.bomberos?.map(b => b.id) || [],
                            es_borrador: g.es_borrador || false
                        };
                    });
                }
                
                setSelectedDays(initialDays);
                setFormData(initialFormData);
            } catch (error) {
                console.error("Error cargando datos:", error);
                toast.error("Error al cargar los datos del personal.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchPersonal();
    }, [currentMonth]);

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    // Toggle day selection
    const handleDayClick = (day) => {
        if (!isSameMonth(day, monthStart)) return;

        const dateStr = format(day, 'yyyy-MM-dd');
        const isSelected = selectedDays.some(d => isSameDay(d, day));

        if (isSelected) {
            setSelectedDays(selectedDays.filter(d => !isSameDay(d, day)));
            const newFormData = { ...formData };
            delete newFormData[dateStr];
            setFormData(newFormData);
        } else {
            setSelectedDays([...selectedDays, day].sort((a,b) => a - b));
            setFormData({
                ...formData,
                [dateStr]: {
                    oficial_id: '',
                    conductor_id: '',
                    bomberos_ids: [''], // Comienza con un input vacío para bombero
                    es_borrador: false
                }
            });
        }
    };

    const handleFormChange = (dateStr, field, value) => {
        setFormData({
            ...formData,
            [dateStr]: {
                ...formData[dateStr],
                [field]: value
            }
        });
    };

    const handleBomberoChange = (dateStr, idx, value) => {
        const currentIds = [...formData[dateStr].bomberos_ids];
        currentIds[idx] = value;
        handleFormChange(dateStr, 'bomberos_ids', currentIds);
    };

    const addBomberoRow = (dateStr) => {
        const currentIds = [...formData[dateStr].bomberos_ids];
        currentIds.push('');
        handleFormChange(dateStr, 'bomberos_ids', currentIds);
    };

    const removeBomberoRow = (dateStr, idx) => {
        const currentIds = [...formData[dateStr].bomberos_ids];
        currentIds.splice(idx, 1);
        handleFormChange(dateStr, 'bomberos_ids', currentIds);
    };

    const saveGuardias = async (isDraft = false) => {
        setSaving(true);
        try {
            const daysPayload = Object.entries(formData).map(([dateStr, details]) => ({
                fecha: dateStr,
                oficial_id: details.oficial_id || null,
                conductor_id: details.conductor_id || null,
                bomberos_ids: details.bomberos_ids.filter(id => id !== ''),
                es_borrador: isDraft
            }));

            const payload = {
                anio: getYear(currentMonth),
                mes: getMonth(currentMonth) + 1,
                days: daysPayload,
                es_borrador: isDraft
            };

            await fetchWithToken('/guardias/bulk-save/', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Actualizar localmente el estado de borrador para los días guardados
            const updatedFormData = { ...formData };
            Object.keys(updatedFormData).forEach(key => {
                if (updatedFormData[key]) {
                    updatedFormData[key].es_borrador = isDraft;
                }
            });
            setFormData(updatedFormData);

            if (isDraft) {
                toast.success("¡Borrador de guardias guardado correctamente!");
            } else {
                toast.success("¡Planificación de guardias publicada y guardada correctamente!");
            }
        } catch (error) {
            console.error("Error guardando guardias:", error);
            toast.error("Ocurrió un error al guardar la planificación.");
        } finally {
            setSaving(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const mesStr = format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(220, 38, 38); // Rojo bomberos
        doc.text("PLANIFICACIÓN DE GUARDIAS NOCTURNAS", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`PERIODO: ${mesStr}`, 14, 28);

        const tableRows = [];
        selectedDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const data = formData[dateStr];
            if (!data) return;

            const oficialLabel = oficiales.find(o => String(o.value) === String(data.oficial_id))?.label || 'PENDIENTE';
            const conductorLabel = conductores.find(c => String(c.value) === String(data.conductor_id))?.label || 'PENDIENTE';
            const bomberosLabels = data.bomberos_ids
                .map(id => bomberos.find(b => String(b.value) === String(id))?.label)
                .filter(Boolean)
                .join('\n');

            tableRows.push([
                format(day, 'EEEE dd/MM', { locale: es }).toUpperCase(),
                oficialLabel,
                conductorLabel,
                bomberosLabels || 'SIN ASIGNAR'
            ]);
        });

        doc.autoTable({
            startY: 35,
            head: [['FECHA', 'OFICIAL A CARGO', 'CONDUCTOR', 'BOMBEROS DE GUARDIA']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38], halign: 'center' },
            columnStyles: {
                0: { fontStyle: 'bold', width: 35 },
                1: { width: 50 },
                2: { width: 50 },
                3: { width: 55 }
            },
            styles: { fontSize: 9, cellPadding: 4, valign: 'middle' }
        });

        doc.save(`guardias_${format(currentMonth, 'MMMM_yyyy', { locale: es })}.pdf`);
        toast.info("PDF generado e iniciado descarga.");
    };

    return (
        <Layout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Planificar Guardias</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Selecciona los días en el calendario y asigna oficiales, conductores y personal para el mes de guardia.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={exportToPDF}
                            disabled={selectedDays.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                            <span>Exportar PDF</span>
                        </button>
                        <button 
                            onClick={() => saveGuardias(true)}
                            disabled={saving || selectedDays.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>Guardar Borrador</span>
                        </button>
                        <button 
                            onClick={() => saveGuardias(false)}
                            disabled={saving || selectedDays.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>Publicar Guardias</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Calendario de Selección */}
                    <div className="lg:col-span-5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                                    </h4>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-px mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                                <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sá</div><div>Do</div>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-1.5">
                                {calendarDays.map((day, idx) => {
                                    const isCurrent = isSameMonth(day, monthStart);
                                    const isSelected = selectedDays.some(d => isSameDay(d, day));
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isDraft = formData[dateStr]?.es_borrador;
                                    
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!isCurrent}
                                            onClick={() => handleDayClick(day)}
                                            className={`h-11 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all ${
                                                !isCurrent 
                                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-20' 
                                                    : isSelected
                                                        ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none'
                                                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            <span>{format(day, 'd')}</span>
                                            {isCurrent && isDraft && (
                                                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Formularios por día seleccionado */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Asignación de Roles por Día</h3>

                        {loadingData ? (
                            <div className="flex items-center gap-2 text-slate-400 py-12">
                                <Loader2 className="animate-spin" />
                                <span>Cargando datos y guardias...</span>
                            </div>
                        ) : selectedDays.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 italic">No has seleccionado ningún día en el calendario.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedDays.map((day) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const data = formData[dateStr];
                                    if (!data) return null;

                                    return (
                                        <div key={dateStr} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 animate-in slide-in-from-bottom duration-200">
                                            {/* Cabecera del Día */}
                                            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 dark:text-white capitalize">
                                                        {format(day, 'EEEE dd MMMM', { locale: es })}
                                                    </h4>
                                                    {data.es_borrador && (
                                                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 rounded-full">
                                                            Borrador
                                                        </span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleDayClick(day)}
                                                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    title="Remover día"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Oficial y Conductor */}
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <SearchSelect
                                                    label="Oficial a Cargo"
                                                    placeholder="Buscar oficial..."
                                                    options={oficiales}
                                                    value={data.oficial_id}
                                                    onChange={(val) => handleFormChange(dateStr, 'oficial_id', val)}
                                                    emptyLabel="No hay oficiales de turno"
                                                />
                                                <SearchSelect
                                                    label="Conductor Autorizado"
                                                    placeholder="Buscar conductor..."
                                                    options={conductores}
                                                    value={data.conductor_id}
                                                    onChange={(val) => handleFormChange(dateStr, 'conductor_id', val)}
                                                    emptyLabel="No hay conductores habilitados"
                                                />
                                            </div>

                                            {/* Bomberos de Guardia */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bomberos de Guardia</label>
                                                    <button 
                                                        onClick={() => addBomberoRow(dateStr)}
                                                        className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-500 font-bold hover:underline"
                                                    >
                                                        <Plus size={14} /> Añadir Bombero
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {data.bomberos_ids.map((bomberoId, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 animate-in fade-in duration-100">
                                                            <SearchSelect
                                                                placeholder="Buscar bombero..."
                                                                options={bomberos}
                                                                value={bomberoId}
                                                                onChange={(val) => handleBomberoChange(dateStr, idx, val)}
                                                            />
                                                            {data.bomberos_ids.length > 1 && (
                                                                <button
                                                                    onClick={() => removeBomberoRow(dateStr, idx)}
                                                                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
