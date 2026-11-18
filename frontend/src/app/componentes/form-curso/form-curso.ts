import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CursosService } from '../../servicios/cursos';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-form-curso',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './form-curso.html',
})
export class FormCurso implements OnInit {
  private fb = inject(FormBuilder);
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);

  id: number | null = null;
  cargando = false;
  guardando = false;
  error = '';
  intento = false;
  mensajes: Record<string, string> = {};

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    nivel: ['', Validators.required],
    dias: ['', Validators.required],
    cupo: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) return;
    this.id = Number(id);
    this.cargando = true;
    this.cursosService.obtener(this.id).subscribe({
      next: (curso) => {
        this.form.patchValue({
          nombre: curso.nombre,
          nivel: curso.nivel,
          dias: curso.dias,
          cupo: curso.cupo,
        });
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo cargar el curso.');
        this.cargando = false;
      },
    });
  }

  actualizarMensajes() {
    const siguientes: Record<string, string> = {};
    const nombre = this.form.controls.nombre;
    const nivel = this.form.controls.nivel;
    const dias = this.form.controls.dias;
    const cupo = this.form.controls.cupo;

    if (nombre.hasError('required')) {
      siguientes['nombre'] = 'El nombre es obligatorio.';
    } else if (nombre.hasError('minlength')) {
      siguientes['nombre'] = 'El nombre tiene que tener al menos 3 letras.';
    }
    if (nivel.hasError('required')) {
      siguientes['nivel'] = 'El nivel es obligatorio.';
    }
    if (dias.hasError('required')) {
      siguientes['dias'] = 'Los días y el horario son obligatorios.';
    }
    if (cupo.hasError('required') || cupo.hasError('min')) {
      siguientes['cupo'] = 'El cupo tiene que ser un número mayor a 0.';
    }
    this.mensajes = this.intento ? siguientes : {};
  }

  guardar() {
    this.intento = true;
    this.error = '';
    this.actualizarMensajes();
    if (this.form.invalid) return;

    const valor = this.form.getRawValue();
    const datos = {
      nombre: String(valor.nombre).trim(),
      nivel: String(valor.nivel).trim(),
      dias: String(valor.dias).trim(),
      cupo: Number(valor.cupo),
    };

    this.guardando = true;
    const pedido = this.id
      ? this.cursosService.actualizar(this.id, datos)
      : this.cursosService.crear(datos);

    pedido.subscribe({
      next: (curso) => this.router.navigate(['/cursos', curso.id]),
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo guardar el curso.');
        this.guardando = false;
      },
    });
  }
}
