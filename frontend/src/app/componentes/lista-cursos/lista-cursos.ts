import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Curso } from '../../modelos/curso';
import { CursosService } from '../../servicios/cursos';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-lista-cursos',
  imports: [RouterLink],
  templateUrl: './lista-cursos.html',
})
export class ListaCursos implements OnInit {
  private cursosService = inject(CursosService);

  cursos: Curso[] = [];
  texto = '';
  cargando = true;
  error = '';

  ngOnInit() {
    this.buscar();
  }

  buscar(valor?: string) {
    if (valor !== undefined) {
      this.texto = valor;
    }
    this.cargando = true;
    this.error = '';
    this.cursosService.listar(this.texto).subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudieron cargar los cursos. ¿Está corriendo el backend?');
        this.cargando = false;
      },
    });
  }
}
