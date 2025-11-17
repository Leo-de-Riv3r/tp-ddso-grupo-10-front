import axios from 'axios'

const baseUrl = process.env.REACT_APP_API_BASE_URL
//modificar controller para agregar parametro activo
const getProductos = async (filtros = {}) => {
  const response = await axios.get(baseUrl + '/productos', {
    params: {...filtros},
  })
  return response.data
}

const getProductosMasVendidos = async() => {
  const response = await axios.get(baseUrl + '/productos', {
    params: {perPage: 10, activo: true, ordenarPor: "VENTAS", orden: "DESC"},
  })
  return response.data
}

const getProducto = async(id) => {
  const response = await axios.get(baseUrl + `/productos/${id}`)
  return response.data
}

const getCategorias = async () => {
  const response = await axios.get(baseUrl + '/productos/categorias')
  return response.data
}

const postProducto = async (producto, imagenes) => {
  const formData = new FormData();
  const token = localStorage.getItem("accessToken")
  formData.append("producto", JSON.stringify(producto));

  imagenes.forEach(imagenFile => {
    formData.append("imagenes", imagenFile);
  });
    const response = await axios.post(baseUrl + '/productos', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data
}

const updateProducto = async (productoId, producto, nuevasImagenes) => {
  const formData = new FormData();
  const token = localStorage.getItem("accessToken")
  formData.append("producto", JSON.stringify(producto));

  nuevasImagenes.forEach(imagenFile => {
    formData.append("imagenes", imagenFile);
  });
  const response = await axios.put(baseUrl + `/productos/${productoId}`, formData, {
    headers: {
        'Authorization': `Bearer ${token}`,
      }
  });
  return response.data
}

const desactivarProducto = async (productoId) => {
  const token = localStorage.getItem("accessToken")
  const response = await axios.patch(baseUrl + `/productos/${productoId}/desactivar`, null, {
    headers: {
        'Authorization': `Bearer ${token}`,
      }
  });
}
export default { getProductos, getProductosMasVendidos, getProducto, getCategorias, postProducto, updateProducto, desactivarProducto}
