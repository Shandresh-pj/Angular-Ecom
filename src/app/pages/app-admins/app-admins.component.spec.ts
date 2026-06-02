import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAdminsComponent } from './app-admins.component';

describe('AppAdminsComponent', () => {
  let component: AppAdminsComponent;
  let fixture: ComponentFixture<AppAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAdminsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
