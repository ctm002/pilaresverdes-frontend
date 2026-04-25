import { useState, useRef } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from './components/ui/AuthLayout.js';
import FormField from './components/ui/FormField.js';
import './index.css';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;

function sanitizeInput(value: string): string {
  return value.trim().slice(0, 255);
}

function isValidUsernameFormat(value: string): boolean {
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

  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (Date.now() < lockoutUntilRef.current) {
      const remaining = Math.ceil((lockoutUntilRef.current - Date.now()) / 1000);
      setError(`Demasiados intentos fallidos. Espera ${remaining} segundos.`);
      return;
    }

    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

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
      if (typeof token !== 'string' || !token) throw new Error('Respuesta inválida del servidor.');

      localStorage.setItem('token', token);
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
    <AuthLayout title="Bienvenido">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          id="signin-username"
          label="Correo o Celular"
          type="text"
          placeholder="ejemplo@correo.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          maxLength={255}
          required
          disabled={loading}
        />
        <FormField
          id="signin-password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          maxLength={255}
          required
          disabled={loading}
        />

        {error && (
          <p role="alert" className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-900 text-white py-3 rounded-xl hover:bg-forest-800 transition-colors font-semibold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2.5">
        <Link to="/forgot-password" className="text-forest-700 hover:text-forest-900 text-xs block transition-colors">
          ¿Olvidaste tu contraseña?
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

export default Signin;
