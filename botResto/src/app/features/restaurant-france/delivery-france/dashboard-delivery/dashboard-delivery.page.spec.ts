import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardDeliveryPage } from './dashboard-delivery.page';

describe('DashboardDeliveryPage', () => {
  let component: DashboardDeliveryPage;
  let fixture: ComponentFixture<DashboardDeliveryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDeliveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
