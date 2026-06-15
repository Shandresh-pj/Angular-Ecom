import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EComProductsComponent } from './e-com-products.component';

describe('EComProductsComponent', () => {
  let component: EComProductsComponent;
  let fixture: ComponentFixture<EComProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EComProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EComProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
