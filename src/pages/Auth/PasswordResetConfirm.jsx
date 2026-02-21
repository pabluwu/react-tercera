import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { confirmPasswordReset } from "../../api/auth";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PasswordResetConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { new_password: "", new_password_confirm: "" },
  });

  useEffect(() => {
    if (!uid || !token) {
      toast.error("Enlace inválido o expirado.");
    }
  }, [uid, token]);

  const mutation = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      toast.success("Contraseña actualizada. Inicia sesión con tu nueva clave.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err?.message || "No se pudo actualizar la contraseña.");
    },
  });

  const onSubmit = (values) => {
    if (!uid || !token) {
      toast.error("Enlace inválido o expirado.");
      return;
    }
    if (values.new_password !== values.new_password_confirm) {
      setError("new_password_confirm", { message: "Las contraseñas no coinciden." });
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    mutation.mutate({ uid, token, ...values });
  };

  const password = watch("new_password");

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
        <h4 className="mb-3 text-center">Ingresa tu nueva contraseña</h4>
        <p className="text-muted small text-center mb-4">
          Escribe y confirma la nueva clave para tu cuenta.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
          <div>
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              {...register("new_password", { required: true })}
              required
            />
          </div>
          <div>
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              {...register("new_password_confirm", { required: true })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={mutation.isLoading || isSubmitting}
          >
            {mutation.isLoading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        <div className="text-center mt-3">
          <a className="small" href="/login">
            Volver a iniciar sesión
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
