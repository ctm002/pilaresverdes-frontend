// import Button from "./components/Button";
// import Card, { CardBody } from "./components/Card";
// import List from "./components/List";
// import Button from "./components/Button";
// import { useEffect, useState } from "react";
import { useState } from "react";

import axios from 'axios';
import './index.css';


function App() {
  // const handleSelect = (element: string) => {
  //   console.log("imprimiendo", element);
  // };

  // const data: string[] = ["Goku", "Gohan", "Krillyn", "Picoro"];
  // const contenido = () =>
  //   list.length ? (
  //     <List data={list} onSelect={handleSelect}></List>
  //   ) : (
  //     "sin elementos para mostrar"
  //   );

  // const [isClicked, setIsClicked] = useState(false);

  // const handleClick = () => setIsClicked(!isClicked);

  // return (
  //   <Card>
  //     <CardBody title="Titulo" text="Detalle" /> {contenido()}
  //     <Button onClick={handleClick} isClicked={isClicked}>
  //       {isClicked ? "cargando": "aceptar y continuar" }
  //     </Button>
  //   </Card>
  // );

  // const [data, setData] = useState(["Goku", "Gohan", "Krillyn", "Picoro"]);

  // const addItem = () => {
  //   setData([...data, 'Cell']);
  // }
  // const delItem = () => {
  //   setData(data.slice(0,-1));
  // }

  // return (<Card>
  //   <Button onClick={addItem}>Agregar</Button>
  //   <Button onClick={delItem}>Quitar</Button>
  //   <List data={data}></List> 
  // </Card>);
  
  // const [datos, setDatos] = useState(null);

  // useEffect(() => {
  //   const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjYXJsb3N0YXBpYW1AZ21haWwuY29tIiwiaWF0IjoxNzQ1NTMyMTg4LCJleHAiOjE3NDU1MzMwODh9.ralM30OGmvz1Scv5gO_2-Da02R-Mb9epIIrYdCnGkBB7vRPcQ5IAhth-xbAu1UstxV-Y82YLMVb1_mQc9ZYVPg';

  //   axios.get('http://localhost:9090/api/v1/avisos', {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   })
  //     .then(response => setDatos(response.data))
  //     .catch(error => console.error('Error:', error));
  // }, []);
  
  // return (
  //   <div className="h-screen flex items-center justify-center bg-gray-200">
  //     <h1 className="text-4xl font-bold text-blue-600">¡Todo listo con React + Tailwind! 🚀</h1>


  //     {datos ? <pre>{JSON.stringify(datos, null, 2)}</pre> : 'Cargando...'}

  //   </div>);
    
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9090/api/v1/auth/signin', {
        username,
        password
      });

      const token = response.data.accessToken;
      localStorage.setItem('token', token);

      alert('Login exitoso');
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
            onChange={(e) => setEmail(e.target.value)}
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
