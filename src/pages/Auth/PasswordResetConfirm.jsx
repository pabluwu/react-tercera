import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { confirmPasswordReset } from "../../api/auth";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:!bg-slate-950 p-6">
      <div className="w-full max-w-md !bg-white dark:!bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="bg-red-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Nueva Contraseña</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Establece tus nuevas credenciales</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
              <Lock size={16} /> Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="••••••••"
              {...register("new_password", { required: true })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
              <Lock size={16} /> Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="••••••••"
              {...register("new_password_confirm", { required: true })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Actualizando...
              </span>
            ) : "Actualizar Contraseña"}
          </button>
        </form>

        <div className="text-center mt-10">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors"
          >
            <ArrowLeft size={16} /> Volver a iniciar sesión
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
