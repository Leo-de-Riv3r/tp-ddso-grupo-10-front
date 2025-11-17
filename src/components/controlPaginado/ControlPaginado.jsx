import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const ControlPaginado = ({ pagination, onPageChange }) => {  
  if (!pagination || pagination.total_pages <= 1) {
    return null;
  }
  //cambiar segun pantalla
  let limitPages = 2
  const getNextPages = () => {
    let pages = []
    for (let i = 1; i <= limitPages; i++) {
        if (pagination.page + i <= pagination.total_pages) {
          pages.push(
            <Button
          variant="primary"
          onClick={() => onPageChange(pagination.page + i)}
          aria-label={`Ir a la página, ${pagination.page + i}`}>
          {pagination.page + i}
        </Button>
          )
        }
      }
      return pages
  }

  const getPrevPages = () => {
    let pages = []
    for (let i = 1; i <= limitPages; i++) {
        if (pagination.page - i >=1) {
          pages.push(
            <Button
          variant="primary"
          onClick={() => onPageChange(pagination.page - i)}
          aria-label={`Ir a la página, ${pagination.page - i}`}>
          {pagination.page - i}
        </Button>
          )
        }
      }
      return pages.reverse()
  }


  return (
    <nav className="d-flex justify-content-center align-items-center gap-3 my-4" aria-label='Navegacion de paginas'>
      
      {pagination.page > 1 && (
        <Button
          variant="primary"
          onClick={() => onPageChange(1)}
          aria-label="Ir a la primera página"
        >
          <FaAngleDoubleLeft aria-hidden="true" />
        </Button>
      )}

      {getPrevPages()}
      {<Button variant='outline-primary' aria-label={`Pagina actual: ${pagination.page}`}>
        {pagination.page}
        </Button>}
      {getNextPages()}

      {pagination.page < pagination.total_pages && (
        <Button
          variant="primary"
          onClick={() => onPageChange(pagination.total_pages)}
          aria-label={`Ir a la última página, ${pagination.total_pages}`}
        >
          <FaAngleDoubleRight aria-hidden="true" />
        </Button>
      )}
    </nav>
  );
}

export default ControlPaginado;