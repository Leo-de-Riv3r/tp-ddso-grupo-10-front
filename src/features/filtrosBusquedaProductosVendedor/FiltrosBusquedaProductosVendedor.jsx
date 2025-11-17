import React, { useState } from 'react';
import { Form, Button, Accordion } from 'react-bootstrap';
import { FaSearch } from "react-icons/fa";
const FiltrosBusquedaProductosVendedor = ({ onSubmit, filtrosActuales }) => {
  const [filtros, setFiltros] = useState(filtrosActuales || {});

  const handleInputChange = (e) => {
    const{name, value} = e.target
    setFiltros({ ...filtros, [name]: value });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...filtros, page: 1 });
  };

  const formFiltro = (
    <Form onSubmit={handleSubmit} role='search'>
      <Form.Group controlId="filtroBusqueda" className="mb-3">
        <Form.Label>Buscar por término</Form.Label>
        <Form.Control
          type="text"
          placeholder="Buscar..."
          name="valorBusqueda"
          value={filtros.valorBusqueda || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="filtroPerPage" className="mb-3">
        <Form.Label>Productos por página</Form.Label>
        <Form.Control
          type="number"
          min={1}
          max={30}
          placeholder='Cantidad de productos por pagina'
          name="perPage"
          value={filtros.perPage || 10}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="filtroActivos" className="mb-2">
                <Form.Label>¿Mostrar activos?</Form.Label>
                <Form.Select
                  name="activo"
                  value={filtros.activo || ''}
                  onChange={handleInputChange}
                >
                  <option value="true" selected>Si</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
      <Button type='submit'>
        <FaSearch aria-hidden="true" /> Buscar
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
};

export default FiltrosBusquedaProductosVendedor;
