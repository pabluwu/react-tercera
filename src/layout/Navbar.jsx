import { Bell, UserCircle, Search } from 'lucide-react';

const Navbar = () => {
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
                <div className="position-relative">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        3
                    </span>
                </div>
                <UserCircle size={24} />
            </div>
        </div>
    );
};

export default Navbar;
