import React from "react";
import { useState, useEffect } from "react";
import { data, Link, useParams } from "react-router";
import { IoArrowBackSharp } from "react-icons/io5";
import { Form, Button, Card, Accordion, Spinner, Toast } from "react-bootstrap";
import productosMocked from "../../mocks/productos.json";
import CardProducto from "../../components/cards/CardProducto";
import FiltrosBusqueda from "../FiltrosBusqueda/FiltrosBusqueda";
import LoadingSpinner from "../../components/spinner/LoadingSpinner";
import ControlPaginado from "../../components/controlPaginado/ControlPaginado";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import { useNavigate } from "react-router";
import { useSearchParams } from 'react-router';
import productoService from "../../services/productos";
import { useCart } from "../../context/CartContext";
import ToastMessage from "../../components/toastMessage/ToastMessage";
import ToastProductoAgreagado from "../../components/toast/ToastProductoAgregado";

const ProductosVendedor = () => {
  const [productos, setProductos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams({});
  const [filtros, setFiltros] = useState({});
  const [errorMessage, setErrorMessage] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [productToShow, setProductToShow] = useState(null)
  const navigate = useNavigate();
  const [cantidadToShow, setCantidadToShow] = useState(0)
  const [pagination, setPagination] = useState(null);
  const {addItemToCart, cartItems} = useCart()

  const showToast = (producto) => {
    setShowNotification(true)
    setProductToShow(producto)
    setTimeout(() => {
      setShowNotification(false)
    }, 10000)

  }

  const handleCloseToast = () => setShowNotification(false);

  const handleAddItem = (producto, cantidad) => {
    const item = cartItems.find(item => item.productoId === producto._id)
    if(item && Number(item.cantidad) + Number(cantidad) > Number(producto.stock)) {
      showErrorMessage("No hay suficiente stock para agregar al carrito")
      return;
    }

    addItemToCart(producto, cantidad)
    setCantidadToShow(cantidad)
    showToast(producto)
  };

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

    if (filtros.precioMin && filtros.precioMax && filtros.precioMin >= filtros.precioMax) {
      showErrorMessage("El precio mínimo no puede ser mayor al precio máximo")
      return;
    }

    const newFiltros = {};
    Object.entries(filtros).forEach(([key, value]) => {
      newFiltros[key] = value;
    });
    setSearchParams({ ...newFiltros, page: 1 });
  }

  const handleChangePage = (page) => {
    if (loading) {
      showErrorMessage("Espere a que carguen los vendedores")
      return
    }
    const filtrosActuales = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...filtrosActuales, page });
  }

  const fetchData = async () => {
          setLoading(true)
          let filtros = Object.fromEntries(searchParams.entries());
          if (filtros.perPage && filtros.perPage <= 0) {
            filtros.perPage = 10
            //change the search param 
            setSearchParams({ ...filtros, page: 1 });
          }
          try {
              const dataApi = await productoService.getProductos({...filtros})
              if (dataApi) {
                  setProductos(dataApi.data)
                  setPagination(dataApi.pagination)
              } else {
                  showErrorMessage("Error obteniendo producto, intente luego")
              }
          } catch (err) {
              showErrorMessage("Servidor no disponible, intente luego")
          } finally {
              setLoading(false)
          }
      }
  useEffect(() => { fetchData()}, [searchParams])

  return (
    <div className="container mt-4">
      <ErrorMessage msg={errorMessage}/>
      <ToastProductoAgreagado handleCloseNotification={handleCloseToast} producto={productToShow} show={showNotification} cantidad={cantidadToShow}/>
      
      <div className="row">
        <div className="mb-4 col-lg-3 col-md-5 col-12">
          <FiltrosBusqueda onSubmit={handleFiltrar} filtrosActuales={Object.fromEntries(searchParams.entries())} />
        </div>

        <main className="col-lg-9 col-md-7 col-12 ">
          <h1 className="mb-4">Productos disponibles</h1>
          {loading ? (
            <LoadingSpinner message="Cargando productos" />
          ) : !productos || productos.length === 0 ? (
            <p>No se encontraron productos.</p>
          ) : (
            <>
              <ControlPaginado onPageChange={handleChangePage} pagination={pagination} />
              <div id="productos">
              {productos.map((p) => (
                <CardProducto key={p.id || p._id} producto={p} handleAddCart={handleAddItem} />
              ))}
              </div>
            </>
          )}
          <ControlPaginado onPageChange={handleChangePage} pagination={pagination} />
        </main>
      </div>
    </div>
  )
}

export default ProductosVendedor;