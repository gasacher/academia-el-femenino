import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Curso } from '../../modelos/curso';
import { AlumnasService } from '../../servicios/alumnas';
import { CursosService } from '../../servicios/cursos';
import { mensajeDeApi } from '../../util';

@Component({
  selector: 'app-form-alumna',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './form-alumna.html',
})
export class FormAlumna implements OnInit {
  private fb = inject(FormBuilder);
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private alumnasService = inject(AlumnasService);
  private cursosService = inject(CursosService);

  id: number | null = null;
  cursos: Curso[] = [];
  cargando = true;
  guardando = false;
  error = '';
  intento = false;
  mensajes: Record<string, string> = {};

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    edad: [null as number | null, [Validators.required, Validators.min(6), Validators.max(99)]],
    posicion: ['', Validators.required],
    curso_id: ['', Validators.required],
  });

  ngOnInit() {
    const id = this.ruta.snapshot.paramMap.get('id');
    this.id = id ? Number(id) : null;

    this.cursosService.listar().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        if (this.id) {
          this.cargarAlumna();
          return;
        }
        const curso = this.ruta.snapshot.queryParamMap.get('curso');
        if (curso) {
          this.form.patchValue({ curso_id: curso });
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los cursos. Sin eso no se puede inscribir.';
        this.cargando = false;
      },
    });
  }

  private cargarAlumna() {
    this.alumnasService.obtener(this.id!).subscribe({
      next: (alumna) => {
        this.form.patchValue({
          nombre: alumna.nombre,
          edad: alumna.edad,
          posicion: alumna.posicion,
          curso_id: String(alumna.curso_id),
        });
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo cargar la alumna.');
        this.cargando = false;
      },
    });
  }

  actualizarMensajes() {
    const siguientes: Record<string, string> = {};
    const nombre = this.form.controls.nombre;
    const edad = this.form.controls.edad;
    const posicion = this.form.controls.posicion;
    const curso = this.form.controls.curso_id;

    if (nombre.hasError('required')) {
      siguientes['nombre'] = 'El nombre es obligatorio.';
    } else if (nombre.hasError('minlength')) {
      siguientes['nombre'] = 'El nombre tiene que tener al menos 3 letras.';
    }
    if (edad.hasError('required')) {
      siguientes['edad'] = 'La edad es obligatoria.';
    } else if (edad.hasError('min') || edad.hasError('max')) {
      siguientes['edad'] = 'La edad tiene que estar entre 6 y 99.';
    }
    if (posicion.hasError('required')) {
      siguientes['posicion'] = 'La posición es obligatoria.';
    }
    if (curso.hasError('required')) {
      siguientes['curso_id'] = 'Tenés que elegir un curso.';
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
      edad: Number(valor.edad),
      posicion: String(valor.posicion).trim(),
      curso_id: Number(valor.curso_id),
    };

    this.guardando = true;
    const pedido = this.id
      ? this.alumnasService.actualizar(this.id, datos)
      : this.alumnasService.crear(datos);

    pedido.subscribe({
      next: (alumna) => this.router.navigate(['/alumnas', alumna.id]),
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'No se pudo guardar la alumna.');
        this.guardando = false;
      },
    });
  }
}
