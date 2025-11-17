import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router';
import './NotFound.css'

const NotFound = () => {
  return (
    <div>
        <Container>
            <div>
            <section className='border border-2 border-dark mt-4 rounded-3 text-center'>
                <h3 className='my-2 section-title'>La pagina a la que has intentado acceder no existe</h3>
                </section>
            </div>
        </Container>
        <div className="botonInicio">
            <Button as={Link} to={"/"} className="boton">Volver a inicio</Button>
        </div>
    </div>
  )
}

export default NotFound

/*<Link to="/" className="nav-link" aria-label='Ver mis pedidos' onClick={handleClose}>Volver a inicio</Link>*/