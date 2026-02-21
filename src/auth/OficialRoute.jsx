import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { isOficial } from "./roleUtils";

export default function OficialRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!isOficial(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
