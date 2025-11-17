import React from "react"
import { Button, Card } from "react-bootstrap"
import './CardVendedor.css'
import { Link } from "react-router"
const CardVendedor = ({ item }) => {
  return (
    <div className="carousel-card">
    <Card key={item._id} className="text-center">
      <Card.Body>
        <Card.Title>{item.nombre}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Contactos</Card.Subtitle>
        <Card.Text>
          Email {item.email}
        </Card.Text>
        <Card.Text>
          Tel: {item.telefono}
        </Card.Text>
        <Button as={Link} to={`/productos?vendedorId=${item._id}`} >
          Ver productos
        </Button>
      </Card.Body>
      
    </Card>
    </div>
  )
}

export default CardVendedor