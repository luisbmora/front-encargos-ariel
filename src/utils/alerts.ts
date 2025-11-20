// src/utils/alerts.ts
import Swal from 'sweetalert2';

export const AlertService = {
  // Alertas de éxito
  success: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6A1B9A',
      timer: 3000,
      timerProgressBar: true,
    });
  },

  // Alertas de error
  error: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6A1B9A',
    });
  },

  // Alertas de confirmación
  confirm: (title: string, message?: string, confirmText: string = 'Sí, continuar') => {
    return Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6A1B9A',
      cancelButtonColor: '#d33',
      reverseButtons: true,
    });
  },

  // Alertas de eliminación
  confirmDelete: (itemName: string, itemType: string = 'elemento') => {
    return Swal.fire({
      icon: 'warning',
      title: `¿Eliminar ${itemType}?`,
      html: `¿Estás seguro de que quieres eliminar <strong>${itemName}</strong>?<br><br>Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6A1B9A',
      reverseButtons: true,
    });
  },

  // Alertas de información
  info: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6A1B9A',
    });
  },

  // Alertas de advertencia
  warning: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6A1B9A',
    });
  },

  // Alerta de carga
  loading: (title: string = 'Procesando...', message?: string) => {
    return Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Cerrar alerta de carga
  close: () => {
    Swal.close();
  },

  // Alertas específicas para CRUD
  crud: {
    // Crear
    created: (itemType: string, itemName?: string) => {
      return AlertService.success(
        `${itemType} creado`,
        itemName ? `${itemName} ha sido creado exitosamente` : `El ${itemType.toLowerCase()} ha sido creado exitosamente`
      );
    },

    // Actualizar
    updated: (itemType: string, itemName?: string) => {
      return AlertService.success(
        `${itemType} actualizado`,
        itemName ? `${itemName} ha sido actualizado exitosamente` : `El ${itemType.toLowerCase()} ha sido actualizado exitosamente`
      );
    },

    // Eliminar
    deleted: (itemType: string, itemName?: string) => {
      return AlertService.success(
        `${itemType} eliminado`,
        itemName ? `${itemName} ha sido eliminado exitosamente` : `El ${itemType.toLowerCase()} ha sido eliminado exitosamente`
      );
    },

    // Error en operación
    operationError: (operation: string, itemType: string, error?: string) => {
      return AlertService.error(
        `Error al ${operation} ${itemType.toLowerCase()}`,
        error || `No se pudo ${operation} el ${itemType.toLowerCase()}. Inténtalo de nuevo.`
      );
    },
  },

  // Toast notifications (menos intrusivas)
  toast: {
    success: (message: string) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    },

    error: (message: string) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    },

    info: (message: string) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    },
  },
};