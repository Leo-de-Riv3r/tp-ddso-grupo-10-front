import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { Button, Card, Form } from "react-bootstrap"
import { Link } from "react-router"
import { FaCartPlus } from "react-icons/fa";
import './CardProducto.css'

const CardProducto = ({ producto, handleAddCart }) => {
  const [cantidad, setCantidad] = useState(1);
  const getImageUrl = () => {
    if (producto.fotos && producto.fotos.length > 0) {
      return producto.fotos[0];
    }
    return "https://placehold.co/600x400?text=Sin+imagen";
  };
  return (
    <section className="card card-shadow-sm p-3 d-flex flex-row bg-dark-hover" key={producto.id}>
      <div className="product-img d-flex">
        <img src={getImageUrl()}  className="card-img-top" aria-label='Imagen de producto'
        style={{height: "10rem"}, {width: "10rem"}}
        />
      </div>
      <div className="card-body">
        <Card.Title>{producto.titulo}</Card.Title>
        <p>
          <strong>Precio:</strong> {producto.precio} {producto.moneda}
        </p>
        <p>
          <strong>Stock: {producto.stock}</strong>
        </p>

        {producto.categorias.map(cat => <span key={cat} className="badge bg-secondary me-2">{cat}</span>)}
        <p>Vendido por: {producto.vendedor.nombre}</p>
      </div>

        {Number(producto.stock) > 0 ?  <div className="d-grid gap-1 card-buttons"><Button as={Link} to={`/productos/${producto._id}`} variant="primary">
          Ver mas
        </Button><Form onSubmit={(e) => {
          e.preventDefault();
          //logica para agregar a carrito
          if (cantidad > 0 && cantidad <= producto.stock) {
            handleAddCart(producto, cantidad);
          }
        } }>
            <Form.Control
              type="number"
              min={0}
              max={producto.stock}
              placeholder="Cantidad"
              name="cantidad"
              required={true}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)} />
            <Button type='submit' variant='primary' disabled={!(cantidad > 0)} >
              <FaCartPlus aria-hidden="true" style={{ "font-size": "2rem" }} />
              Agregar
              </Button>
          </Form></div>: 
        <Button disabled variant="secondary" style={{height: "20%;"}} >Sin stock</Button>}
    </section>
  )
}

export default CardProducto