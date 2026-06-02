import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LableComponent } from './lable.component';

describe('LableComponent', () => {
  let component: LableComponent;
  let fixture: ComponentFixture<LableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
