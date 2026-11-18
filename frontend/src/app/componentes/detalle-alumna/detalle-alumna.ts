import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Alumna } from '../../modelos/alumna';
import { AlumnasService } from '../../servicios/alumnas';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-detalle-alumna',
  imports: [RouterLink],
  templateUrl: './detalle-alumna.html',
})
export class DetalleAlumna implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private alumnasService = inject(AlumnasService);

  alumna: Alumna | null = null;
  cargando = true;
  error = '';

  ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.alumnasService.obtener(id).subscribe({
      next: (alumna) => {
        this.alumna = alumna;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo abrir la alumna.');
        this.cargando = false;
      },
    });
  }

  borrar() {
    if (!this.alumna) return;
    const seguro = confirm(`¿Borrar a ${this.alumna.nombre}?`);
    if (!seguro) return;

    this.alumnasService.eliminar(this.alumna.id).subscribe({
      next: () => this.router.navigate(['/alumnas']),
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo borrar la alumna.');
      },
    });
  }
}
