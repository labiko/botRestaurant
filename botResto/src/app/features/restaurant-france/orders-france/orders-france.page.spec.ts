import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersFrancePage } from './orders-france.page';

describe('OrdersFrancePage', () => {
  let component: OrdersFrancePage;
  let fixture: ComponentFixture<OrdersFrancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});