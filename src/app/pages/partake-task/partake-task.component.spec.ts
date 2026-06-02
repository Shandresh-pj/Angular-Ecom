import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartakeTaskComponent } from './partake-task.component';

describe('PartakeTaskComponent', () => {
  let component: PartakeTaskComponent;
  let fixture: ComponentFixture<PartakeTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartakeTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartakeTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
