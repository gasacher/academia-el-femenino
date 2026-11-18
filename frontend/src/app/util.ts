import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeApi(err: HttpErrorResponse, porDefecto: string) {
  if (typeof err.error?.error === 'string') {
    return err.error.error;
  }
  return porDefecto;
}
