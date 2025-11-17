import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import CardPedido from '../../components/cards/CardPedido';
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import ControlPaginado from '../../components/controlPaginado/ControlPaginado';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import pedidoService from '../../services/pedidos.js'; 
import { confirmAction, showSuccess } from '../../utils/confirmAction.js';


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

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    PorPagina: 5,
    total: 0,
    total_pages: 1
  });
  
  const user = JSON.parse(localStorage.getItem("user"));
  const usuarioId = user?._id || user?.id;



  const fetchPedidos = async (page=1) => {
  setLoading(true);
  try {
    // podés agregar estado o paginación después
    const response = await pedidoService.obtenerPedidos({ usuarioId, page, limit: pagination.PorPagina });

    const pedidosData = response.data || [];
    const paginaActual = response.pagina || 1;
    const porPaginaActual = response.PorPagina || 5; 
    const totalPedidos = response.total || 0;
    const totalPaginas = response.totalPaginas || 1;

    // si tu backend devuelve algo como { docs, totalDocs, limit, page, totalPages }
    setPedidos(pedidosData);
    setPagination({
      page: paginaActual,
      PorPagina: porPaginaActual,
      total: totalPedidos,
      total_pages: totalPaginas
    });
    
  } catch (error) {
    console.error(error);
    console.log(error.response)
    setErrorMessage('No se pudieron cargar tus pedidos');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if(!usuarioId) return;
  fetchPedidos(1);
}, [usuarioId]);

  const handleChangePage = async(page) => {
    if(loading) return;
    fetchPedidos(page);
  };


  return (
    <Container className="mt-4">
      <ErrorMessage msg={errorMessage} />
      {pedidos.length > 0 && (
        <Row className="mb-3">
          <Col xs={12}>
            <ControlPaginado onPageChange={handleChangePage} pagination={pagination} />
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={12}>
          {loading ? (
            <LoadingSpinner message="Cargando pedidos..." />
          ) : pedidos.length === 0 ? (
            <p>No tenés pedidos aún.</p>
          ) : (
            pedidos.map(pedido => 
            <CardPedido 
                key={pedido._id} 
                pedido={pedido}
                onPedidoCancelado={async (pedidoId) => {
                  try{
                    

                    const confirmed = await confirmAction({
                      title: "Cancelar pedido?",
                      text: "¿Estás seguro que querés cancelar este pedido?",
                      confirmText: "Sí, cancelar",
                    });
                    if (!confirmed) return;
                    
                    //setLoading(true);
                    await pedidoService.actualizarEstadoPedido(pedidoId, "CANCELADO", { motivo: "Cancelado por el usuario desde Mis Pedidos" });
                    setPedidos(prev => prev.map(p => p._id === pedidoId ? {...p, estado: "CANCELADO"} : p));
                    showSuccess("Pedido cancelado correctamente.");
                  } catch (error) {
                    console.error(error);
                    setErrorMessage("No se pudo cancelar el pedido");
                  } finally {
                    setLoading(false);
                  }
                }}
                >
                    <Badge bg={estadoColor(pedido.estado)} className="ms-2">
                        {pedido.estado}
                    </Badge>
                </CardPedido>
            )
          )
          }
        </Col>
      </Row>

      {pedidos.length > 0 && (
        <Row className="mt-3">
          <Col xs={12}>
            <ControlPaginado onPageChange={handleChangePage} pagination={pagination} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MisPedidos;
