import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../entorno';
import { Curso } from '../modelos/curso';

export interface DatosCurso {
  nombre: string;
  nivel: string;
  dias: string;
  cupo: number;
}

@Injectable({ providedIn: 'root' })
export class CursosService {
  private http = inject(HttpClient);

  listar(busqueda = '') {
    let params = new HttpParams();
    const texto = busqueda.trim();
    if (texto) {
      params = params.set('q', texto);
    }
    return this.http.get<Curso[]>(`${API_URL}/cursos`, { params });
  }

  obtener(id: number) {
    return this.http.get<Curso>(`${API_URL}/cursos/${id}`);
  }

  crear(datos: DatosCurso) {
    return this.http.post<Curso>(`${API_URL}/cursos`, datos);
  }

  actualizar(id: number, datos: DatosCurso) {
    return this.http.put<Curso>(`${API_URL}/cursos/${id}`, datos);
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API_URL}/cursos/${id}`);
  }
}
