import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import FiltrosBusquedaProductosVendedor from '../filtrosBusquedaProductosVendedor/FiltrosBusquedaProductosVendedor';
import CardProducto from '../../components/cards/CardProducto';
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import ControlPaginado from '../../components/controlPaginado/ControlPaginado';
import CardProductoVendedor from '../../components/cards/CardProductoVendedor';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import { Link } from 'react-router';
import { IoIosAddCircle } from "react-icons/io";
import { useAuth } from '../../context/authContext';
import productosService from '../../services/productos';

const MisProductos = () => {
  const { user } = useAuth();
  const [modalShow, setModalShow] = useState(false);
  const [productos, setProductos] = useState(null)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [filtros, setFiltros] = useState({})

  const showErrorMessage = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage("");
    }, 6000);
  }

  const handleFiltrar = (filtros) => {
    if (loading) {
      showErrorMessage("Espere a que carguen los productos")
      return
    }
    setFiltros(filtros)
  }

  const handleChangePage = (page) => {
    if (loading) {
      showErrorMessage("Espere a que carguen los productos")
      return
    }

    setFiltros({ ...filtros, page })
    fetchProductos()
  }

const handleClose = () => setModalShow(false);



const fetchProductos = async () => {
  setLoading(true)
  try {
    const response = await productosService.getProductos({vendedorId: user.id, ...filtros})
    setProductos(response.data)
    setPagination(response.pagination)
  } catch (error) {
    showErrorMessage("Error obteniendo productos")
  } finally{
    setLoading(false)
  }
}

useEffect(() => {
  fetchProductos()
}, [filtros])

  return (
    <Container className='mt-4 mb-4'>
      <ErrorMessage msg={errorMessage} />
      <Row>
        <Col lg={3} md={5} xs={12} className="mb-4">
          <FiltrosBusquedaProductosVendedor onSubmit={handleFiltrar} filtrosActuales={filtros}/>
        </Col>
        <Col lg={9} md={7} xs={12}>
          <ControlPaginado onPageChange={handleChangePage} pagination={pagination}></ControlPaginado>
          <Button as={Link} to={"/mis-productos/crear"} aria-label='Boton para agregar un nuevo producto' className='mb-3'>
          <IoIosAddCircle aria-hidden="true" style={{fontSize: "2rem"}}/>
          Crear producto</Button>
          {loading ? <LoadingSpinner message="Cargando prductos" /> : !productos || productos.length === 0 ? <p>No se encontraron producto.</p> :
            productos.map(producto => <CardProductoVendedor producto={producto} key={producto._id} />)
          }
        </Col>
      </Row>
    </Container>
  )
}

export default MisProductos;
