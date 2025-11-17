import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Modal, ListGroup, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi'; // Iconos
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import authServices from '../../services/auth';
import { useAuth } from '../../context/authContext';

const ValidationCheck = ({ isValid, message }) => (
  <ListGroup.Item
    variant={isValid ? 'success' : 'light'}
    className="d-flex align-items-center py-1 px-2 border-0"
    style={{ fontSize: '0.9rem' }}
  >
    {isValid ? <FiCheck color="green" /> : <FiX color="gray" />}
    <span className="ms-2">{message}</span>
  </ListGroup.Item>
);

const RegistroUsuario = () => {
  const navigate = useNavigate();
  const {loginContext} = useAuth()

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '', 
    password: '',
    confirmPassword: '',
  });

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para todas las validaciones
  const [validations, setValidations] = useState({
    nombre: false,
    telefonoNum: false,
    telefonoLen: false,
    email: false,
    passLen: false,
    passNum: false,
    passUpperLower: false,
    passSymbol: false,
    passMatch: false,
  });

  // Estado para saber si se puede enviar el formulario
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const vNombre = formData.nombre.length >= 5;
    const vEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const vTelefonoLen = formData.telefono.length >= 8;
    const vTelefonoNum = /^\d+$/.test(formData.telefono);

    const vPassLen = formData.password.length >= 8;
    const vPassNum = /[0-9]/.test(formData.password);
    const vPassUpperLower = /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password);
    const vPassSymbol = /[@_!#$%^&*()<>?/\|}{~:,-]/.test(formData.password);
    const vPassMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

    const newValidations = {
      nombre: vNombre,
      email: vEmail,
      telefonoLen: vTelefonoLen,
      telefonoNum: vTelefonoNum,
      passLen: vPassLen,
      passNum: vPassNum,
      passUpperLower: vPassUpperLower,
      passSymbol: vPassSymbol,
      passMatch: vPassMatch,
    };

    setValidations(newValidations);

    const allValid = Object.values(newValidations).every(Boolean) && !!formData.tipo;
    setIsFormValid(allValid);

  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setShowModal(true);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);

    const dataToSend = {
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      tipo: formData.tipo,
      password: formData.password,
    };

    try {
      const data = await authServices.register(dataToSend);
      loginContext(data.accessToken)
      navigate('/');
    } catch (error) {
      setErrorMessage("No se pudo registrar usuario, intente nuevamente")
    } finally {
      setShowModal(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container className="my-5">
        <ErrorMessage msg={errorMessage} />
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Form onSubmit={handleSubmit}>
              <Form.Text>
                        <h1>Crear cuenta nueva</h1>
                      </Form.Text>
              <Row>
                {/* --- CAMPO NOMBRE --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formNombre">
                    <Form.Label>Nombre Completo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      isInvalid={!validations.nombre && formData.nombre.length > 0}
                    />
                    <ListGroup className="mt-2">
                      <ValidationCheck isValid={validations.nombre} message="Mínimo 5 caracteres" />
                    </ListGroup>
                  </Form.Group>
                </Col>

                {/* --- CAMPO EMAIL --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="juan@correo.com"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      isInvalid={!validations.email && formData.email.length > 0}
                    />
                    <ListGroup className="mt-2">
                      <ValidationCheck isValid={validations.email} message="Formato de email válido" />
                    </ListGroup>
                  </Form.Group>
                </Col>

                {/* --- CAMPO TELÉFONO --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formTelefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Solo números (ej: 11223344)"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      isInvalid={(!validations.telefonoLen || !validations.telefonoNum) && formData.telefono.length > 0}
                    />
                    <ListGroup className="mt-2">
                      <ValidationCheck isValid={validations.telefonoLen} message="Mínimo 8 caracteres" />
                      <ValidationCheck isValid={validations.telefonoNum} message="Solo contiene números" />
                    </ListGroup>
                  </Form.Group>
                </Col>

                {/* --- CAMPO TIPO DE USUARIO --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formTipo">
                    <Form.Label>Tipo de Usuario</Form.Label>
                    <Form.Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="COMPRADOR">Comprador</option>
                      <option value="VENDEDOR">Vendedor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* --- CAMPO CONTRASEÑA --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <InputGroup.Text
                        role="button"
                        onClick={() => setShowPassword(s => !s)}
                        style={{ cursor: 'pointer' }}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </InputGroup.Text>
                    </InputGroup>
                    <ListGroup className="mt-2">
                      <ValidationCheck isValid={validations.passLen} message="Mínimo 6 caracteres" />
                      <ValidationCheck isValid={validations.passUpperLower} message="Una mayúscula y una minúscula" />
                      <ValidationCheck isValid={validations.passNum} message="Al menos un número" />
                      <ValidationCheck isValid={validations.passSymbol} message="Al menos un símbolo (@, _, -, etc)" />
                    </ListGroup>
                  </Form.Group>
                </Col>

                {/* --- CAMPO CONFIRMAR CONTRASEÑA --- */}
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formConfirmPassword">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        isInvalid={!validations.passMatch && formData.confirmPassword.length > 0}
                      />
                      <InputGroup.Text
                        role="button"
                        onClick={() => setShowConfirmPassword(s => !s)}
                        style={{ cursor: 'pointer' }}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </InputGroup.Text>
                    </InputGroup>
                    <ListGroup className="mt-2">
                      <ValidationCheck isValid={validations.passMatch} message="Las contraseñas coinciden" />
                    </ListGroup>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid mt-4">
                <Button variant="primary" type="submit" size="lg" disabled={!isFormValid || isSubmitting}>
                  Registrarse
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas registrarte con los siguientes datos?</p>
          <ListGroup>
            <ListGroup.Item>
              <strong>Nombre:</strong> {formData.nombre}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Email:</strong> {formData.email}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Teléfono:</strong> {formData.telefono}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Tipo de Usuario:</strong> {formData.tipo}
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAccept} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                Registrando...
              </>
            ) : (
              "Aceptar y Registrar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RegistroUsuario;