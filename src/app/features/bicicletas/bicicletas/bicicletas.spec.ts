import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bicicletas } from './bicicletas';

describe('Bicicletas', () => {
  let component: Bicicletas;
  let fixture: ComponentFixture<Bicicletas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bicicletas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bicicletas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
