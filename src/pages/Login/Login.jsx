import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Eye, EyeOff, Lock, User, Flame } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async ({ access, refresh }) => {
      await login(access, refresh);
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    },
    onError: () => alert('Credenciales inválidas'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:!bg-slate-950 p-6">
      <div className="w-full max-w-md !bg-white dark:!bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative">
          <div className="bg-red-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Tercera Compañía</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestión de Personal y Asistencia</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
              <User size={16} /> RUT
            </label>
            <input
              {...register('rut')}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="12345678-9"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
              <Lock size={16} /> Contraseña
            </label>
            <div className="relative group">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:!bg-slate-950 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Iniciando sesión...
              </span>
            ) : 'Ingresar al Portal'}
          </button>
        </form>

        <div className="text-center mt-10">
          <a
            href="/password-reset"
            className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
