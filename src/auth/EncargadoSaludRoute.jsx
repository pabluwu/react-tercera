import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { isEncargadoSalud } from "./roleUtils";

export default function EncargadoSaludRoute({ children }) {
  const user = useAuthStore((state) => state.user);

  if (!isEncargadoSalud(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
