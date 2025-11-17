import React from "react";
import { Card } from "react-bootstrap";

const WarningMessage = ({title, msg}) => {
  return (
    msg ? 
    <Card
          border="warning" 
          style={{ backgroundColor: "#E6E698"}}
          className="mb-2 outline-warning border-3"
        >
          <Card.Body>
            {title ? <Card.Title>{title}</Card.Title> : null}
            <Card.Text>
              {msg}
            </Card.Text>
          </Card.Body>
        </Card>
    : null
  )
}

export default WarningMessage;