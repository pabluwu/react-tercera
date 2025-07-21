import { Routes, Route } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import PrivateRoute from '../auth/PrivateRoute';

import CrearCitacion from '../pages/Citaciones/CrearCitacion';
import ListCitaciones from '../pages/Citaciones/List';

import RegistrarLicencia from '../pages/Licencias/RegistrarLicencias';
import LicenciasPorUsuario from '../pages/Licencias/LicenciasPorUsuario';
import GestionarLicencias from '../pages/Licencias/GestionarLicencias';
import LicenciasPorCitacion from '../pages/Licencias/LicenciasPorCitacion'

import CrearListaAsistencia from '../pages/Listas/CrearLista';
import ListasAsistencia from '../pages/Listas/ListasAsistencia';
import DetalleListaAsistencia from '../pages/Listas/DetalleListaAsistencia';

const AppRoutes = () => {

    const { user } = useAuthStore();
    console.log(user);
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/citaciones" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
            } />

            {
                user?.permissions.includes('bomberos.add_citacion') &&
                <Route path="/citaciones/crear" element={
                    <PrivateRoute><CrearCitacion /></PrivateRoute>
                } />
            }
            <Route path="/citaciones/list" element={
                <PrivateRoute><ListCitaciones /></PrivateRoute>
            } />

            <Route path="/licencia/citacion/:id" element={
                <PrivateRoute><RegistrarLicencia /></PrivateRoute>
            } />
            <Route path="/licencia/list" element={
                <PrivateRoute><LicenciasPorUsuario /></PrivateRoute>
            } />
            <Route path="/licencia/gestionar" element={
                <PrivateRoute><GestionarLicencias /></PrivateRoute>
            } />
            <Route path="/licencia/gestionar/:id" element={
                <PrivateRoute><LicenciasPorCitacion /></PrivateRoute>
            } />

            <Route path="/lista/crear" element={
                <PrivateRoute><CrearListaAsistencia /></PrivateRoute>
            } />
            <Route path="/lista/list" element={
                <PrivateRoute><ListasAsistencia /></PrivateRoute>
            } />
            <Route path="/lista/:id" element={
                <PrivateRoute><DetalleListaAsistencia /></PrivateRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;
