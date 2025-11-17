import React, { useEffect, useState } from "react";
import { Button, Card, CloseButton, Container, Form, Image, InputGroup, ListGroup } from "react-bootstrap";
import { useParams, useNavigate } from "react-router"; // Importa useParams
import LoadingSpinner from "../../components/spinner/LoadingSpinner";
import { MdDeleteForever } from "react-icons/md";
import productosService from "../../services/productos";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import { useAuth } from "../../context/authContext";
import authServices from "../../services/auth";
import { FaCheckCircle } from "react-icons/fa";
import ModalAlert from "../../components/modalAlert/ModalAlert";

// --- Constantes (igual que en CrearProducto) ---
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 6;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_SIZE_MB = 10;

const EditarProducto = () => {
  const navigate = useNavigate();
  const { productoId } = useParams();
  const { loginContext, logoutContext, user } = useAuth();
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando datos...")
  const [segundosRedireccion, setSegundosRedireccion] = useState(5);

  // --- Estados separados para imágenes ---
  // 'nuevasImagenes' son archivos File
  const [nuevasImagenes, setNuevasImagenes] = useState([]);

  const [nuevasPreviews, setNuevasPreviews] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!productoId) {
        setErrorMessage("No se especificó un ID de producto.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Pide categorías y producto en paralelo
        const [categoriasData, productoData] = await Promise.all([
          productosService.getCategorias(),
          productosService.getProducto(productoId)
        ]);

        if (categoriasData) {
          setCategories(categoriasData);
        }
        if (productoData) {
          productoData.categorias = productoData.categorias.map(c => c.nombre);
          setProducto(productoData); // <-- Carga el producto en el estado
        }
      } catch (err) {
        setErrorMessage("Error al cargar los datos: ");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [productoId]); // Depende del ID de la URL

  // --- Manejador de inputs (igual) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseNotification = () => setShowNotification(false);

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false)
    const totalImagenes = (producto.fotos?.length || 0) + nuevasImagenes.length;

    if (totalImagenes === 0) {
      setErrorMessage("Debes subir al menos una imagen.");
      return;
    }
    if (!producto.categorias || producto.categorias.length === 0) {
      setErrorMessage("Debes elegir al menos una categoria."); return;
    }
    setLoadingMessage("Guardando cambios...")
    const productToSubmit = {...producto, activo: producto.activo.toString()}
    setLoading(true)
    try {
      await productosService.updateProducto(productoId, productToSubmit, nuevasImagenes);
      setShowNotification(true);
      setSubmitted(true)
      setLoading(false)
    
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          try {
            const refreshData = await authServices.refresh();
            loginContext(refreshData);
            const productoResp = await productosService.updateProducto(productoId, productToSubmit, nuevasImagenes);
            setSubmitted(true)
            setLoading(false)
            setShowNotification(true);
            setLoadingMessage("Cambios guardados, redirigiendo a productos")

          } catch (refreshErr) {
            logoutContext();
            navigate('/login');
          }
        }
      } else {
        setErrorMessage("Error actualizando producto, intente luego");
        setLoading(false)
      }
    }
  };

  // --- Lógica de Imágenes (Adaptada) ---
  const handleFilesAdd = (e) => {
    setErrorMessage("");
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validación de cantidad total (existentes + nuevas + a añadir)
    const totalActual = (producto.fotos?.length || 0) + nuevasImagenes.length;
    if (totalActual + files.length > MAX_IMAGES) {
      setErrorMessage(`No puedes subir más de ${MAX_IMAGES} imágenes.`);
      files.splice(MAX_IMAGES - totalActual);
    }

    // (Validaciones de tamaño y tipo - idénticas)
    const validFiles = [];
    const largeFiles = [];
    const invalidTypeFiles = [];
    files.forEach(file => {
      if (file.size > MAX_SIZE_BYTES) largeFiles.push(file.name);
      else if (!ALLOWED_IMAGE_TYPES.includes(file.type)) invalidTypeFiles.push(file.name);
      else validFiles.push(file);
    });
    // (Mostrar errores - idéntico)
    let errorMessages = [];
    if (largeFiles.length > 0) errorMessages.push(`Archivos grandes (> ${MAX_SIZE_MB}MB): ${largeFiles.join(', ')}`);
    if (invalidTypeFiles.length > 0) errorMessages.push(`Archivos no permitidos: ${invalidTypeFiles.join(', ')}`);
    if (errorMessages.length > 0) setErrorMessage(errorMessages.join(' '));

    // Agregar archivos válidos a los estados de "nuevas" imágenes
    if (validFiles.length > 0) {
      const newFilePreviews = validFiles.map(file => URL.createObjectURL(file));
      setNuevasImagenes(prev => [...prev, ...validFiles]);
      setNuevasPreviews(prev => [...prev, ...newFilePreviews]);
    }
    e.target.value = null;
  };

  // Para eliminar una *nueva* imagen (que es un File)
  const handleDeleteNewPreview = (indexToRemove) => {
    URL.revokeObjectURL(nuevasPreviews[indexToRemove]);
    setNuevasImagenes(prev => prev.filter((_, index) => index !== indexToRemove));
    setNuevasPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Para eliminar una imagen *existente* (que es una URL)
  const handleDeleteExistingImage = (urlToRemove) => {
    setProducto(prev => ({
      ...prev,
      // Filtra el array de fotos en el estado del producto
      fotos: prev.fotos.filter(url => url !== urlToRemove)
    }));
  };

  // --- Lógica de Categorías (idéntica) ---
  const handleAddCategory = () => {
    if (selectedCategory) {
      const newCategory = categories.find(c => c === selectedCategory);
      if (newCategory) {
        if (producto.categorias && producto.categorias.find(c => c === newCategory)) {
          setErrorMessage("La categoría ya está agregada."); return;
        }
        setProducto(prev => ({
          ...prev,
          categorias: [...(prev.categorias || []), newCategory]
        }));
        setSelectedCategory("");
      }
    }
  };
  const changeSelectedCategory = (e) => setSelectedCategory(e.target.value);
  const handleDeleteCategory = (categoria) => {
    setProducto(prev => ({
      ...prev,
      categorias: prev.categorias.filter(c => c !== categoria)
    }));
  };

  // --- Limpieza de Previews (solo para las *nuevas*) ---
  useEffect(() => {
    return () => {
      nuevasPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [nuevasPreviews]);

  // --- Renderizado ---
  return (
    <>
      <ModalAlert handleClose={() => setShowModal(false)} handleModalSubmit={handleFormSubmit} message="¿Esta seguro de que quiere editar el producto?" show={showModal} />
      <Container className="my-4 p-2">
        <ErrorMessage msg={errorMessage} />
        <h1>Editar producto</h1>
        {loading || !producto ? (
          <LoadingSpinner message={loadingMessage} />
        ) :
          submitted ?
            (
              <Card>
                <Card.Body className="d-flex flex-column align-items-center justify-items-center">
                  <FaCheckCircle color="green" size={100}></FaCheckCircle>
                  <h1>Producto editado</h1>
                  <p className="text-muted">Redirigiendo a pagina de productos en {segundosRedireccion}...</p>
                </Card.Body>
              </Card>
            ) :

            <Form onSubmit={(e) => { e.preventDefault(); setShowModal(true) }}>
              {/* Campos de texto (se auto-llenan con 'value={producto.titulo}', etc.) */}
              <Form.Group className="mb-3" controlId="tituloProducto">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" minLength={3} placeholder="Ingrese titulo" name="titulo" value={producto.titulo} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="descripcionProducto">
                <Form.Label>Descripcion</Form.Label>
                <Form.Control as="textarea" minLength={10} placeholder="Descripcion" name="descripcion" value={producto.descripcion} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="estadoProducto">
                <Form.Label>Estado</Form.Label>
                <Form.Select name="activo" value={producto.activo} onChange={handleInputChange} required>
                  <option value="true">Activo</option>
                  <option value="false">En pausa</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="precioProducto">
                <Form.Label>Precio</Form.Label>
                <Form.Control type="number" placeholder="Precio de producto" name="precio" value={producto.precio} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group controlId="tipoMoneda" className="mb-3">
                <Form.Label>Tipo de moneda</Form.Label>
                <Form.Select name="moneda" value={producto.moneda} onChange={handleInputChange} required>
                  <option value="DOLAR_USA">Dolar estadounidense</option>
                  <option value="PESO_ARG">Peso arg.</option>
                  <option value="REAL">Real</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="stockProducto">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" placeholder="stock de producto" name="stock" value={producto.stock} onChange={handleInputChange} min={0} required />
              </Form.Group>

              {/* Categorías (idéntico, se auto-llena) */}
              <Form.Group className="mb-3" controlId="categoriasProducto">
                <Form.Label>Categorías</Form.Label>
                <ListGroup className="mb-2">
                  {producto.categorias && producto.categorias.length > 0 ? (
                    producto.categorias.map(c => (
                      <ListGroup.Item key={c} className="d-flex justify-content-between">
                        {c}
                        <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(c)} aria-label={`Quitar categoría ${c}`}>
                          <MdDeleteForever aria-hidden="true" />
                        </Button>
                      </ListGroup.Item>
                    ))
                  ) : (<ListGroup.Item>Sin categorias.</ListGroup.Item>)}
                </ListGroup>
                <InputGroup>
                  <Form.Select value={selectedCategory} onChange={changeSelectedCategory} aria-label="Agregar categoria a producto">
                    <option value="">Seleccionar</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                  <Button variant="success" onClick={handleAddCategory} type="button">
                    Agregar
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Imágenes (Máx. {MAX_IMAGES}, Límite {MAX_SIZE_MB}MB c/u)</Form.Label>
                <div className="p-2 border rounded" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '100px' }}>

                  {/* 1. Renderiza las imágenes EXISTENTES (de producto.fotos) */}
                  {producto.fotos && producto.fotos.map((url, index) => (
                    <div key={`existing-${index}`} style={{ position: 'relative' }}>
                      <Image src={url} alt="Imagen existente" thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                      <CloseButton
                        style={{ position: 'absolute', top: '2px', right: '2px' }}
                        onClick={() => handleDeleteExistingImage(url)}
                        aria-label="Eliminar imagen existente"
                      />
                    </div>
                  ))}

                  {/* 2. Renderiza las imágenes NUEVAS (de nuevasPreviews) */}
                  {nuevasPreviews.map((previewUrl, index) => (
                    <div key={`new-${index}`} style={{ position: 'relative' }}>
                      <Image src={previewUrl} alt="Nueva imagen" thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                      <CloseButton
                        style={{ position: 'absolute', top: '2px', right: '2px' }}
                        onClick={() => handleDeleteNewPreview(index)}
                        aria-label="Eliminar nueva imagen"
                      />
                    </div>
                  ))}

                  {(producto.fotos?.length || 0) + nuevasImagenes.length < MAX_IMAGES && (
                    <Form.Label
                      htmlFor="file-upload-button"
                      className="border rounded d-flex align-items-center justify-content-center"
                      style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                    >
                      +
                    </Form.Label>
                  )}
                </div>
                <Form.Control
                  id="file-upload-button"
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFilesAdd}
                  style={{ display: 'none' }}
                />
              </Form.Group>

              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </Form>}
      </Container>
    </>
  );
};

export default EditarProducto;