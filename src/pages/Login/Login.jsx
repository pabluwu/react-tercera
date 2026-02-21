import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async ({ access, refresh }) => {
      await login(access, refresh);
      navigate('/dashboard');
    },
    onError: () => alert('Credenciales inválidas'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: 400, width: '100%' }}>
        <div className="text-center mb-4">
          <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center"
               style={{ width: 48, height: 48, fontSize: 20, fontWeight: 'bold' }}>
            3
          </div>
          <h4 className="mt-3 mb-1">Tercera</h4>
          <p className="text-muted mb-0">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">RUT</label>
            <input
              {...register('rut')}
              className="form-control"
              placeholder="12345678-9"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Tu contraseña"
                required
              />
              <span className="input-group-text bg-white cursor-pointer" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/password-reset" className="text-primary small">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
