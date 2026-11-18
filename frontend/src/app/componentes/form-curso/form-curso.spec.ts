import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CursosService } from '../../servicios/cursos';
import { FormCurso } from './form-curso';

describe('FormCurso', () => {
  let fixture: ComponentFixture<FormCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCurso],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        { provide: CursosService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCurso);
  });

  it('avisa que el nombre es obligatorio si se guarda vacío', async () => {
    fixture.componentInstance.guardar();
    fixture.detectChanges();
    await fixture.whenStable();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('El nombre es obligatorio.');
  });
});
