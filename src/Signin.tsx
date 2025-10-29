import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';

import axios from 'axios';
import './index.css';


function Signin() {
    
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/v1/auth/signin', {
        username,
        password
      });

      const token = response.data;
      localStorage.setItem('token', token);

      // alert('Login exitoso');
      //TForce
      // Aquí podrías redirigir, por ejemplo:
      // navigate('/dashboard');
      navigate('/avisos');

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al iniciar sesión');
      }
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
    style={{ backgroundImage: "url('https://pilaresverdes.cl/images/pilaresverdes.jpg')", backgroundRepeat: "no-repeat", backgroundSize: "cover"}}
  >
    <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-1">Correo electrónico o Celular</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="ejemplo@correo.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300"
        >
          Entrar
        </button>
      </form>
      <p className="text-center text-gray-600 mt-4">
        ¿No tienes cuenta?{' '}
        <Link to="/signup" className="text-green-600 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  </div>
  );
}

export default Signin;
