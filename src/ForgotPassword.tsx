import { useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from './components/ui/AuthLayout.js';
import FormField from './components/ui/FormField.js';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/v1/auth/forgot-password', { email });
      if (response.status === 200) {
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico');
      } else if (response.status === 204) {
        setError('El correo no se encuentra registrado');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status;
        if (err.response?.data?.message) {
          setError(`${err.response.data.message} (${statusCode})`);
        } else {
          setError(`Error al enviar el correo de recuperación (${statusCode || 'Sin conexión'})`);
        }
      } else {
        setError('Error al enviar el correo de recuperación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecer tu acceso">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-forest-700 text-xs bg-forest-50 border border-forest-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-forest-900 text-white py-3 rounded-xl hover:bg-forest-800 transition-colors font-semibold text-sm tracking-wide disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2.5">
        <Link to="/signin" className="text-forest-700 hover:text-forest-900 text-xs block transition-colors">
          ← Volver al inicio de sesión
        </Link>
        <p className="text-stone-400 text-xs">
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="text-forest-700 hover:text-forest-900 font-semibold transition-colors">
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
