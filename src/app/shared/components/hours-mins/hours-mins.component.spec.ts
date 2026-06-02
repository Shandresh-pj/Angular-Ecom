import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursMinsComponent } from './hours-mins.component';

describe('HoursMinsComponent', () => {
  let component: HoursMinsComponent;
  let fixture: ComponentFixture<HoursMinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursMinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursMinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
