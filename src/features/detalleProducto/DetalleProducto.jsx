import React, { useEffect, useState } from 'react';
import { data, Link, useParams } from 'react-router';
import productosMocked from '../../mocks/productos.json';
import { Button, Carousel, Col, Container, Form, Row } from 'react-bootstrap';
import './DetalleProducto.css'
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router';
import productosService from '../../services/productos';
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import { useCart } from '../../context/CartContext';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import { FaEnvelope, FaInbox, FaPhone } from 'react-icons/fa';
import { use } from 'react';
import ToastProductoAgreagado from '../../components/toast/ToastProductoAgregado';
const DetalleProducto = () => {
  const { productoId } = useParams();
  const [loading, setLoading] = useState(true)
  const [producto, setProducto] = useState(null)
  const {addItemToCart, cartItems} = useCart()
  const [errorMessage, setErrorMessage] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [productoToast, setProductoToast] = useState(null); 
  const [cantidadToast, setCantidadToast] = useState(0);

  const handleCloseToast = () => setShowNotification(false);

const showToast = (productoAgregado, cantidadAgregada) => {
    setProductoToast(productoAgregado);
    setCantidadToast(cantidadAgregada);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 10000);
  }


  const handleAddItem = (producto, cantidad) => {
    const item = cartItems.find(item => item.productoId === productoId)
    if(item && ( Number(item.cantidad)+ Number(cantidad)) > Number(producto.stock) )  {
      showErrorMessage("No hay suficiente stock para agregar al carrito")
      return;
    }

    if (!item && Number(cantidad) > Number(producto.stock)) return;
    addItemToCart({_id: productoId, ...producto}, cantidad);
    showToast(producto, cantidad);
  };



  const showErrorMessage = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage("");
    }, 10000);
  } 
  const [cantidad, setCantidad] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProduct = async() => {
    const dataApi = await productosService.getProducto(productoId);
    if (dataApi) {
      setProducto(dataApi)
    } else {
      showErrorMessage("No se pudo obtener producto, intente luego")
    }
    setLoading(false)
  }
  fetchProduct()
  }, [])

  return (
    <Container className='mt-4'>
      <ToastProductoAgreagado 
        handleCloseNotification={handleCloseToast} 
        producto={productoToast}
        show={showNotification} 
        cantidad={cantidadToast}
      />
      <ErrorMessage msg={errorMessage} />
      <Button onClick={() => navigate(-1)} variant="primary" className="mb-4" aria-label='Boton para volver atras'>
      <IoArrowBackSharp aria-hidden='true'/>Volver atras
    </Button>
    {loading ? <LoadingSpinner message="Cargando producto" /> :
      !producto ? <h1>Producto no encontrado</h1> : 
    <div className="card p-3 mb-4">
      <div className='card-body'>
      <Row>
        <Col lg={4} xs={12} md={6}>
        <h1 className='card-title'>{producto.titulo}</h1>
          <h4>Precio: {producto.precio} {producto.moneda === 'PESO_ARG' ? '$' : producto.moneda === 'DOLAR_USA' ? 'U$D' : 'BRL'}</h4>
          <h4>Stock: {producto.stock}</h4>
          <h4>Categorias</h4>
          {producto.categorias.map(cat => <span key={cat._id} className="badge bg-secondary">{cat.nombre}</span>)}
          <Form onSubmit={(e) => {
            e.preventDefault()
            //logica para agregar a carrito
            if (cantidad > 0 && cantidad <= producto.stock) {
              handleAddItem(producto, cantidad)
            }
          }}>
            <Form.Label>Ingrese cantidad a comprar</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={producto.stock}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Cantidad"
              name="cantidad" />
            <button id="add-item"className="btn btn-primary"> Agregar al carrito</button>
          </Form>
          </Col>
          <Col lg={8} md={6}>
          {producto.fotos.length ?
            <Carousel fade>
              {producto.fotos.map((foto, index) => (
                <Carousel.Item key={index} style={{ 'background-color': '#9b8a8aff' }}>
                  <img
                    className="d-block w-100 carousel-image"
                    src={foto}
                    alt="foto de producto" />
                </Carousel.Item>
              ))}
            </Carousel>
            : 'No hay fotos disponibles'}
            </Col>
            </Row>
            <Row>
              <Col xs={12} md={6} lg={4}>
<h4>Datos de vendedor:</h4>
            <h6>{producto.vendedor.nombre}</h6>
            <p><FaPhone></FaPhone> {producto.vendedor.telefono}</p>
            <p><FaEnvelope></FaEnvelope> {producto.vendedor.email}</p>

            </Col>
              <Col>
            <h4>Descripción:</h4>
            <p>{producto.descripcion}</p>
            </Col> 
            </Row>
        </div>

      </div>}</Container>
  )
}

export default DetalleProducto;