import axios from 'axios'

const baseUrl = process.env.REACT_APP_API_BASE_URL

const getVendedores = async (filtros = {}) => {
  const response = await axios.get(baseUrl + '/usuarios/vendedores', {
    params: filtros,
  })
  return response.data
}

const getMejoresVendedores = async() => {
  const response = await axios.get(baseUrl + '/usuarios/vendedores', {
    params: {perPage: 10, ordenarPor: "VENTAS", orden: "DESC"}
  })
  return response.data
}

export default {getVendedores, getMejoresVendedores }