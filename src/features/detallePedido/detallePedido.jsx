import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Table,Button } from 'react-bootstrap';
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import pedidoService from '../../services/pedidos.js';
import { confirmAction, showSuccess, showError } from '../../utils/confirmAction.js';
import CardPedido from '../../components/cards/CardPedido.jsx';

// Función para darle color al estado
const estadoColor = (estado) => {
    switch (estado) {
        case "PENDIENTE": return "secondary";
        case "CONFIRMADO": return "primary";
        case "EN_PREPARACION": return "warning";
        case "ENVIADO": return "info";
        case "ENTREGADO": return "success";
        case "CANCELADO": return "danger";
        default: return "light";
    }
  };

const DetallePedido = () => {
  const { pedidoId } = useParams();
  const navegar = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPedido = async () => {
      setLoading(true);
      try {
        // el backend devuelve { data: [...], pagination: {...} }
        const pedidoEncontrado = await pedidoService.obtenerPedidoPorId(pedidoId);
        if (pedidoEncontrado) {
          setPedido(pedidoEncontrado);
        } else {
          setErrorMessage("Pedido no encontrado");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Error al cargar el pedido");
      } finally {
        setLoading(false);
      }
    };

    if (pedidoId) fetchPedido();
  }, [pedidoId]);
  
  const handleCancelarPedido = async () => {
      try {
     if (!pedido) return;
      const confirmacion = await confirmAction({
        title: "Cancelar pedido?",
        text: "¿Estás seguro que deseas cancelar este pedido?",
        confirmText: "Sí, cancelar",
      });
      if (!confirmacion) return;
      
      setLoading(true);
    
      await pedidoService.actualizarEstadoPedido(pedidoId, "CANCELADO", { motivo: "Cancelado por el usuario desde detalle" });
      setPedido(prev => ({ ...prev, estado: "CANCELADO" }));
      showSuccess("Pedido cancelado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo cancelar el pedido");
      showError("No se pudo cancelar el pedido");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner message="Cargando detalle..." />;
  if (!pedido) return <ErrorMessage msg={errorMessage || "Pedido no encontrado"} />;
  
  return (
    <Container className="mt-5 d-flex flex-column align-items-center">

    <div style={{alignSelf: 'flex-start', marginBottom: '1rem'}}>
        <Button variant="outline-secondary" onClick={() => navegar(-1)}>
            &larr; Volver
        </Button>
    </div>

      <CardPedido 
      pedido={pedido} 
      onPedidoCancelado={handleCancelarPedido} 
      ShowDetalleBtn={false}
      >
        <Badge bg={estadoColor(pedido.estado)}>{pedido.estado}</Badge>
      </CardPedido>
    </Container>
  );
};

export default DetallePedido;