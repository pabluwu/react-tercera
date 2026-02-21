import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../../api/auth";
import { toast } from "react-toastify";
import { useState } from "react";

const PasswordResetRequest = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { rut: "" },
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Si existe, se envió un correo con instrucciones.");
    },
    onError: (err) => {
      toast.error(err?.message || "No se pudo solicitar el restablecimiento.");
    },
  });

  const onSubmit = (values) => {
    if (!values.rut) {
      toast.error("Debes enviar rut.");
      return;
    }
    mutation.mutate(values);
  };

  const rut = watch("rut");

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
        <h4 className="mb-3 text-center">Restablecer contraseña</h4>
        <p className="text-muted small text-center mb-4">
          Ingresa tu RUT y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
          <div>
            <label className="form-label">RUT</label>
            <input
              type="text"
              className="form-control"
              placeholder="12345678-9"
              {...register("rut")}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={mutation.isLoading || isSubmitting}
          >
            {mutation.isLoading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {submitted && (
          <p className="text-success small text-center mt-3 mb-0">
            Si existe, se envió un correo con instrucciones.
          </p>
        )}

        <div className="text-center mt-3">
          <a className="small" href="/login">
            Volver a iniciar sesión
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
