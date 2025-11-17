import React from 'react';
import { useAuth } from "../context/authContext"
import { Navigate } from "react-router"
import MainPage from "../features/mainPage/MainPage"

const MainRouteRedirect = () => {
  const { user } = useAuth()
   if (!user || user.tipo === "COMPRADOR") {
      return <MainPage/>
  } else {
    return <Navigate to="/mis-productos" replace />  
  }
}

export default MainRouteRedirect;