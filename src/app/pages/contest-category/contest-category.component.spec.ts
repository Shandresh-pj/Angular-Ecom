import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestCategoryComponent } from './contest-category.component';

describe('ContestCategoryComponent', () => {
  let component: ContestCategoryComponent;
  let fixture: ComponentFixture<ContestCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
