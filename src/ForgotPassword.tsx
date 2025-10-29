import { useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post('/api/v1/auth/forgot-password', {email: email});
      if (response.status === 200) {
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico');
      } else if (response.status == 204) {
        setError("El correo no se encuentra registrado");
      }
    } catch (err: any) {
      const statusCode = err.response?.status;
      if (err.response?.data?.message) {
        setError(`${err.response.data.message} (${statusCode})`);
      } else {
        setError(`Error al enviar el correo de recuperación (${statusCode || 'Sin conexión'})`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
      style={{ backgroundImage: "url('https://pilaresverdes.cl/images/pilaresverdes.jpg')", backgroundRepeat: "no-repeat", backgroundSize: "cover"}}
    >
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Recuperar contraseña</h2>
        <p className="text-gray-600 text-center mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Correo electrónico</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
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
            <Link to="/signup" className="text-green-600 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;