import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../../api/auth";
import { toast } from "react-toastify";
import { useState } from "react";
import { User, KeyRound, ArrowLeft, MailCheck } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:!bg-slate-950 p-6">
      <div className="w-full max-w-md !bg-white dark:!bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="bg-red-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Restablecer</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium px-4">Ingresa tu RUT y te enviaremos las instrucciones por correo.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <User size={16} /> RUT
              </label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="12345678-9"
                {...register("rut")}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enviando...
                </span>
              ) : "Enviar Instrucciones"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 dark:!bg-green-900/20 border border-green-100 dark:border-green-900/30 p-6 rounded-3xl text-center">
            <div className="text-green-600 dark:text-green-400 flex justify-center mb-4">
              <MailCheck size={48} />
            </div>
            <p className="text-green-800 dark:text-green-300 font-bold mb-2 text-lg">¡Solicitud Enviada!</p>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Si el RUT corresponde a un usuario registrado, recibirás un correo en breve.
            </p>
          </div>
        )}

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

export default PasswordResetRequest;
