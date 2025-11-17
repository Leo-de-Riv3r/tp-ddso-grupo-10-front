import { Button, Card } from "react-bootstrap"
import React from "react"
import { Link } from "react-router"
const CardCategoria = ({item, handleAddITem}) => {
   return (
    <div className="carousel-card">
    <Card key={item} className="text-center">
      <Card.Body>
        <Card.Title>{item}</Card.Title>
        <Button as={Link} to={`/productos?categoria=${item}`} >
          Ver productos
        </Button>
      </Card.Body>
    </Card>
    </div>
  )
}

export default CardCategoria