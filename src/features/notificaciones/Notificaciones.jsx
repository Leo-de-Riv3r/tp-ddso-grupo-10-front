import React, { useEffect, useState } from 'react'
import CardNotificaciones from '../../components/cards/CardNotificaciones'
import './Notificaciones.css'
import notificacionesService from '../../services/notificaciones';
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import WarningMessage from '../../components/warningMessage/WarningMessage';
import ControlPaginado from '../../components/controlPaginado/ControlPaginado';
import { useSearchParams } from 'react-router';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../../context/authContext';
import notificacionesMocked from './../../mocks/notificaciones.json'
import { FaSearch } from 'react-icons/fa';

const Notificaciones = () => {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({"page": 1, "total_pages": 5})
  const [searchParams, setSearchParams] = useSearchParams({});
  const [notificacionesLeidas, setNotificacionesLeidas] = useState(false)
  const [perPage, setPerPage] = useState(10)

  const cargarNotificaciones = async ({pagina = 1, limit= 10, leidas= false}) => {
    try {
      setLoading(true)
      const usuario = user.id

      const notificacionesPage = await notificacionesService.getNotificaciones(usuario, leidas, pagina, limit)
      setNotificaciones(notificacionesPage.data)
      setSearchParams({usuario: usuario, page: notificacionesPage.pagina, leidas: notificacionesLeidas})
      setPagination({
        page: notificacionesPage.pagina,
        total_pages: notificacionesPage.totalPaginas
      })
    } catch(err) {
      setError("Hubo un error al intentar cargar las notificaciones. Intente nuevamente en unos minutos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarNotificaciones({})
  }, [])
  
  const marcarLeida = async (id) => {
    await notificacionesService.marcarNotificacionLeida(id)

    cargarNotificaciones({})
    }

  const handleChangePage = (pag) => {
    cargarNotificaciones({pagina: pag, leidas: notificacionesLeidas})
  }

  const handleLeidasChange = (notiLeidas) => {
    setNotificacionesLeidas(notiLeidas)
  }

  useEffect(() => {
  cargarNotificaciones({ leidas: notificacionesLeidas });
  }, [notificacionesLeidas]);

  return (
    <div className="notificaciones container">
      <h1>Tus notificaciones</h1>
      <Form>
  {/* 1. 'align-items-center' alinea verticalmente el label y el input.
    2. Eliminé 'grow-0' ya que no es una clase estándar de Bootstrap
       y no estaba logrando el efecto deseado.
  */}
  <Form.Group className='d-flex flex-row align-items-center'>
    
    {/* 1. 'mb-0' quita el margen inferior del label.
      2. 'me-2' añade un espacio entre el label y el input.
    */}
    <Form.Label className="mb-0 me-2">Mostrar por pagina</Form.Label>
    
    <Form.Control
    className='w-auto'
      type='number'
      value={perPage}
      min={10}
      max={30}
      onChange={(e) => setPerPage(e.target.value)}
    />
    <Button className='ms-2'>
    <FaSearch aria-hidden="true" />
    </Button>
  </Form.Group>
</Form>
    <div className='nav-buttons d-flex flex-row justify-content-center gap-3'>
      <Button variant="primary" onClick={() => handleLeidasChange(false)} disabled={!notificacionesLeidas}>No Leidas</Button>
      <Button variant="primary" onClick={() => handleLeidasChange(true)}  disabled={notificacionesLeidas}>Leidas</Button>
    </div>

      {error ? <div className="cartelError"><ErrorMessage msg={error}/></div> : null}
      { loading ? 
          <LoadingSpinner message="Cargando notificaciones" /> :
          notificaciones.length === 0 && !error ?
          <div className="cartelError sinNotificaciones"><WarningMessage title={"Atencion"} msg={"No tienes notificaciones"} /> </div> :
        <div>
          <ControlPaginado onPageChange={handleChangePage} pagination={pagination}></ControlPaginado>
          <ul>
            {notificaciones.map(notificacion => (<li key={notificacion._id}> <CardNotificaciones notificacion={notificacion} marcarLeida={marcarLeida} /> </li>))}
          </ul>
        </div>

      } 
      </div>
  )
}

export default Notificaciones
