import React, { useEffect, useState } from "react";
import { Button, Card, CloseButton, Container, Form, Image, InputGroup, ListGroup, Toast, ToastContainer } from "react-bootstrap";
import LoadingSpinner from "../../components/spinner/LoadingSpinner";
import { MdDeleteForever } from "react-icons/md";
import productosService from "../../services/productos";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import { useAuth } from "../../context/authContext";
import authServices from "../../services/auth";
import { useNavigate } from "react-router";
import { FaCheckCircle } from "react-icons/fa";
import ToastMessage from "../../components/toastMessage/ToastMessage";
import Select from 'react-select';
const CrearProducto = () => {
  const navigate = useNavigate()
  const { loginContext, logoutContext, user } = useAuth();
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  const MAX_IMAGES = 6
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  const MAX_SIZE_MB = 10;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [producto, setProducto] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showNotification, setShowNotification] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [segundosRedireccion, setSegundosRedireccion] = useState(5)
  const [loadingMessage, setLoadingMessage] = useState("Cargando datos...")


  const showErrorMessage = (msg) => {
    setErrorMessage(msg)
    setTimeout(() => {
      setErrorMessage("")
    }, 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProducto({
      ...producto,
      [name]: value
    });
  };

  const handleCloseNotification = () => setShowNotification(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (imagenes.length === 0) {
      showErrorMessage("Debes subir al menos una imagen.");
      return;
    }

    if (!producto.categorias || producto.categorias.length === 0) {
      showErrorMessage("Debes elegir al menos una categoria.");
      return;
    }
    setLoadingMessage("Creando producto...")
    setLoading(true)
    try {
      await productosService.postProducto({ vendedorId: user.id, ...producto }, imagenes)
      setShowNotification(true)
      setProducto({})
      setImagenes([])
      setPreviews([])
      setSelectedCategory(null)
      setSubmitted(true)
      setLoading(false)
    } catch (err) {
      console.log(err)
      if (err.response) {
        if (err.response.status === 401) {
          //retry with refresh method
          try {
            const refreshData = await authServices.refresh()
            loginContext(refreshData)
            await productosService.postProducto({ vendedorId: user.id, ...producto }, imagenes)
            setShowNotification(true)
            setProducto({})
            setImagenes([])
            setPreviews([])
            setSelectedCategory(null)
            setSubmitted(true)
            setLoading(false)
          }
          catch (err) {
            logoutContext()
            navigate('/login')
          }
        }
      } else {
        showErrorMessage("Error creando producto, intente luego")
        setLoading(false)
      }
    }
  }

  const handleFilesAdd = (e) => {
    setErrorMessage(""); // Limpiar error anterior
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // 1. Validar cantidad total (usando la constante MAX_IMAGES)
    if (imagenes.length + files.length > MAX_IMAGES) {
      showErrorMessage(`No puedes subir más de ${MAX_IMAGES} imágenes en total.`);
      // Cortamos el array de 'files' para que solo se agreguen las que caben
      files.splice(MAX_IMAGES - imagenes.length);
    }

    const validFiles = [];
    const largeFiles = [];
    const invalidTypeFiles = []; // <-- NUEVO: Para archivos de tipo incorrecto

    // 2. Validar tamaño Y tipo de cada archivo
    files.forEach(file => {
      if (file.size > MAX_SIZE_BYTES) {
        largeFiles.push(file.name);
      } else if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { // <-- NUEVO: Validación de tipo
        invalidTypeFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    // 3. Mostrar errores (lógica mejorada)
    let errorMessages = [];
    if (largeFiles.length > 0) {
      errorMessages.push(`Los siguientes archivos son demasiado grandes (> ${MAX_SIZE_MB}MB): ${largeFiles.join(', ')}`);
    }
    if (invalidTypeFiles.length > 0) {
      errorMessages.push(`Archivos no permitidos (solo .jpeg, .png, .webp): ${invalidTypeFiles.join(', ')}`);
    }

    if (errorMessages.length > 0) {
      showErrorMessage(errorMessages.join(' ')); // Une todos los mensajes de error
    }

    // 4. Agregar los archivos válidos al estado
    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagenes(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }

    // Resetear el input para poder seleccionar el mismo archivo si se borra
    e.target.value = null;
  };

  const handleAddCategory = () => {
    // 'selectedCategory' ahora es un objeto { value: 'id', label: 'nombre' }
    if (selectedCategory) {

      // Previene duplicados
      if (producto.categorias && producto.categorias.find(c => c === selectedCategory.label)) {
        showErrorMessage("La categoría ya está agregada.");
        return;
      }

      // Añade el 'label' (el nombre) al array del producto
      if (producto.categorias) {
        setProducto({
          ...producto,
          categorias: [...producto.categorias, selectedCategory.label]
        });
      } else {
        setProducto({
          ...producto,
          categorias: [selectedCategory.label]
        });
      }

      setSelectedCategory(null); // Limpia el select
    }
  };

  // 'changeSelectedCategory' ahora recibe el objeto de react-select
  const changeSelectedCategory = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleDeleteCategory = (categoria) => {
    setProducto({
      ...producto,
      categorias: producto.categorias.filter(c => c !== categoria)
    });
  };

  // --- 4. Transformar las categorías para react-select ---
  // react-select necesita un formato específico: [{ value: '...', label: '...' }]
  const categoryOptions = categories.map(c => ({
    value: c, // El valor puede ser el string simple
    label: c  // El texto a mostrar y buscar
  }));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorias = await productosService.getCategorias()
        if (categorias) {
          setCategories(categorias)
        }
      } catch (err) {
        setErrorMessage("Error obteniendo categorias, intente luego")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
      if (!submitted) {
        return;
      }
  
      const intervalId = setInterval(() => {
        setSegundosRedireccion(prevSegundos => {
          if (prevSegundos <= 1) {
            clearInterval(intervalId);
            navigate("/mis-productos");
            return 0;
          }
  
          return prevSegundos - 1;
        });
      }, 1000);
  
      return () => clearInterval(intervalId);
  
    }, [submitted, navigate]);

  const handleFileChange = (e) => {
    // 1. Limpiamos previews anteriores para evitar memory leaks
    previews.forEach(url => URL.revokeObjectURL(url));

    const files = Array.from(e.target.files);

    // 2. Guardamos los nuevos File objects
    setImagenes(files);

    // 3. Creamos y guardamos los nuevos URLs de previsualización
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // --- Manejador para eliminar una imagen de la preview ---
  const handleDeletePreview = (indexToRemove) => {
    // Revocamos el Object URL específico
    URL.revokeObjectURL(previews[indexToRemove]);

    // Filtramos ambos estados
    setImagenes(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <>
      <Container className="my-4 p-2">
        <ErrorMessage msg={errorMessage} />
        <h1>Crear producto</h1>
        {loading ? (
          <LoadingSpinner message={loadingMessage} />
        ) : categories ?
        submitted ? 
          <Card>
                <Card.Body className="d-flex flex-column align-items-center justify-items-center">
                  <FaCheckCircle color="green" size={100}></FaCheckCircle>
                  <h1>Producto creado</h1>
                  <p className="text-muted">Redirigiendo a pagina de productos en {segundosRedireccion}...</p>
                </Card.Body>
              </Card>
        : 
          <Form role="" onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="tituloProducto">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" minLength={3} placeholder="Ingrese titulo" name="titulo" value={producto.titulo} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="descripcionProducto">
              <Form.Label>Descripcion</Form.Label>
              <Form.Control as="textarea" minLength={10} placeholder="Descripcion" name="descripcion" value={producto.descripcion} onChange={handleInputChange} required />
            </Form.Group>


            <Form.Group className="mb-3" controlId="precioProducto">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" placeholder="Precio de producto" name="precio" value={producto.precio} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="tipoMoneda" className="mb-3">
              <Form.Label>Tipo de moneda</Form.Label>
              <Form.Select
                name="moneda"
                value={producto.moneda}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="DOLAR_USA">Dolar estadounidense</option>
                <option value="PESO_ARG">Peso arg.</option>
                <option value="REAL">Real</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="stockProducto">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" placeholder="stock de producto" name="stock" value={producto.stock} min={1} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="categoriasProducto">
              <Form.Label>Categorías</Form.Label>

              <ListGroup className="mb-2">
                {producto.categorias && producto.categorias.length > 0 ? (
                  producto.categorias.map(c => (
                    <ListGroup.Item
                      key={c}
                      className="d-flex justify-content-between"
                    >
                      {c}
                      <Button
                        variant="danger"
                        size="sm" // <-- Añadido para consistencia
                        onClick={() => handleDeleteCategory(c)}
                        aria-label={`Quitar categoría ${c} del producto`}
                      >
                        <MdDeleteForever aria-hidden="true" />
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>Sin categorias.</ListGroup.Item>
                )}
              </ListGroup>

              <div className="d-flex">
                {/* Usa 'flex-grow-1' para que el Select ocupe todo el espacio disponible.
    'react-select' usa la prop 'className' para su contenedor.
  */}
                <Select
                  options={categoryOptions}
                  onChange={changeSelectedCategory}
                  value={selectedCategory}
                  placeholder="Buscar y seleccionar categoría..."
                  isSearchable={true}
                  className="flex-grow-1" // <-- ¡La clave está aquí!
                />

                <Button
                  variant="success"
                  onClick={handleAddCategory}
                  type="button"
                  className="ms-2"
                >
                  Agregar
                </Button>
              </div>

            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imágenes (Máx. 6, Límite 10MB c/u)</Form.Label>
              <div
                className="p-2 border rounded"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '100px' }}
              >
                {/* Previews existentes */}
                {previews.map((previewUrl, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <Image
                      src={previewUrl}
                      thumbnail
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <CloseButton
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '50%', width: '1rem', height: '1rem',
                      }}
                      onClick={() => handleDeletePreview(index)}
                    />
                  </div>
                ))}

                {/* Botón para agregar más imágenes (si no se ha llegado al límite) */}
                {imagenes.length < 6 && (
                  <Form.Label
                    htmlFor="file-upload-button"
                    className="border rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: '100px', height: '100px', cursor: 'pointer',
                      fontSize: '2.5rem', color: 'gray',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    +
                  </Form.Label>
                )}
              </div>
              {/* Input de archivo real, oculto */}
              <Form.Control
                id="file-upload-button"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFilesAdd}
                style={{ display: 'none' }}
              />
            </Form.Group>

            <Button variant="success" type="submit">
              Finalizar
            </Button>
          </Form>
          :
          <h1>Error obteniendo categorias, intente luego</h1>
        }
      </Container>
    </>
  )
}

export default CrearProducto
