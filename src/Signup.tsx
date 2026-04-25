import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { SignupDto } from './dto/SignupDto.js';
import AuthLayout from './components/ui/AuthLayout.js';
import FormField from './components/ui/FormField.js';
import './index.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const signupData: SignupDto = { username, email, password };
      await axios.post('/api/v1/auth/signup', signupData);
      navigate('/signin');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al crear la cuenta');
      }
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a la comunidad de Pilares Verdes">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Nombre de usuario"
          type="text"
          placeholder="usuario123"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormField
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormField
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-forest-900 text-white py-3 rounded-xl hover:bg-forest-800 transition-colors font-semibold text-sm tracking-wide mt-2"
        >
          Crear cuenta
        </button>
      </form>

      <p className="text-center text-stone-400 text-xs mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/signin" className="text-forest-700 hover:text-forest-900 font-semibold transition-colors">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
