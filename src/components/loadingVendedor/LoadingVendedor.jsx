import { Button, Card } from "react-bootstrap";
import React from "react";
const LoadingVendedor = () => {
  return (
    <Card className="text-center" aria-hidden="true" style={{width: "33%"}}>
      <Card.Body>
        <Card.Title className="placeholder-glow">
          <span className="placeholder col-6"></span>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted placeholder-glow">
          <span className="placeholder col-4"></span>
        </Card.Subtitle>
        <Card.Text className="placeholder-glow">
          <span className="placeholder col-6"></span>
        </Card.Text>
        <Card.Text>
          <span className="placeholder col-6"></span>
        </Card.Text>
        <a className="btn btn-primary disabled placeholder col-6" aria-disabled="true"></a>
      </Card.Body>
      
    </Card>
  )
}

export default LoadingVendedor;