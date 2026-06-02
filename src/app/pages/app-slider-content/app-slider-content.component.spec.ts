import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSliderContentComponent } from './app-slider-content.component';

describe('AppSliderContentComponent', () => {
  let component: AppSliderContentComponent;
  let fixture: ComponentFixture<AppSliderContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSliderContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSliderContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
