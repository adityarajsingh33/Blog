import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  
  return !loading ? (
    <div className="min-h-screen flex flex-col bg-black-900">
      {/* Header */}
      <header className="w-ful shadow-md" style={{backgroundColor : "transparent", color : "white", backdropFilter : "blur ( 15px ) "}}>
        <Header />
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center" style={{background : "url(https://images.pexels.com/photos/28887851/pexels-photo-28887851/free-photo-of-abstract-geometric-3d-cubes-in-dynamic-composition.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)"}}>
        {/* Render the Outlet */}
        <Outlet />
      </main>
      
      {/* Footer */}
      
        <Footer />
      
    </div>
  ) : null;
  
}

export default App
