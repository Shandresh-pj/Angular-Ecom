import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartakeSubmissionComponent } from './partake-submission.component';

describe('PartakeSubmissionComponent', () => {
  let component: PartakeSubmissionComponent;
  let fixture: ComponentFixture<PartakeSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartakeSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartakeSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
