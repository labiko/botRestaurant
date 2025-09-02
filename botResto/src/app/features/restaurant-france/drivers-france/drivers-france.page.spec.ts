import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriversFrancePage } from './drivers-france.page';

describe('DriversFrancePage', () => {
  let component: DriversFrancePage;
  let fixture: ComponentFixture<DriversFrancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DriversFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
