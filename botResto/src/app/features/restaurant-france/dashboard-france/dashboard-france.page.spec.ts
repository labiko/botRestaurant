import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardFrancePage } from './dashboard-france.page';

describe('DashboardFrancePage', () => {
  let component: DashboardFrancePage;
  let fixture: ComponentFixture<DashboardFrancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});