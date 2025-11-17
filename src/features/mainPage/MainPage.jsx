import React, { useEffect, useState } from 'react';
import './MainPage.css';
import Logo from "../../media/tiendaSolLogo.png"
import { Card, CarouselItem, Container } from 'react-bootstrap';
import productosService from '../../services/productos';
import vendedoresService from '../../services/vendedores';
import vendedoresMocked from '../../mocks/vendedores.json';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import CardProductoResumen from '../../components/cards/CardProductoResumen';
import Vendedores from '../../services/vendedores';
import CarouselItems from '../../components/productosCarousel/CarouselItems';
import CardVendedor from '../../components/cards/CardVendedor';
import LoadingProduct from '../../components/loadingProduct/LoadingProduct';
import LoadingVendedor from '../../components/loadingVendedor/LoadingVendedor';
import CardCategoria from '../../components/cards/CardCategoria';
import { useCart } from '../../context/CartContext';
import ToastProductoAgreagado from '../../components/toast/ToastProductoAgregado';

const MainPage = () => {
  const [productos, setProductos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const {addItemToCart, cartItems} = useCart()
  const [productToShow, setProductToShow] = useState(null)
  const [showNotification, setShowNotification] = useState(false)

  const fetchProductos = async () => {
      try {
      const productosApi = await productosService.getProductosMasVendidos()
      setProductos(productosApi.data)

      const categoriasApi = await productosService.getCategorias()
      setCategorias(categoriasApi)
    }
       catch(err) {
        setErrorMessage('No se pudo comunicar con el servidor, intente nuevamente o vuelva luego')
      } finally{
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchProductos()
  }, [])

    const showToast = (producto) => {
    setShowNotification(true)
    setProductToShow(producto)
    setTimeout(() => {
      setShowNotification(false)
    }, 10000)
  }

  const handleCloseToast = () => setShowNotification(false);

  const handleAddItem = (producto) => {
    const item = cartItems.find(item => item.productoId === producto._id)
    if(item && Number(item.cantidad) + 1 > Number(producto.stock)) {
      showErrorMessage("No hay suficiente stock para agregar al carrito")
      return;
    }
    addItemToCart(producto, 1);
    showToast(producto)
  };

  const showErrorMessage = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage("");
    }, 6000);
  } 

  return (
    <>
    <Container>
      <ToastProductoAgreagado cantidad={1} handleCloseNotification={handleCloseToast} producto={productToShow} show={showNotification}></ToastProductoAgreagado>
      <div className='d-flex justify-content-center mt-4 rounded-3 align-items-center border border-2 border-dark ' style={{backgroundColor: "#d9dfafff"}}>
        <img src={Logo} style={{ "width": "7rem" }} />
        <h1>Explora nuestro principal catalogo</h1>
      </div>
      {errorMessage ? <ErrorMessage msg={errorMessage}></ErrorMessage> : null}
      <section className='mt-4 rounded-3 text-center'>
      <h3 className='my-2 section-title'>Los mas vendidos</h3>
      {loading ? 
      <div className="d-flex justify-content-between">
        {[1,2,3].map( (numero) => <LoadingProduct key={numero}/>)}
      </div> : 
        productos && productos.length > 0 ? <CarouselItems items={productos} CardItem={CardProductoResumen} handleAddItem={handleAddItem}></CarouselItems>
       : <p>No se encontraron productos</p>}
      </section>
      <section className='mt-4 rounded-3 text-center mb-4'>
        <h3 className='my-2 section-title'>Categorias</h3>
        {categorias && categorias.length > 0 ? 

        <CarouselItems items={categorias} CardItem={CardCategoria}></CarouselItems>
        : <p>No se encontraron categorias</p>}


      </section>
      </Container>
      </>
  )
}

export default MainPage;