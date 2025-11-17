import React, { useState } from "react"
import { Button, Container, Form, InputGroup, Row } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../../context/authContext"
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importa los íconos
import ErrorMessage from "../../components/errorMessage/ErrorMessage"
import authServices from "../../services/auth"
import auth from "../../services/auth"
import './login.css'

const Login = () => {
  const navigate = useNavigate();
  const {loginContext} = useAuth()
  const [errorMessage, setErrorMessage] = useState("")
  const [disabledButton, setDisabledButton] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  })

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  }
  
const showErrorMessage = (msg) => {
  setErrorMessage(msg)
  setTimeout(() => {
    setErrorMessage("")
  }, 5000)
}

  const handleChange = (e) => {

    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginCredentials.email || !loginCredentials.password) {
      showErrorMessage("Email o contraseña no pueden ser vacios")
      return ;
    }
    try {
      setDisabledButton(true)
      const data = await authServices.login(loginCredentials)
      loginContext(data)
      navigate("/")
    } catch (error) {
      if(error.response.status === 401) {
      showErrorMessage("Credenciales incorrectas")
      } else {
        showErrorMessage("No se pudo iniciar sesion, intente nuevamente")
      }
    }finally{
      setDisabledButton(false)
    }
    }
  return (
  <div className="login-container">
    <div className="login-card">
      <ErrorMessage msg={errorMessage} />
      <Form>
        <h1>Iniciar sesión</h1>
        <Row>
          <Form.Group className="mb-3 col-12" controlId="username">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control type="text" placeholder="user@gmail.com" name="email" onChange={handleChange}/>
          </Form.Group>

          <Form.Group className="mb-3 col-12" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <InputGroup>
              <Form.Control 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                name="password" 
                onChange={handleChange}
              />
              <Button variant="outline-secondary" onClick={toggleShowPassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
        </Row>

        <Button disabled={disabledButton} variant="primary" type="submit" className="w-100" onClick={handleLogin}>
          {disabledButton ? "Cargando..." : "Iniciar Sesión"}
        </Button>

        <p className="text-center mt-3">
          No tienes una cuenta? <a href="/register">Regístrate</a>
        </p>
      </Form>
    </div>
  </div>
);

}

export default Login