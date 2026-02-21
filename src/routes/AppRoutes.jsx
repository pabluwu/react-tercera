import { Routes, Route } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import PrivateRoute from '../auth/PrivateRoute';

import CrearCitacion from '../pages/Citaciones/CrearCitacion';
import ListCitaciones from '../pages/Citaciones/List';
import DetalleCitacion from '../pages/Citaciones/DetalleCitacion';

import RegistrarLicencia from '../pages/Licencias/RegistrarLicencias';
import LicenciasPorUsuario from '../pages/Licencias/LicenciasPorUsuario';
import GestionarLicencias from '../pages/Licencias/GestionarLicencias';
import LicenciasPorCitacion from '../pages/Licencias/LicenciasPorCitacion'

import CrearListaAsistencia from '../pages/Listas/CrearLista';
import ListasAsistencia from '../pages/Listas/ListasAsistencia';
import DetalleListaAsistencia from '../pages/Listas/DetalleListaAsistencia';

import SubirArchivo from '../pages/Archivos/SubirArchivos';
import SeleccionarTipoArchivo from '../pages/Archivos/SeleccionarTipoArchivo';
import ListaArchivosPorTipo from '../pages/Archivos/ListaArchivosPorTipo';

import BomberoSubirComprobante from '../pages/Tesoreria/BomberoSubirComprobante';
import TesoreraBandeja from '../pages/Tesoreria/TesoreroBandeja';
import TesoreraRegistrarComprobante from '../pages/Tesoreria/TesoreroRegistrarComprobante';
import RevisarCuotas from '../pages/Tesoreria/RevisarCuotas';
import RevisarCuotaDetalleBombero from '../pages/Tesoreria/RevisarCuotaDetalleBombero';
import MisCuotas from '../pages/Tesoreria/MisCuotas';
import BomberoPerfil from '../pages/Bomberos/BomberoPerfil';
import MiAsistencia from '../pages/Asistencia/MiAsistencia';
import AsistenciasCitaciones from '../pages/Asistencia/AsistenciasCitaciones';
import ResumenCitacion from '../pages/Asistencia/ResumenCitacion';
import AsistenciasEmergencias from '../pages/Asistencia/AsistenciasEmergencias';
import DetalleEmergencia from '../pages/Asistencia/DetalleEmergencia';
import AsistenciaAnual from '../pages/Asistencia/AsistenciaAnual';
import AsistenciasBomberos from '../pages/Asistencia/AsistenciasBomberos';
import DetalleBomberoAsistencia from '../pages/Asistencia/DetalleBombero';
import TodasLasCitaciones from '../pages/Citaciones/TodasLasCitaciones';
import TesoreroRoute from '../auth/TesoreroRoute';
import AyudanteSecretarioRoute from '../auth/AyudanteSecretarioRoute';
import { isTesorero } from '../auth/roleUtils';
import OficialRoute from '../auth/OficialRoute';
import PasswordResetRequest from '../pages/Auth/PasswordResetRequest';
import PasswordResetConfirm from '../pages/Auth/PasswordResetConfirm';

const AppRoutes = () => {

    const { user } = useAuthStore();
    const userIsTesorero = isTesorero(user);
    
    return (
        <Routes>
            <Route path="*" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordResetRequest />} />
            <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
            <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/citaciones" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
            } />

            <Route path="/citaciones/crear" element={
                <PrivateRoute>
                    <AyudanteSecretarioRoute>
                        <CrearCitacion />
                    </AyudanteSecretarioRoute>
                </PrivateRoute>
            } />
            <Route path="/citaciones/list" element={
                <PrivateRoute><ListCitaciones /></PrivateRoute>
            } />
            <Route path="/citaciones/:id" element={
                <PrivateRoute><DetalleCitacion /></PrivateRoute>
            } />
            <Route path="/citaciones/todas" element={
                <PrivateRoute><TodasLasCitaciones /></PrivateRoute>
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
                <PrivateRoute>
                    <AyudanteSecretarioRoute>
                        <CrearListaAsistencia />
                    </AyudanteSecretarioRoute>
                </PrivateRoute>
            } />
            <Route path="/lista/list" element={
                <PrivateRoute><ListasAsistencia /></PrivateRoute>
            } />
            <Route path="/lista/:id" element={
                <PrivateRoute><DetalleListaAsistencia /></PrivateRoute>
            } />


            {/* Archivos */}
            <Route path="/archivos/subir" element={
                <PrivateRoute>
                    <OficialRoute>
                        <SubirArchivo />
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/archivos/ver" element={
                <PrivateRoute><SeleccionarTipoArchivo /></PrivateRoute>
            } />
            <Route path="/archivos/:tipo" element={
                <PrivateRoute><ListaArchivosPorTipo /></PrivateRoute>
            } />

            {/* Tesoreria */}
            <Route path="/bombero/subir-comprobante" element={
                <PrivateRoute><BomberoSubirComprobante /></PrivateRoute>
            } />
            {userIsTesorero && (
                <>
                    <Route path="/tesorero/bandeja" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <TesoreraBandeja />
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/registrar" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <TesoreraRegistrarComprobante />
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/revisar" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <RevisarCuotas />
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/revisar/:id" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <RevisarCuotaDetalleBombero />
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                </>
            )}
            <Route path="/bombero/:id" element={
                <PrivateRoute><BomberoPerfil /></PrivateRoute>
            } />

            {/* Asistencia */}
            <Route path="/asistencia/mia" element={
                <PrivateRoute><MiAsistencia /></PrivateRoute>
            } />
            <Route path="/tesorero/mis-cuotas" element={
                <PrivateRoute><MisCuotas /></PrivateRoute>
            } />
            <Route path="/asistencia/citaciones" element={
                <PrivateRoute><AsistenciasCitaciones /></PrivateRoute>
            } />
            <Route path="/asistencia/resumen/:id" element={
                <PrivateRoute><ResumenCitacion /></PrivateRoute>
            } />
            <Route path="/asistencia/emergencias" element={
                <PrivateRoute><AsistenciasEmergencias /></PrivateRoute>
            } />
            <Route path="/asistencia/detalle/emergencia/:id" element={
                <PrivateRoute><DetalleEmergencia /></PrivateRoute>
            } />
            <Route path="/asistencia/anual" element={
                <PrivateRoute><AsistenciaAnual /></PrivateRoute>
            } />
            <Route path="/asistencia/bomberos" element={
                <PrivateRoute>
                    <OficialRoute>
                        <AsistenciasBomberos />
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/asistencia/bombero/:id" element={
                <PrivateRoute>
                    <OficialRoute>
                        <DetalleBomberoAsistencia />
                    </OficialRoute>
                </PrivateRoute>
            } />

        </Routes>
    );
};

export default AppRoutes;
