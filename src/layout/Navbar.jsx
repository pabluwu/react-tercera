import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserCircle, Search, LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import DarkModeToggle from '../components/DarkModeToggle';

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
        <nav className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 !bg-white/80 px-4 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:!bg-slate-900/80 md:px-8">
            {/* Search Bar - Hidden on mobile if needed, but kept here for now */}
            <div className="flex flex-1 items-center gap-4">
                <div className="relative hidden w-full max-w-md md:block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-slate-700 dark:!bg-slate-800/50 dark:text-slate-200 dark:focus:border-red-500"
                        placeholder="Buscar..."
                    />
                </div>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                <DarkModeToggle />
                
                {/* Notifications - Future implementation */}
                {/* <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                </button> */}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:!bg-red-500/10 dark:text-red-500">
                            <UserCircle size={24} />
                        </div>
                        <div className="hidden flex-col items-start text-left md:flex">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
                                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Mi cuenta'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {user?.rol || 'Bombero'}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-100 !bg-white p-2 shadow-xl ring-1 ring-black/5 transition-all dark:border-slate-800 dark:!bg-slate-900 dark:ring-white/5">
                            <div className="px-3 py-2 md:hidden">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="my-1 h-px bg-slate-100 dark:!bg-slate-800 md:hidden" />
                            
                            <Link
                                to={user ? `/bombero/${user.id}` : '#'}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-500"
                                onClick={closeDropdown}
                            >
                                <UserCircle size={18} />
                                <span>Ver mi perfil</span>
                            </Link>
                            
                            <div className="my-1 h-px bg-slate-100 dark:!bg-slate-800" />
                            
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
                                onClick={() => {
                                    logout();
                                    closeDropdown();
                                }}
                            >
                                <LogOut size={18} />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
