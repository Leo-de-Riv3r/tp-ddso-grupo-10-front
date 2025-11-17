import axios from 'axios'

const baseUrl = process.env.REACT_APP_API_BASE_URL

const getNotificaciones = async (usuario, leidas, page, limit) => {
  const response = await axios.get(baseUrl + '/notificaciones', {
    params: {
        usuario: usuario,
        leidas: leidas,
        page: page,
        limit: limit
    },
  })
  return response.data
}

const marcarNotificacionLeida = async (id) => {
  const usuario = "68d6cab39b8125b409b72c05"
  const response = await axios.patch(baseUrl + `/notificaciones/${id}/leida`,
    null, {
    params: {
      usuario: usuario
    }
  })
  return response.data
}

export default {getNotificaciones, marcarNotificacionLeida}