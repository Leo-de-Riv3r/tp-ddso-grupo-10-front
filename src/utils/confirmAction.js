import Swal from "sweetalert2";

export async function confirmAction({
  title = "¿Estás seguro?",
  text = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "warning",
}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
}

export function showSuccess(message, title = "Listo") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 1500,
    showConfirmButton: false,
  });
}

export function showError(message, title = "Error") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
}
