import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestSubmissionComponent } from './contest-submission.component';

describe('ContestSubmissionComponent', () => {
  let component: ContestSubmissionComponent;
  let fixture: ComponentFixture<ContestSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
