import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { isTesorero } from "./roleUtils";

export default function TesoreroRoute({ children }) {
  const user = useAuthStore((state) => state.user);

  if (!isTesorero(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
