import { useState } from "react";

import axios from 'axios';
import './index.css';


function App() {
    
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/v1/auth/signin', {
        username,
        password
      });

      const token = response.data.accessToken;
      localStorage.setItem('token', token);

      alert('Login exitoso');
      //TForce
      // Aquí podrías redirigir, por ejemplo:
      // navigate('/dashboard');

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al iniciar sesión');
      }
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-1">Correo electrónico</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
        >
          Entrar
        </button>
      </form>
    </div>
  </div>
  );
}

export default App;
