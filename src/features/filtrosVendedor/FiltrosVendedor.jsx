import React, { useEffect, useState } from 'react';
import { Form, Button, Accordion } from 'react-bootstrap';
import { FaArrowCircleRight, FaArrowCircleLeft, FaAngleDoubleLeft, FaAngleDoubleRight, FaSearch } from "react-icons/fa";
import { IoAlertOutline } from 'react-icons/io5';
const FiltrosVendedor = ({handleSubmit, filtrosActuales}) => {
  const [filtros, setFiltros] = useState(filtrosActuales || {});

  const handleInputChange = (e) => {
    const {name, value} = e.target
    setFiltros({ ...filtros, [name]: value})
  };

  const onSubmit = (e) => {
    e.preventDefault()
    handleSubmit({ ...filtros, page: 1 });
  };

  const formFiltro = (
    <Form onSubmit={onSubmit} role='search'>
      <Form.Group controlId="filtroBusqueda" className="mb-3">
        <Form.Label>Buscar por término</Form.Label>
        <Form.Control
          placeholder="Buscar..."
          name="valorBusqueda"
          value={filtros.valorBusqueda || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
        <Form.Group controlId="filtroPerPage" className="mb-3">
          <Form.Label>Vendedores por pagina</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={30}
            placeholder=""
            name="perPage"
            value={filtros.perPage || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button type='submit'>
          <FaSearch aria-hidden="true"/> Buscar
        </Button>
      </Form>
      )
      return (
      <><div className="d-none d-lg-block d-md-block">
        {formFiltro}
      </div><div className="d-lg-none d-md-none">
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Filtros</Accordion.Header>
              <Accordion.Body>
                {formFiltro}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
        </>
      );
}

export default FiltrosVendedor