import React from 'react'
import ReactDOM from 'react-dom/client'
import Signin from './Signin.tsx'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'

import './index.css'
import Avisos from './Avisos.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/signin' element={<Signin/>} ></Route>
        <Route path='/avisos' element={ <Avisos/>}></Route>
        <Route path='/' element={<Avisos/>} ></Route>
        <Route path='*' element={<Avisos/>} ></Route>
      </Routes>
    </Router>
  </React.StrictMode>,
)
