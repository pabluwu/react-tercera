import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 bg-light" style={{ minHeight: '100vh' }}>
                <Navbar />
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
