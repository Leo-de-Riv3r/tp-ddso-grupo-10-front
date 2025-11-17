import React from "react"
import { Button, Toast, ToastContainer } from "react-bootstrap"
import { FaCheckCircle } from "react-icons/fa"
import { Link } from "react-router"
import { useCart } from "../../context/CartContext"
const ToastProductoAgreagado = ({ producto, show, handleCloseNotification, cantidad }) => {
  const { totalCart, totalValueCart } = useCart()
  return (
    <ToastContainer
      className="p-3"
      position="bottom-end"
      style={{
    zIndex: 1050,  
    position: 'fixed'
  }}
    >
      <Toast show={show} onClose={handleCloseNotification}>
        <Toast.Header closeButton={true} className="d-flex justify-content-between">
          <div>Producto agregado <FaCheckCircle size={20} style={{ color: "green" }}/></div>
        </Toast.Header>
        <Toast.Body className="d-flex flex-direction-column">
          <div>
          {producto && <img src={producto.fotos[0]} alt={producto.titulo} style={{width: "5.5rem"}}/>}
          </div>
          <div>
          <h5>{producto ? producto.titulo : null}</h5>
          <p>{cantidad ? cantidad : 0} X ${producto ? producto.precio : null}</p>
           <strong>¡Agregado al carrito!</strong>
          <h6>Total ({totalCart ? totalCart : 0} productos): ${totalValueCart ? totalValueCart : 0}</h6>
           <Button as={Link} to="/carrito" variant="primary">Ver carrito</Button>
           </div>
           </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default ToastProductoAgreagado