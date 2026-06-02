import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAttributeValueComponent } from './product-attribute-value.component';

describe('ProductAttributeValueComponent', () => {
  let component: ProductAttributeValueComponent;
  let fixture: ComponentFixture<ProductAttributeValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAttributeValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAttributeValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
