import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debería obtener patentes', () => {
    service.getPatentes().subscribe(patentes => {
      expect(patentes).toBeTruthy();
      expect(patentes.length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('http://localhost:3000/vehiculos');
    expect(req.request.method).toBe('GET');
  });
});
