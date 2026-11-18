import { Routes } from '@angular/router';
import { Chatbot } from './componentes/chatbot/chatbot';
import { DetalleAlumna } from './componentes/detalle-alumna/detalle-alumna';
import { DetalleCurso } from './componentes/detalle-curso/detalle-curso';
import { FormAlumna } from './componentes/form-alumna/form-alumna';
import { FormCurso } from './componentes/form-curso/form-curso';
import { ListaAlumnas } from './componentes/lista-alumnas/lista-alumnas';
import { ListaCursos } from './componentes/lista-cursos/lista-cursos';

export const routes: Routes = [
  { path: '', redirectTo: 'cursos', pathMatch: 'full' },
  { path: 'cursos', component: ListaCursos },
  { path: 'cursos/nuevo', component: FormCurso },
  { path: 'cursos/:id', component: DetalleCurso },
  { path: 'cursos/:id/editar', component: FormCurso },
  { path: 'alumnas', component: ListaAlumnas },
  { path: 'alumnas/nueva', component: FormAlumna },
  { path: 'alumnas/:id', component: DetalleAlumna },
  { path: 'alumnas/:id/editar', component: FormAlumna },
  { path: 'chat', component: Chatbot },
];
