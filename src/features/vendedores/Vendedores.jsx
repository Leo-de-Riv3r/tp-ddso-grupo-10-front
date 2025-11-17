import React, { useEffect, useState } from 'react';
import vendedoresMocked from '../../mocks/vendedores.json'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardVendedor from '../../components/cards/CardVendedor';
import './Vendedores.css'
import LoadingSpinner from '../../components/spinner/LoadingSpinner';
import { Col, Container, Row } from 'react-bootstrap';
import FiltrosVendedor from '../filtrosVendedor/FiltrosVendedor';
import ControlPaginado from '../../components/controlPaginado/ControlPaginado';
import ErrorMessage from '../../components/errorMessage/ErrorMessage';
import { data, useSearchParams } from 'react-router';
import getVendedores from '../../services/vendedores'


const Vendedores = () => {
    //consultar vendedores en bd
    const [searchParams, setSearchParams] = useSearchParams({});
    const [vendedores, setVendedores] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [errorMessage, setErrorMessage] = useState("")

    const handleFiltrar = (filtros) => {
        //trae filtros actualizados
        if (loading) {
            showErrorMessage("Espere a que carguen los vendedores")
            return;
        }

        const newFiltros = {};
        Object.entries(filtros).forEach(([key, value]) => {
            newFiltros[key] = value;
        });
        setSearchParams({ ...newFiltros, page: 1 });
    };

    const handleChangePage = (page) => {
        if (loading) {
            showErrorMessage("Espere a que carguen los vendedores")
            return
        }
        const filtrosActuales = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...filtrosActuales, page });
    };

    const showErrorMessage = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => {
            setErrorMessage("");
        }, 6000);
    }

    const fetchData = async () => {
        setLoading(true)
        const filtros = Object.fromEntries(searchParams.entries());
        try {
            const dataApi = await getVendedores(filtros);
            if (dataApi) {
                setVendedores(dataApi.data)
                setPagination(dataApi.pagination)
            } else {
                showErrorMessage("Error obteniendo vendedores, intente luego")
            }
        } catch (err) {
            showErrorMessage("Servidor no disponible, intente luego")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [searchParams])

    return (
        <Container className='mt-4'>
            <ErrorMessage msg={errorMessage} />
            <Row>
                <Col lg={3} md={5} xs={12} className="mb-4">
                    <FiltrosVendedor handleSubmit={handleFiltrar} filtrosActuales={Object.fromEntries(searchParams.entries())} />
                </Col>
                <Col lg={9} md={7} xs={12}>
                    <h1>Lista de vendedores</h1>
                    {loading ? <LoadingSpinner message="Cargando vendedores" /> : !vendedores || vendedores.length === 0 ? <p>No se encontraron vendedores.</p> :
                        <>
                            <ControlPaginado onPageChange={handleChangePage} pagination={pagination}></ControlPaginado>
                            <div className='grid-content'>
                                {vendedores.map(vendedor => <CardVendedor key={vendedor._id} vendedor={vendedor} />)}
                            </div>
                        </>}
                </Col>
            </Row>
        </Container>
    )
}


export default Vendedores