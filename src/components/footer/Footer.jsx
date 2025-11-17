import { Button } from 'react-bootstrap';
import './Footer.css'
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="d-flex flex-md-row flex-column justify-content-between align-items-center p-3 bg-light">
      <h1 className="fs-5 text-center text-md-start mb-3 mb-md-0">
        Derechos reservados &copy; 2025
      </h1>
      <ul className="list-unstyled d-flex flex-md-row flex-column gap-3 text-center text-md-end m-0">
        <li>Contacto</li>
        <li>Términos y condiciones</li>
        <li><Button as={Link} to={"/landing"} variant='none'>Sobre nosotros</Button></li>
      </ul>
    </footer>
  );
};


export default Footer;