import React from 'react'
import ReactDOM from 'react-dom/client'
import Signin from './Signin.tsx'
import Signup from './Signup.tsx'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
// import ProtectedRoute from './ProtectedRoute.tsx'

import './index.css'
import Avisos from './Avisos.tsx'
import EditarAviso from './EditarAviso.tsx'
import DetalleAviso from './DetalleAviso.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/signin' element={<Signin/>} ></Route>
        <Route path='/signup' element={<Signup/>} ></Route>
        <Route path='/avisos' element={ <Avisos/>}></Route>
        <Route path='/crear' element={<EditarAviso/>} ></Route>
        <Route path='/avisos/:slug/editar' element={<EditarAviso/>} ></Route>
        <Route path='/avisos/:slug' element={<DetalleAviso/>} ></Route>
        <Route path='/' element={<Avisos/>} ></Route>
        <Route path='*' element={<Avisos/>} ></Route>
      </Routes>
    </Router>
  </React.StrictMode>,
)
