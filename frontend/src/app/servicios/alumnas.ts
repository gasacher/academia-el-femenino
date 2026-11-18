import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../entorno';
import { Alumna } from '../modelos/alumna';

export interface DatosAlumna {
  nombre: string;
  edad: number;
  posicion: string;
  curso_id: number;
}

@Injectable({ providedIn: 'root' })
export class AlumnasService {
  private http = inject(HttpClient);

  listar(curso: number | null, busqueda = '') {
    let params = new HttpParams();
    if (curso) {
      params = params.set('curso', curso);
    }
    const texto = busqueda.trim();
    if (texto) {
      params = params.set('q', texto);
    }
    return this.http.get<Alumna[]>(`${API_URL}/alumnas`, { params });
  }

  obtener(id: number) {
    return this.http.get<Alumna>(`${API_URL}/alumnas/${id}`);
  }

  crear(datos: DatosAlumna) {
    return this.http.post<Alumna>(`${API_URL}/alumnas`, datos);
  }

  actualizar(id: number, datos: DatosAlumna) {
    return this.http.put<Alumna>(`${API_URL}/alumnas/${id}`, datos);
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API_URL}/alumnas/${id}`);
  }
}
