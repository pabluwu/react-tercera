import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { isTesorero, isAyudanteOrSecretario, isOficial } from '../auth/roleUtils';
import { Home, User, ChevronDown, Shield, LibraryBig, ScrollText, ChevronUp, Activity, CircleDollarSign, ClipboardCheck, Package, X, Menu } from 'lucide-react';

const Sidebar = () => {
    const [openKeys, setOpenKeys] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { user } = useAuthStore();
    const userIsTesorero = isTesorero(user);
    const userPuedeCrearCitacion = isAyudanteOrSecretario(user);
    const userEsOficial = isOficial(user);

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, path: '/' },
        {
            key: 'personal',
            label: 'Personal',
            icon: <User size={18} />,
            ...(user
                ? {
                    children: [
                        {
                            key: 'mi-perfil',
                            label: 'Mi perfil',
                            path: `/bombero/${user.id}`,
                        },
                    ],
                }
                : {}),
        },
        {
            key: 'listas', label: 'Listas', icon: <ScrollText size={18} />,
            children: [
                userPuedeCrearCitacion && { key: 'crear', label: 'Crear lista', path: '/lista/crear' },
                { key: 'list', label: 'Ver listas', path: '/lista/list' },
            ].filter(Boolean),
        },
        {
            key: 'citaciones', label: 'Citaciones', icon: <Activity size={18} />,
            children: [
                userPuedeCrearCitacion && { key: 'crear', label: 'Crear citación', path: '/citaciones/crear' },
                { key: 'list', label: 'Ver citaciones', path: '/citaciones/list' },
                { key: 'todas', label: 'Historial completo', path: '/citaciones/todas' },
            ].filter(Boolean),
        },
        {
            key: 'asistencia',
            label: 'Asistencia',
            icon: <ClipboardCheck size={18} />,
            children: [
                { key: 'mi-asistencia', label: 'Mi asistencia', path: '/asistencia/mia' },
                userEsOficial && { key: 'asistencia-citaciones', label: 'Asistencias citaciones', path: '/asistencia/citaciones' },
                userEsOficial && { key: 'asistencia-emergencias', label: 'Asistencias emergencias', path: '/asistencia/emergencias' },
                userEsOficial && { key: 'asistencia-bomberos', label: 'Asistencias por bombero', path: '/asistencia/bomberos' },
                userEsOficial && { key: 'asistencia-anual', label: 'Asistencias anual', path: '/asistencia/anual' },
            ].filter(Boolean),
        },
        {
            key: 'licencias', label: 'Licencias', icon: <Shield size={18} />,
            children: [
                { key: 'mis-licencias', label: 'Mis licencias', path: '/licencia/list' },
                { key: 'gestion', label: 'Gestionar Licencias', path: '/licencia/gestionar' },
                { key: 'excepcion', label: 'Excepciones asistencia', path: '/excepciones/asistencia' },
            ],
        },
        {
            key: 'archivos', label: 'Archivos', icon: <LibraryBig size={18} />,
            children: [
                userEsOficial && { key: 'subir-archivo', label: 'Subir archivo', path: '/archivos/subir' },
                { key: 'revisar-archivos', label: 'Revisar archivos', path: '/archivos/ver' },
            ].filter(Boolean),
        },
        {
            key: 'tesoreria', label: 'Tesoreria', icon: <CircleDollarSign size={18} />,
            children: [
                userIsTesorero && { key: 'revisar-cuotas', label: 'Revisar cuotas', path: '/tesorero/revisar' },
                { key: 'mis-cuotas', label: 'Mis cuotas', path: '/tesorero/mis-cuotas' },
                { key: 'bombero', label: 'Subir comprobante', path: '/bombero/subir-comprobante' },
                userIsTesorero && { key: 'bandeja', label: 'Revisar bandeja', path: '/tesorero/bandeja' },
                userIsTesorero && { key: 'registrar-comprobante', label: 'Registrar cuotas', path: '/tesorero/registrar' },
            ].filter(Boolean),
        },
        {
            key: 'inventario', label: 'Inventario', icon: <Package size={18} />,
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

    const handleLinkClick = () => {
        setMobileOpen(false);
    };

    return (
        <>
            <button
                className="btn btn-outline-primary d-md-none position-fixed bg-white d-flex align-items-center justify-content-center p-0"
                style={{ top: '0.5rem', left: '0.75rem', zIndex: 1050, width: 40, height: 40, visibility: mobileOpen ? 'hidden' : 'visible' }}
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
            >
                <Menu size={20} />
            </button>

            {mobileOpen && (
                <div className="d-md-none position-fixed w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1045 }} onClick={() => setMobileOpen(false)} />
            )}

            <div className="d-none d-md-block bg-white border-end p-3" style={{ width: 250, minHeight: '100vh' }}>
                <h5 className="text-danger fw-bold mb-4">FireControl</h5>
                <p className="text-muted small">Sistema de Gestión</p>
                <hr />
                <nav className="nav flex-column">
                    {menuItems.map(({ key, label, icon, children, path }) => (
                        <div key={key}>
                            <div
                                onClick={() => {
                                    if (path) return;
                                    if (children) toggleOpen(key);
                                }}
                                className="nav-link d-flex justify-content-between align-items-center text-dark gap-2 cursor-pointer"
                                style={{ cursor: path ? 'pointer' : children ? 'pointer' : 'default' }}
                            >
                                {path ? (
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>
                                            `d-flex align-items-center gap-2 text-decoration-none ${
                                                isActive ? 'text-primary fw-semibold' : 'text-dark'
                                            }`
                                        }
                                    >
                                        {icon} {label}
                                    </NavLink>
                                ) : (
                                    <span className="d-flex align-items-center gap-2">
                                        {icon} {label}
                                    </span>
                                )}
                                {!path && children && (openKeys.includes(key) ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </div>

                            {children && openKeys.includes(key) && (
                                <div className="ms-4 mt-2 d-flex flex-column gap-1">
                                    {children.map(({ key: subKey, label: subLabel, path }) => (
                                        <NavLink
                                            to={path}
                                            key={subKey}
                                            className={({ isActive }) =>
                                                `nav-link py-1 px-2 rounded ${isActive ? 'bg-primary text-white' : 'text-muted'}`
                                            }
                                        >
                                            {subLabel}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="d-flex d-md-none flex-column bg-white border-end p-3 position-fixed h-100" style={{ width: 250, top: 0, zIndex: 1046, transition: 'left 0.3s ease-in-out', left: mobileOpen ? 0 : '-250px' }} onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-end align-items-center mb-3">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setMobileOpen(false)}>
                        <X size={18} />
                    </button>
                </div>
                <h5 className="text-danger fw-bold mb-4">FireControl</h5>
                <p className="text-muted small">Sistema de Gestión</p>
                <hr />
                <nav className="nav flex-column" style={{ overflowY: 'auto' }}>
                    {menuItems.map(({ key, label, icon, children, path }) => (
                        <div key={key}>
                            <div
                                onClick={() => {
                                    if (path) {
                                        handleLinkClick();
                                        return;
                                    }
                                    if (children) toggleOpen(key);
                                }}
                                className="nav-link d-flex justify-content-between align-items-center text-dark gap-2 cursor-pointer"
                                style={{ cursor: path ? 'pointer' : children ? 'pointer' : 'default' }}
                            >
                                {path ? (
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>
                                            `d-flex align-items-center gap-2 text-decoration-none ${
                                                isActive ? 'text-primary fw-semibold' : 'text-dark'
                                            }`
                                        }
                                        onClick={handleLinkClick}
                                    >
                                        {icon} {label}
                                    </NavLink>
                                ) : (
                                    <span className="d-flex align-items-center gap-2">
                                        {icon} {label}
                                    </span>
                                )}
                                {!path && children && (openKeys.includes(key) ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </div>

                            {children && openKeys.includes(key) && (
                                <div className="ms-4 mt-2 d-flex flex-column gap-1">
                                    {children.map(({ key: subKey, label: subLabel, path }) => (
                                        <NavLink
                                            to={path}
                                            key={subKey}
                                            className={({ isActive }) =>
                                                `nav-link py-1 px-2 rounded ${isActive ? 'bg-primary text-white' : 'text-muted'}`
                                            }
                                            onClick={handleLinkClick}
                                        >
                                            {subLabel}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;