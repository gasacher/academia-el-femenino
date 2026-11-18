import { Alumna } from './alumna';

export interface Curso {
  id: number;
  nombre: string;
  nivel: string;
  dias: string;
  cupo: number;
  alumnas?: Alumna[];
}
