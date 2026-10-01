import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'No fue posible conectar con YGOPRODeck. Comprueba tu conexión e inténtalo de nuevo.';
  }

  return 'YGOPRODeck no pudo completar la búsqueda. Inténtalo de nuevo.';
}
