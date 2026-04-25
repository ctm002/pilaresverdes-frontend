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
    <AuthLayout title="Recuperar contraseña">
      <p className="text-gray-600 text-center mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <Link to="/signin" className="text-green-600 hover:underline block">
          Volver al inicio de sesión
        </Link>
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="text-green-600 hover:underline">Crear cuenta</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
