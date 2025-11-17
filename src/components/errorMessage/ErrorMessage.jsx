import React from "react";
import { Card } from "react-bootstrap";

const ErrorMessage = ({msg}) => {
  return (
    msg ? 
    <Card
          border="danger" 
          style={{ backgroundColor: "#e9afafff"}}
          className="mb-2 outline-danger border-3 sticky-top"
        >
          <Card.Body>
            <Card.Title>Error</Card.Title>
            <Card.Text>
              {msg}
            </Card.Text>
          </Card.Body>
        </Card>
    : null
  )
}

export default ErrorMessage;