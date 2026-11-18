import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Curso } from '../../modelos/curso';
import { CursosService } from '../../servicios/cursos';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-detalle-curso',
  imports: [RouterLink],
  templateUrl: './detalle-curso.html',
})
export class DetalleCurso implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);

  curso: Curso | null = null;
  cargando = true;
  error = '';

  ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.cursosService.obtener(id).subscribe({
      next: (curso) => {
        this.curso = curso;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo abrir el curso.');
        this.cargando = false;
      },
    });
  }

  borrar() {
    if (!this.curso) return;
    const seguro = confirm(`¿Borrar el curso "${this.curso.nombre}"?`);
    if (!seguro) return;

    this.cursosService.eliminar(this.curso.id).subscribe({
      next: () => this.router.navigate(['/cursos']),
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo borrar el curso.');
      },
    });
  }
}
