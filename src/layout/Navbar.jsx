import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserCircle, Search, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);
    const closeDropdown = () => setIsOpen(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom bg-white">
            <div className="d-flex align-items-center gap-3">
                <button className="btn btn-sm d-md-none">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><Search size={16} /></span>
                    <input type="text" className="form-control border-start-0" placeholder="Buscar..." />
                </div>
            </div>
            <div className="d-flex align-items-center gap-3">
                {/* <div className="position-relative">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        3
                    </span>
                </div> */}
                <div className="dropdown position-relative" ref={dropdownRef}>
                    <button
                        className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                        type="button"
                        onClick={toggleDropdown}
                    >
                        <UserCircle size={24} />
                    </button>
                    {isOpen && (
                        <div
                            className="dropdown-menu show shadow-sm"
                            style={{
                                minWidth: 200,
                                right: 0,
                                left: 'auto',
                                top: 'calc(100% + 0.5rem)',
                                position: 'absolute',
                                zIndex: 1050,
                            }}
                        >
                            <span className="dropdown-item-text fw-semibold">
                                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Mi cuenta'}
                            </span>
                            <div className="dropdown-divider" />
                            <Link
                                to={user ? `/bombero/${user.id}` : '#'}
                                className="dropdown-item"
                                onClick={closeDropdown}
                            >
                                Ver mi perfil
                            </Link>
                            <button
                                type="button"
                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                onClick={() => {
                                    logout();
                                    closeDropdown();
                                }}
                            >
                                <LogOut size={16} /> Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
