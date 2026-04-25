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
    <AuthLayout title="Crear cuenta">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormField
          label="Confirmar contraseña"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300"
        >
          Crear cuenta
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link to="/signin" className="text-green-600 hover:underline">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
