import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAppsComponent } from './customer-apps.component';

describe('CustomerAppsComponent', () => {
  let component: CustomerAppsComponent;
  let fixture: ComponentFixture<CustomerAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAppsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
