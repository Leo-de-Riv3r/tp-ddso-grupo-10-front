import React, { useState, useEffect } from "react"; 
import { Button, Col, Container, Form, FormGroup, Row, Spinner, ListGroup } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import axios from 'axios'; 
import { useAuth } from "../../context/authContext";
import ToastMessage from "../../components/toastMessage/ToastMessage";
import { FaCheckCircle } from "react-icons/fa";
import pedidoService from "../../services/pedidos.js";
import Swal from "sweetalert2";

const FinalizarCompra = () => {
  const { groupItemsByVendedor, cleanCart, cartItems } = useCart();
  const { user } = useAuth();
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ;
  const [direccionEntrega, setDireccionEntrega] = useState({
    calle: "",
    altura: "",
    codigoPostal: "",
    ciudad: "",
    provincia: "",
    pais: "",
    departamento: "",
    piso: "",
    lat: 0,
    lng: 0,
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [isLoadingSugerencias, setIsLoadingSugerencias] = useState(false);
  const [valorBusquedaLugar, setValorBusquedaLugar] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const handleCloseNotification = () => setShowNotification(false);


  useEffect(() => {
    const query = `${valorBusquedaLugar}`.trim();

    if (query.length < 4) {
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSugerencias(query);
    }, 600);

    return () => clearTimeout(timer);

  }, [valorBusquedaLugar]);

  const fetchSugerencias = async (query) => {
    const regex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])(?=.*\d).+$/;

    if (!regex.test(query)) {
      return 0;
    }


    if (query)
      setIsLoadingSugerencias(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            autocomplete: true,
            language: 'es',
            limit: 10,
            types: 'address'
          }
        }
      );

      const opciones = response.data.features.map(feature => ({
        id: feature.id,
        label: feature.place_name,
        feature: feature 
      }));
      setSugerencias(opciones);
    } catch (error) {
      showErrorMessage("No se pudieron cargar las sugerencias de dirección.");
    } finally {
      setIsLoadingSugerencias(false);
    }
  };

  const parseMapboxFeature = (feature) => {
    const data = {};
    const context = feature.context;

    data.calle = feature.text || '';
    data.altura = feature.address || ''; 

    if (context) {
      context.forEach(ctx => {
        const id = ctx.id.split('.')[0];
        if (id === 'postcode') data.codigoPostal = ctx.text;
        if (id === 'place') data.ciudad = ctx.text;
        if (id === 'region') data.provincia = ctx.text;
        if (id === 'country') data.pais = ctx.short_code.toUpperCase();
      });
    }

    data.lng = feature.geometry.coordinates[0];
    data.lat = feature.geometry.coordinates[1];
    return data;
  };


  const handleSugerenciaClick = (feature) => {
    const addressData = parseMapboxFeature(feature);

    setDireccionEntrega(prev => ({
      ...prev,
      ...addressData
    }));
    setSugerencias([]);
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    //try catch con pedidosService.js
    //mostrar spinner mientras carga subida de pedido

    const result = await Swal.fire({
    title: 'Finalizar compra',
    text: '¿Deseás confirmar tu compra?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;
  
  try{
    if (!cartItems || cartItems.length === 0) {
      Swal.fire('Carrito vacío', 'No tienes productos en el carrito.', 'error');
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id || user.id;

  if (!userId) {
    alert("Debes iniciar sesión para proceder con la compra.");
    return;
  }

  const pedidoData = {
    compradorId: userId,
    calle: direccionEntrega.calle || "Calle Falsa 123",
    altura: direccionEntrega.altura || "123",
    piso: direccionEntrega.piso || "1",
    departamento: direccionEntrega.departamento || "A",
    codigoPostal: direccionEntrega.codigoPostal || "1000",
    ciudad: direccionEntrega.ciudad || "Ciudad Ejemplo",
    provincia: direccionEntrega.provincia || "Provincia Ejemplo",
    pais: direccionEntrega.pais || "País Ejemplo",
    lat: direccionEntrega.lat || 0,
    lng: direccionEntrega.lng || 0,
    moneda: user.moneda || "DOLAR_USA",
    items: cartItems.map(item => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    }))
  };

  // Crear pedido en backend
  const nuevoPedido = await pedidoService.crearPedido(pedidoData);

  await Swal.fire({
      icon: 'success',
      title: '¡Pedido creado!',
      text: 'Serás redirigido a tus pedidos.',
      timer: 2000,
      showConfirmButton: false
    });

  cleanCart();
  setDisableSubmit(true)
  setShowNotification(true);
  setTimeout(() => {
    window.location.href = "/pedidos";
  }, 2500);

  }catch(error){
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo crear el pedido, intente nuevamente.'
    });
    setDisableSubmit(false);
  }
  }

  const handleValorBusquedaChange = (e) => {
    setValorBusquedaLugar(e.target.value);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDireccionEntrega({
      ...direccionEntrega,
      [name]: value
    });
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 5000)
  }

  return (
    <Container className="my-4">

      <ToastMessage showNotification={showNotification} handleCloseNotification={handleCloseNotification} header={<>PedidoCreado <FaCheckCircle size={20} style={{ color: "green" }} /></>}
        message="Tu pedido fue creado con exito, redigiendo a pagina de pedidos..." />

      <h1>Ingrese datos de envio</h1>
      <Form onSubmit={handleSubmitPedido}>
        <Form.Group className="mb-3 rounded round-2 bg-light p-2" controlId="monedaPago">

          <Form.Label>Moneda de pago</Form.Label>
          <Form.Select required>
            <option value="PESO_ARG">ARS</option>
            <option value="DOLAR_USA">USD</option>
            <option value="REAL">BRL</option>
          </Form.Select>
        </Form.Group>

        <FormGroup className="border p-3 rounded position-relative">
          <Row>
            <Col>
              <Form.Label>Lugar de entrega:</Form.Label>
              <Form.Control type="text" minLength={3} placeholder="Calle" name="calle" value={valorBusquedaLugar} onChange={handleValorBusquedaChange} required />
            </Col>
          </Row>

          {(isLoadingSugerencias || sugerencias.length > 0) && (
            <ListGroup
              className="shadow"
              style={{ maxHeight: '15rem', overflowY: 'auto' }}
            >
              {isLoadingSugerencias ? (
                <ListGroup.Item disabled>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Buscando...
                </ListGroup.Item>
              ) : (
                sugerencias.map(sug => (
                  <ListGroup.Item
                    key={sug.id}
                    action
                    onClick={() => handleSugerenciaClick(sug.feature)}
                  >
                    {sug.label}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}

          <Row className="mt-3">
            <Col lg={4}>
              <Form.Label>Codigo postal:</Form.Label>
              <Form.Control type="text" placeholder="Codigo postal" name="codigoPostal" value={direccionEntrega.codigoPostal} onChange={handleInputChange} required />
            </Col>
            <Col lg={4}>
              <Form.Label>Ciudad:</Form.Label>
              <Form.Control type="text" placeholder="Ciudad" name="ciudad" value={direccionEntrega.ciudad} onChange={handleInputChange} required disabled />
            </Col>
            <Col lg={4}>
              <Form.Label>Provincia:</Form.Label>
              <Form.Control type="text" placeholder="Provincia" name="provincia" value={direccionEntrega.provincia} onChange={handleInputChange} required disabled />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg={12}>
              <Form.Label>País:</Form.Label>
              <Form.Control type="text" placeholder="País" name="pais" value={direccionEntrega.pais} onChange={handleInputChange} required disabled />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg={6}>
              <Form.Label>Departamento: (Opcional)</Form.Label>
              <Form.Control type="text" placeholder="departamento" name="departamento" value={direccionEntrega.departamento || ''} onChange={handleInputChange} />
            </Col>
            <Col lg={6}>
              <Form.Label>Piso: (Opcional)</Form.Label>
              <Form.Control type="text" placeholder="piso" name="piso" value={direccionEntrega.piso || ''} onChange={handleInputChange} />
            </Col>
          </Row>
        </FormGroup>

        <Button type="submit" className="mt-3" disabled={disableSubmit}>Confirmar</Button>
      </Form>
    </Container>
  )
}
export default FinalizarCompra;