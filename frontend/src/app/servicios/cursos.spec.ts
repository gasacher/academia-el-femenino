import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../entorno';
import { CursosService } from './cursos';

describe('CursosService', () => {
  let servicio: CursosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(CursosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('pide el listado de cursos', () => {
    servicio.listar().subscribe();
    const pedido = http.expectOne((req) => req.url === `${API_URL}/cursos`);
    expect(pedido.request.method).toBe('GET');
    expect(pedido.request.params.has('q')).toBe(false);
    pedido.flush([]);
  });

  it('manda la búsqueda en el parámetro q', () => {
    servicio.listar('arqueras').subscribe();
    const pedido = http.expectOne((req) => req.url === `${API_URL}/cursos`);
    expect(pedido.request.params.get('q')).toBe('arqueras');
    pedido.flush([]);
  });
});
