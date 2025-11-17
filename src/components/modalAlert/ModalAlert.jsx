import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ModalAlert = ({handleModalSubmit, handleClose, message, show}) => {
  return (
    <>
      <Modal show={show} onHide={handleClose} centered={true} autoFocus={true}  backdrop="static" keyboard={false}animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>Atención</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Si
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

  export default ModalAlert;