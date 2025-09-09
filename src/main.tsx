import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProtectedRoute  from './ProtectedRoute.jsx'

import './index.css'
import Home from './Home.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/signin' element={ <App/>} ></Route>
        <Route path='/home' element={ <ProtectedRoute><Home/></ProtectedRoute>}></Route>
        <Route path='/*' element={<App/>} ></Route>
      </Routes>
    </Router>
  </React.StrictMode>,
)
