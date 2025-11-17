import React from 'react';
import Logo from "../../media/tiendaSolLogo.png"
import "./LandingPage.css"
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { Link } from 'react-router';
const LandingPage = () => {
  return (
    <>
      <div className='container-fluid'>
        <Row className='d-flex justify-content-center text-center main-logo rounded-top-3'>
            <img src={Logo} style={{ "width": "15rem" }} />
            <h1>Tu plataforma ideal para comprar y vender en línea</h1>
        </Row>
        <Row>
          <Col lg={6} md={6} className='for-buyers rounded-3'>
            <h4>Para compradores</h4>
            <ul>
              <li>Compra productos segun vendedor</li>
              <li>Observa el estado de tus pedidos</li>
              <li>Accede a notificaciones sobre tus pedidos</li>
            </ul>
          </Col>
          <Col lg={6} md={6} className='for-sellers rounded-3'>
            <h4>Para vendedores</h4>
            <ul>
              <li>Publica y edita tus productos</li>
              <li>Gestiona pedidos realizados sobre tus productos</li>
              <li>Accede a notificaciones sobre pedidos recibidos</li>
            </ul>
          </Col>
          <Col className="d-flex flex-column align-items-center p-3 rounded-bottom-4 register-login">
            <h4>¡Ingresa ahora y descubre lo que TiendaSol puede ofrecerte!</h4>
            <Stack gap={5} direction='horizontal' className='mx-auto'>
              <Button variant="light" aria-label='Iniciar sesion' as={Link} to={`/login`}>Iniciar sesión</Button>
              <Button variant="dark" aria-label='Registrate' as={Link} to={`/register`}>Registrarse</Button>
            </Stack>
          </Col>
        </Row>
      </div>
    </>
  )
};

export default LandingPage;