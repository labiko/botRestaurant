import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableOrdersPage } from './available-orders.page';

describe('AvailableOrdersPage', () => {
  let component: AvailableOrdersPage;
  let fixture: ComponentFixture<AvailableOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
