import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { isAyudanteOrSecretario } from "./roleUtils";

export default function AyudanteSecretarioRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!isAyudanteOrSecretario(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
