import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({message}) => 
  <div className="text-center">
      <Spinner 
        animation="border" 
        role="status" 
        style={{ width: '10rem', height: '10rem' }}
      >
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="mt-2">{message}...</p>
    </div>

export default LoadingSpinner