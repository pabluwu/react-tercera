import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 bg-light min-vh-100" style={{ transition: 'margin 0.3s ease-in-out' }}>
                <Navbar />
                <main className="p-3 p-md-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
