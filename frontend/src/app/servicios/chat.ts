import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../entorno';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  enviar(mensaje: string) {
    return this.http.post<{ respuesta: string }>(`${API_URL}/chat`, { mensaje });
  }
}
