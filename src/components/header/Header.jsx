import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { HiBellAlert } from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router';
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/authContext';
import authServices from '../../services/auth';
import productosService from '../../services/productos';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { confirmAction,showSuccess } from '../../utils/confirmAction';

const Header = () => {
  const { totalCart, cartItems, totalValueCart, removeItem } = useCart();
  const { user, logoutContext } = useAuth();
  const suggestionsRef = useRef(null); 
  const [currentNotifications, setCurrentNotificacion] = useState(0);
  const [valorBusqueda, setValorBusqueda] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1); // -1 = sin selección
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target)
    ) {
      setShowSuggestions(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  const handleClose = () => setExpanded(false);

  // --- CARGA DE SUGERENCIAS ---
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (valorBusqueda.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await productosService.getProductos({
          valorBusqueda,
          perPage: 5,
          activo: true,
        });
        setSuggestions(response.data);
        setShowSuggestions(true);
        setHighlightIndex(-1);
      } catch (err) {
        console.error('Error al cargar sugerencias:', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [valorBusqueda]);

  // --- MANEJO DE TECLADO ---
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        if (prev === -1) {
          // Si no hay selección, sube al final
          return suggestions.length - 1;
        } else if (prev === 0) {
          // Si sube desde el primero, vuelve al texto original
          setHighlightIndex(-1);
          return -1;
        } else {
          return prev - 1;
        }
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0) {
        const selected = suggestions[highlightIndex];
        navigate(`/productos/${selected._id}`);
        resetSearch();
      } else if (valorBusqueda.trim() !== '') {
        navigate(`/productos?valorBusqueda=${valorBusqueda}`);
        resetSearch();
      }
    }
  };

  const resetSearch = () => {
    setValorBusqueda('');
    setSuggestions([]);
    setHighlightIndex(-1);
    setShowSuggestions(false);
    handleClose();
  };

  const handleLogout = async () => {
    logoutContext();
    navigate('/');
  };

  const carritoPreview = (
    <Popover
      id="popover-carrito"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <Popover.Header as="h3">Tu carrito</Popover.Header>
      <Popover.Body>
        {!totalCart ? (
          <p>El carrito está vacío</p>
        ) : (
          <><ul className="list-unstyled mb-0" style={{maxHeight: '15rem', overflowY: 'auto'}}>
              {cartItems.map((item) => (
                <li key={item.productoId} className="d-flex flex-direction-column mb-2">
                  <img src={item.foto} style={{ width: '4rem', height: '4rem' }} alt={item.nombre} />
                  <div className='d-flex flex-direction-row justify-content between  w-100'>
                  <div className="ms-2">
                    <a href={`/productos/${item.productoId}`} className='link-carrito-producto'>{item.nombre}</a> <br />x{item.cantidad} (${item.precioUnitario * item.cantidad})
                  </div>
                  <Button variant='danger ms-5' onClick={async () => {
                    const confirmed = await confirmAction({
                      title: "Eliminar producto?",
                      text: "Se eliminará este producto del carrito.",
                      confirmText: "Sí, eliminar",
                    });
                    if (!confirmed) return;
                    removeItem(item.productoId);
                    showSuccess("Producto eliminado del carrito.");
                  }} >
                    <RiDeleteBin6Fill size={20}/>
                  </Button>
                  </div>
                </li>
              ))}
            </ul>
            <strong>Total: ${totalValueCart}</strong>
            <Button className='w-100 text-center' as={Link} to="/finalizar-compra">Completar Compra</Button></>
        )}
      </Popover.Body>
    </Popover>
  );

  return (
    <header
      className=""
      aria-label="Header"
      aria-description="Header principal de Tiendasol"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="d-flex align-items-center position-relative">
        <Link
          to="/"
          className="navbar-brand"
          aria-label="Boton homepage"
          aria-description="Boton para ir a homepage"
        >
          <h1 id="title">Tienda  Sol</h1>
        </Link>
        
        {((user && user.tipo === 'COMPRADOR') || !user) && (
          <div className="position-relative flex-grow-1 ms-5">
            <Form
              className="d-flex"
              id="header-search"
              onSubmit={(e) => {
                e.preventDefault();
                  navigate(`/productos?valorBusqueda=${valorBusqueda}`);
                  resetSearch();
              }}
            >
              <Form.Control
                ref={inputRef}
                type="text"
                placeholder="Buscar productos..."
                value={valorBusqueda}
                onChange={(e) => setValorBusqueda(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => valorBusqueda.length >= 2 && setShowSuggestions(true)}
                autoComplete="off"
              />
              <Button variant="secondary" type="submit" className="d-flex align-items-center">
                <FaSearch aria-hidden="true" />
              </Button>
            </Form>

            {showSuggestions && suggestions.length > 0 && (
              <ul
                className="list-group position-absolute w-100  mt-0"
                ref={suggestionsRef} 
                style={{
                  zIndex: 11,
                  borderRadius: '0 0 8px 8px',
                }}
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={s._id}
                    className={`list-group-item list-group-item-action ${
                      idx === highlightIndex ? 'active' : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => {
                      navigate(`/productos/${s._id}`);
                      resetSearch();
                    }}
                  >
                    {s.titulo}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Navbar
        expand="lg"
        expanded={expanded}
        className="header-nav d-flex align-items-center gap-4 justify-content-between"
        aria-label="Navbar"
        aria-description="barra de navegacion"
        onToggle={setExpanded}
      >
        <Navbar.Toggle />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-lg"
          placement="end"
          style={{ backgroundColor: '#dfd9d9ff', opacity: '0.9' }}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg">Navegación</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3 gap-3 align-items-center">
              <Dropdown>
                <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
                  <FaUser />
                  {!user ? 'Ingresa' : user.nombre}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {user ? (
                    <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to={`/login`}>
                        Iniciar sesión
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={`/register`}>
                        Registrarse
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              {user ? (
                <Link to="/pedidos" className="nav-link" onClick={handleClose}>
                  Mis pedidos
                </Link>
              ) : null}
              {user && user.tipo === 'VENDEDOR' ? (
                <Link to="/mis-productos" className="nav-link" onClick={handleClose}>
                  Mis productos
                </Link>
              ) : null}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>

        <div className="icon-group d-flex align-items-center gap-4 me-5">
          {!user || user.tipo == "COMPRADOR" ? 
          <OverlayTrigger placement="bottom" overlay={carritoPreview} show={showPopover}>
            <div
              className="icon-item position-relative"
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
              onClick={() => setShowPopover(false)}
              aria-label={`Ir a carrito de compras, actualmente tienes ${totalCart} items`}
            >
              <Link to="/carrito">
                <FaShoppingCart size={30} />
                {totalCart}
              </Link>
            </div>
          </OverlayTrigger> : null}

          {user ? (
            <Link
              to="/notificaciones"
              className="icon-item position-relative"
              aria-label={`Ir a notificaciones, actualmente tienes ${currentNotifications} notificaciones`}
            >
              <HiBellAlert size={30} />
              {currentNotifications}
            </Link>
          ) : null}
        </div>
      </Navbar>
    </header>
  );
};

export default Header;
