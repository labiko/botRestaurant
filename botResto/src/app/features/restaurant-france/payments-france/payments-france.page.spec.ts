import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsFrancePage } from './payments-france.page';

describe('PaymentsFrancePage', () => {
  let component: PaymentsFrancePage;
  let fixture: ComponentFixture<PaymentsFrancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
