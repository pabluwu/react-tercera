
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { Home, User, ChevronDown, Shield, MapPin, ScrollText, ChevronUp, Activity } from 'lucide-react';

const Sidebar = () => {
    const [openKeys, setOpenKeys] = useState([]);

    const { user } = useAuthStore();

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { key: 'personal', label: 'Personal', icon: <User size={18} /> },
        {
            key: 'listas', label: 'Listas', icon: <ScrollText size={18} />,
            children: [
                user?.permissions.includes('bomberos.add_citacion') && { key: 'crear', label: 'Crear lista', path: '/lista/crear' },
                { key: 'list', label: 'Ver listas', path: '/lista/list' },
            ].filter(Boolean),
        },
        {
            key: 'citaciones', label: 'Citaciones', icon: <Activity size={18} />,
            children: [
                user?.permissions.includes('bomberos.add_citacion') && { key: 'crear', label: 'Crear citación', path: '/citaciones/crear' },
                { key: 'list', label: 'Ver citaciones', path: '/citaciones/list' },
            ].filter(Boolean),
        },
        {
            key: 'licencias', label: 'Licencias', icon: <Shield size={18} />,
            children: [
                { key: 'mis-licencias', label: 'Mis licencias', path: '/licencia/list' },
                { key: 'gestion', label: 'Gestionar Licencias', path: '/licencia/gestionar' },
            ],
        },
        { key: 'estaciones', label: 'Estaciones', icon: <MapPin size={18} /> },
    ];

    const toggleOpen = (key) => {
        setOpenKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="bg-white border-end p-3 d-flex flex-column" style={{ width: 250, minHeight: '100vh' }}>
            <h5 className="text-danger fw-bold mb-4">FireControl</h5>
            <p className="text-muted small">Sistema de Gestión</p>
            <hr />
            <nav className="nav flex-column">
                {menuItems.map(({ key, label, icon, children }) => (
                    <div key={key}>
                        <div
                            onClick={() => children ? toggleOpen(key) : null}
                            className="nav-link d-flex justify-content-between align-items-center text-dark gap-2 cursor-pointer"
                            style={{ cursor: children ? 'pointer' : 'default' }}
                        >
                            <span className="d-flex align-items-center gap-2">
                                {icon} {label}
                            </span>
                            {children && (openKeys.includes(key) ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
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
    );
};

export default Sidebar;

