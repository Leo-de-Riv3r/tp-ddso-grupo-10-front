import React, { useState, useRef, useSyncExternalStore, useEffect } from 'react';
import { FaArrowCircleRight } from "react-icons/fa";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaAngleDoubleLeft } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { Form, Button, Accordion, ListGroup } from 'react-bootstrap';
import productosService from '../../services/productos';
import Select from 'react-select';

const FiltrosBusqueda = ({ onSubmit, filtrosActuales }) => {
  const [filtros, setFiltros] = useState(filtrosActuales || {});
  const [categorias, setCategorias] = useState([]);

  const handleChangeCategory = (selectedOption) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      categoria: selectedOption ? selectedOption.value : ""
    }));
  }

  const categoryOptions = categorias.map(c => ({
    value: c, // El valor puede ser el string simple
    label: c  // El texto a mostrar y buscar
  }));

  const handleInputChange = (e) => {
    const{name, value} = e.target
    setFiltros({ ...filtros, [name]: value});
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...filtros, page: 1 });
  };

  const selectedOptionObject = categoryOptions.find(
    option => option.value === filtros.categoria
  ) || null;

  useEffect(() => {
      const fetchCategories = async () => {
        try {
          const categorias = await productosService.getCategorias()
          if (categorias) {
            setCategorias(categorias)
          }
        } catch (err) {
          console.log(err)
          console.log('error')
        }
      }
      fetchCategories()
    }, [])

  const formFiltro = (
    <Form onSubmit={handleSubmit}>
        <label id="rangoPrecioLabel" className="form-label">Rango de precios</label>
        <section className="d-flex flex-direction-row mb-3" aria-labelledby="rangoPrecioLabel">
          <Form.Group controlId="filtroPrecioMin" className="me-2 flex-grow-1">
            <Form.Label className="visually-hidden">Precio mínimo</Form.Label>
            <Form.Control
              type="number"
              min={0}
              placeholder="Mínimo"
              name="precioMin"
              value={filtros.precioMin || ''}
              onChange={handleInputChange}
              aria-label="Precio mínimo" 
            />
          </Form.Group>

          <Form.Group controlId="filtroPrecioMax" className="ms-2 flex-grow-1">
            <Form.Label className="visually-hidden">Precio máximo</Form.Label>
            <Form.Control
              type="number"
              placeholder="Máximo"
              name="precioMax"
              min={0}
              value={filtros.precioMax || ''}
              onChange={handleInputChange}
              aria-label="Precio máximo" 
            />
          </Form.Group>
        </section>
        <Form.Group controlId="filtroOrdenarPor" className="mb-2">
          <Form.Label>Ordenar por</Form.Label>
          <Form.Select
            name="ordenarPor"
            value={filtros.ordenarPor || ''}
            onChange={handleInputChange}
          >
            <option value="">Seleccionar</option>
            <option value="PRECIO">Precio</option>
            <option value="VENTAS">Ventas</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="filtroOrden" className="mb-3">
          <Form.Label>Orden</Form.Label>
          <Form.Select
            name="orden"
            value={filtros.orden || ''}
            onChange={handleInputChange}
          >
            <option value="DESC" selected>Descendente</option>
            <option value="ASC">Ascendente</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="filtroPerPage" className="mb-3">
          <Form.Label>Productos por página</Form.Label>
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

        <Form.Group className='mb-4'>
        <Form.Label>Categoria</Form.Label>
        <Select
          options={categoryOptions}
          onChange={handleChangeCategory}
          value={selectedOptionObject}
          placeholder="Buscar y seleccionar categoría..."
          isSearchable={true}
          isClearable={true}
          name="categoria"
          className="flex-grow-1"
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
};

      export default FiltrosBusqueda;
