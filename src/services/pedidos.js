import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const obtenerPedidos = async (filtros = {}) => {
  const token = localStorage.getItem("accessToken");
  
  const { usuarioId, page = 1, limit = 10, ...otrosFiltros } = filtros;

  const response = await axios.get(`${baseUrl}/pedidos`,
    {
    params: {usuarioId,page,limit, ...otrosFiltros} ,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

const crearPedido = async (pedido) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(`${baseUrl}/pedidos`, pedido, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

const actualizarEstadoPedido = async (pedidoId, estado, body = {}) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.patch(`${baseUrl}/pedidos/${pedidoId}?estado=${estado}`, body, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};


const obtenerPedidoPorId = async (id) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${baseUrl}/pedidos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export default {
  obtenerPedidos,
  crearPedido,
  actualizarEstadoPedido,
  obtenerPedidoPorId,
};