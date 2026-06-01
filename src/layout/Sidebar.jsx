import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { isTesorero, isAyudanteOrSecretario, isOficial } from '../auth/roleUtils';
import { 
    Home, 
    User, 
    ChevronDown, 
    Shield, 
    LibraryBig, 
    ScrollText, 
    Activity, 
    CircleDollarSign, 
    ClipboardCheck, 
    Package, 
    X, 
    Menu,
    LayoutDashboard
} from 'lucide-react';

const Sidebar = () => {
    const [openKeys, setOpenKeys] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { user } = useAuthStore();
    const userIsTesorero = isTesorero(user);
    const userPuedeCrearCitacion = isAyudanteOrSecretario(user);
    const userEsOficial = isOficial(user);

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        {
            key: 'personal',
            label: 'Personal',
            icon: <User size={20} />,
            children: [
                {
                    key: 'mi-perfil',
                    label: 'Mi perfil',
                    path: user ? `/bombero/${user.id}` : '#',
                },
            ],
        },
        {
            key: 'listas', label: 'Listas', icon: <ScrollText size={20} />,
            children: [
                userPuedeCrearCitacion && { key: 'crear', label: 'Crear lista', path: '/lista/crear' },
                { key: 'list', label: 'Ver listas', path: '/lista/list' },
            ].filter(Boolean),
        },
        {
            key: 'citaciones', label: 'Citaciones', icon: <Activity size={20} />,
            children: [
                userPuedeCrearCitacion && { key: 'crear', label: 'Crear citación', path: '/citaciones/crear' },
                { key: 'list', label: 'Ver citaciones', path: '/citaciones/list' },
                { key: 'todas', label: 'Historial completo', path: '/citaciones/todas' },
            ].filter(Boolean),
        },
        {
            key: 'asistencia',
            label: 'Asistencia',
            icon: <ClipboardCheck size={20} />,
            children: [
                { key: 'mi-asistencia', label: 'Mi asistencia', path: '/asistencia/mia' },
                userEsOficial && { key: 'asistencia-citaciones', label: 'Asistencias citaciones', path: '/asistencia/citaciones' },
                userEsOficial && { key: 'asistencia-emergencias', label: 'Asistencias emergencias', path: '/asistencia/emergencias' },
                userEsOficial && { key: 'asistencia-bomberos', label: 'Asistencias por bombero', path: '/asistencia/bomberos' },
                userEsOficial && { key: 'asistencia-anual', label: 'Asistencias anual', path: '/asistencia/anual' },
            ].filter(Boolean),
        },
        {
            key: 'licencias', label: 'Licencias', icon: <Shield size={20} />,
            children: [
                { key: 'mis-licencias', label: 'Mis licencias', path: '/licencia/list' },
                { key: 'gestion', label: 'Gestionar Licencias', path: '/licencia/gestionar' },
                { key: 'excepcion', label: 'Excepciones asistencia', path: '/excepciones/asistencia' },
            ],
        },
        {
            key: 'archivos', label: 'Archivos', icon: <LibraryBig size={20} />,
            children: [
                userEsOficial && { key: 'subir-archivo', label: 'Subir archivo', path: '/archivos/subir' },
                { key: 'revisar-archivos', label: 'Revisar archivos', path: '/archivos/ver' },
            ].filter(Boolean),
        },
        {
            key: 'tesoreria', label: 'Tesoreria', icon: <CircleDollarSign size={20} />,
            children: [
                userIsTesorero && { key: 'revisar-cuotas', label: 'Revisar cuotas', path: '/tesorero/revisar' },
                { key: 'mis-cuotas', label: 'Mis cuotas', path: '/tesorero/mis-cuotas' },
                { key: 'bombero', label: 'Subir comprobante', path: '/bombero/subir-comprobante' },
                userIsTesorero && { key: 'bandeja', label: 'Revisar bandeja', path: '/tesorero/bandeja' },
                userIsTesorero && { key: 'registrar-comprobante', label: 'Registrar cuotas', path: '/tesorero/registrar' },
            ].filter(Boolean),
        },
        {
            key: 'inventario', label: 'Inventario', icon: <Package size={20} />,
            children: [
                { key: 'salas', label: 'Gestión de Salas', path: '/inventario/salas' },
            ],
        },
    ];

    const toggleOpen = (key) => {
        setOpenKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const MenuItem = ({ item, isMobile = false }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openKeys.includes(item.key);

        const content = (
            <div className="flex items-center gap-3">
                <span className={`transition-colors ${isOpen ? 'text-red-600 dark:text-red-500' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'}`}>
                    {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
            </div>
        );

        return (
            <div className="mb-1">
                {item.path ? (
                    <NavLink
                        to={item.path}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) => `
                            group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all
                            ${isActive 
                                ? 'bg-red-50 text-red-600 dark:!bg-red-500/10 dark:text-red-500' 
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
                        `}
                    >
                        {content}
                    </NavLink>
                ) : (
                    <button
                        onClick={() => toggleOpen(item.key)}
                        className={`
                            group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all
                            ${isOpen 
                                ? 'bg-slate-50 text-slate-900 dark:!bg-slate-800/50 dark:text-slate-100' 
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
                        `}
                    >
                        {content}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {hasChildren && isOpen && (
                    <div className="mt-1 flex flex-col gap-1 pl-10 pr-2">
                        {item.children.map((child) => (
                            <NavLink
                                key={child.key}
                                to={child.path}
                                onClick={() => isMobile && setMobileOpen(false)}
                                className={({ isActive }) => `
                                    rounded-lg px-3 py-2 text-xs font-medium transition-all
                                    ${isActive 
                                        ? 'text-red-600 dark:text-red-500' 
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}
                                `}
                            >
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 !bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 dark:border-slate-800 dark:!bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
            >
                <Menu size={20} />
            </button>

            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden" 
                    onClick={() => setMobileOpen(false)} 
                />
            )}

            {/* Desktop & Mobile Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 !bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:!bg-slate-900 md:translate-x-0 md:sticky md:top-0 md:h-screen md:block
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex h-full flex-col px-4 py-6">
                    {/* Logo Section */}
                    <div className="mb-8 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">FireControl</h2>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Bomberos de Chile</p>
                            </div>
                        </div>
                        <button 
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                        <p className="mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegación</p>
                        {menuItems.map((item) => (
                            <MenuItem key={item.key} item={item} isMobile={true} />
                        ))}
                    </nav>

                    {/* Footer / User Quick Info */}
                    <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:!bg-slate-800/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl !bg-white text-red-600 shadow-sm dark:!bg-slate-800">
                                <User size={20} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {user?.username || 'Usuario'}
                                </span>
                                <span className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    {user?.rol || 'Conectado'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
