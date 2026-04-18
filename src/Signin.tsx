import { useState, useRef } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minuto
const REQUEST_TIMEOUT_MS = 10_000; // 10 segundos

function sanitizeInput(value: string): string {
  return value.trim().slice(0, 255);
}

function isValidUsernameFormat(value: string): boolean {
  // Acepta correo o número de celular (solo dígitos, +, -)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s\-]{7,20}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
}

function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Rate limiting en cliente
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Verificar lockout
    if (Date.now() < lockoutUntilRef.current) {
      const remaining = Math.ceil((lockoutUntilRef.current - Date.now()) / 1000);
      setError(`Demasiados intentos fallidos. Espera ${remaining} segundos.`);
      return;
    }

    // Sanitizar inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

    // Validar formato básico
    if (!isValidUsernameFormat(sanitizedUsername)) {
      setError('Ingresa un correo electrónico o número de celular válido.');
      return;
    }

    if (sanitizedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/v1/auth/signin',
        { username: sanitizedUsername, password: sanitizedPassword },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      const token: unknown = response.data;

      if (typeof token !== 'string' || !token) {
        throw new Error('Respuesta inválida del servidor.');
      }

      localStorage.setItem('token', token);

      // Resetear contador de intentos al autenticarse correctamente
      attemptsRef.current = 0;
      lockoutUntilRef.current = 0;

      navigate('/avisos');

    } catch (err: unknown) {
      attemptsRef.current += 1;

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        lockoutUntilRef.current = Date.now() + LOCKOUT_MS;
        attemptsRef.current = 0;
        setError('Demasiados intentos fallidos. Intenta de nuevo en 1 minuto.');
        setLoading(false);
        return;
      }

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (err.code === 'ECONNABORTED') {
          setError('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
        } else if (status === 401 || status === 403) {
          setError('Credenciales incorrectas. Verifica tu correo/celular y contraseña.');
        } else if (status != null && status >= 500) {
          setError('Error en el servidor. Intenta de nuevo más tarde.');
        } else {
          setError('Error al iniciar sesión. Intenta de nuevo.');
        }
      } else {
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
      style={{
        backgroundImage: "url('https://pilaresverdes.cl/images/pilaresverdes.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signin-username" className="block text-gray-600 mb-1">
              Correo electrónico o Celular
            </label>
            <input
              id="signin-username"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ejemplo@correo.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={255}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="block text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              id="signin-password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={255}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            id="signin-submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <Link to="/forgot-password" className="text-green-600 hover:underline block text-sm">
            ¿Olvidaste tu contraseña?
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

export default Signin;
