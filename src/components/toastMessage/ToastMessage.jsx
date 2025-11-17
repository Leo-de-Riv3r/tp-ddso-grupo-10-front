import { Toast, ToastBody, ToastContainer } from "react-bootstrap"
import React from "react"
const ToastMessage = ({showNotification, handleCloseNotification, header, message}) => {
  return (
    <ToastContainer
        className="p-3 "
        position="bottom-start"
        style={{ zIndex: 1 }, { position: "fixed" }}
      >
        <Toast show={showNotification} onClose={handleCloseNotification}>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">{header}</strong>
          </Toast.Header>
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
  )
}

export default ToastMessage