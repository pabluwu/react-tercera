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
import CrearExcepcionAsistencia from '../pages/Excepciones/CrearExcepcionAsistencia';
import TesoreroRoute from '../auth/TesoreroRoute';
import AyudanteSecretarioRoute from '../auth/AyudanteSecretarioRoute';
import { isTesorero } from '../auth/roleUtils';
import OficialRoute from '../auth/OficialRoute';
import PasswordResetRequest from '../pages/Auth/PasswordResetRequest';
import PasswordResetConfirm from '../pages/Auth/PasswordResetConfirm';

// Inventario
import SalasList from '../pages/Inventario/SalasList';
import SalaDetail from '../pages/Inventario/SalaDetail';
import InventarioLogs from '../pages/Inventario/InventarioLogs';
import ModuleRoute from '../auth/ModuleRoute';

import PlanificarGuardias from '../pages/Guardias/PlanificarGuardias';
import MisGuardias from '../pages/Guardias/MisGuardias';
import SolicitudesReemplazo from '../pages/Guardias/SolicitudesReemplazo';

// Encuestas
import EncuestasList from '../pages/Encuestas/EncuestasList';
import CrearEncuesta from '../pages/Encuestas/CrearEncuesta';
import ResponderEncuesta from '../pages/Encuestas/ResponderEncuesta';
import VerResultados from '../pages/Encuestas/VerResultados';
import MisEncuestas from '../pages/Encuestas/MisEncuestas';

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
                        <ModuleRoute moduleName="archivos">
                            <SubirArchivo />
                        </ModuleRoute>
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/archivos/ver" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="archivos">
                        <SeleccionarTipoArchivo />
                    </ModuleRoute>
                </PrivateRoute>
            } />
            <Route path="/archivos/:tipo" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="archivos">
                        <ListaArchivosPorTipo />
                    </ModuleRoute>
                </PrivateRoute>
            } />

            {/* Tesoreria */}
            <Route path="/bombero/subir-comprobante" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="tesoreria">
                        <BomberoSubirComprobante />
                    </ModuleRoute>
                </PrivateRoute>
            } />
            {userIsTesorero && (
                <>
                    <Route path="/tesorero/bandeja" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <ModuleRoute moduleName="tesoreria">
                                    <TesoreraBandeja />
                                </ModuleRoute>
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/registrar" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <ModuleRoute moduleName="tesoreria">
                                    <TesoreraRegistrarComprobante />
                                </ModuleRoute>
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/revisar" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <ModuleRoute moduleName="tesoreria">
                                    <RevisarCuotas />
                                </ModuleRoute>
                            </TesoreroRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/tesorero/revisar/:id" element={
                        <PrivateRoute>
                            <TesoreroRoute>
                                <ModuleRoute moduleName="tesoreria">
                                    <RevisarCuotaDetalleBombero />
                                </ModuleRoute>
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
                <PrivateRoute>
                    <ModuleRoute moduleName="tesoreria">
                        <MisCuotas />
                    </ModuleRoute>
                </PrivateRoute>
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

            {/* Excepciones */}
            <Route path="/excepciones/asistencia" element={
                <PrivateRoute><CrearExcepcionAsistencia /></PrivateRoute>
            } />

            {/* Inventario */}
            <Route path="/inventario/salas" element={
                <PrivateRoute>
                    <OficialRoute>
                        <ModuleRoute moduleName="inventario">
                            <SalasList />
                        </ModuleRoute>
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/inventario/salas/:id" element={
                <PrivateRoute>
                    <OficialRoute>
                        <ModuleRoute moduleName="inventario">
                            <SalaDetail />
                        </ModuleRoute>
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/inventario/logs" element={
                <PrivateRoute>
                    <OficialRoute>
                        <ModuleRoute moduleName="inventario">
                            <InventarioLogs />
                        </ModuleRoute>
                    </OficialRoute>
                </PrivateRoute>
            } />

            {/* Guardias */}
            <Route path="/guardias/crear" element={
                <PrivateRoute>
                    <AyudanteSecretarioRoute>
                        <ModuleRoute moduleName="guardias">
                            <PlanificarGuardias />
                        </ModuleRoute>
                    </AyudanteSecretarioRoute>
                </PrivateRoute>
            } />
            <Route path="/guardias/mis-guardias" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="guardias">
                        <MisGuardias />
                    </ModuleRoute>
                </PrivateRoute>
            } />
            <Route path="/guardias/solicitudes" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="guardias">
                        <SolicitudesReemplazo showHistory={false} />
                    </ModuleRoute>
                </PrivateRoute>
            } />
            <Route path="/guardias/solicitudes/historico" element={
                <PrivateRoute>
                    <ModuleRoute moduleName="guardias">
                        <SolicitudesReemplazo showHistory={true} />
                    </ModuleRoute>
                </PrivateRoute>
            } />

            {/* Encuestas */}
            <Route path="/encuestas" element={
                <PrivateRoute>
                    <OficialRoute>
                        <EncuestasList />
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/encuestas/crear" element={
                <PrivateRoute>
                    <OficialRoute>
                        <CrearEncuesta />
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/encuestas/:id/resultados" element={
                <PrivateRoute>
                    <OficialRoute>
                        <VerResultados />
                    </OficialRoute>
                </PrivateRoute>
            } />
            <Route path="/encuestas/responder/:uuid" element={
                <PrivateRoute>
                    <ResponderEncuesta />
                </PrivateRoute>
            } />
            <Route path="/encuestas/mis-encuestas" element={
                <PrivateRoute>
                    <MisEncuestas />
                </PrivateRoute>
            } />

        </Routes>
    );
};

export default AppRoutes;
