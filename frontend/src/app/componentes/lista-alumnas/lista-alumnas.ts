import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Alumna } from '../../modelos/alumna';
import { Curso } from '../../modelos/curso';
import { AlumnasService } from '../../servicios/alumnas';
import { CursosService } from '../../servicios/cursos';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-lista-alumnas',
  imports: [RouterLink],
  templateUrl: './lista-alumnas.html',
})
export class ListaAlumnas implements OnInit {
  private alumnasService = inject(AlumnasService);
  private cursosService = inject(CursosService);

  alumnas: Alumna[] = [];
  cursos: Curso[] = [];
  texto = '';
  cursoId: number | null = null;
  cargando = true;
  error = '';

  ngOnInit() {
    this.cursosService.listar().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
      },
      error: () => {
        this.error = 'No se pudieron cargar los cursos para filtrar.';
      },
    });
    this.buscar();
  }

  buscar(valor?: string) {
    if (valor !== undefined) {
      this.texto = valor;
    }
    this.cargando = true;
    this.error = '';
    this.alumnasService.listar(this.cursoId, this.texto).subscribe({
      next: (alumnas) => {
        this.alumnas = alumnas;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudieron cargar las alumnas. ¿Está corriendo el backend?');
        this.cargando = false;
      },
    });
  }

  filtrarCurso(valor: string) {
    this.cursoId = valor ? Number(valor) : null;
    this.buscar();
  }
}
