import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartakeCategoryComponent } from './partake-category.component';

describe('PartakeCategoryComponent', () => {
  let component: PartakeCategoryComponent;
  let fixture: ComponentFixture<PartakeCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartakeCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartakeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
