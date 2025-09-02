import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFrancePage } from './login-france.page';

describe('LoginFrancePage', () => {
  let component: LoginFrancePage;
  let fixture: ComponentFixture<LoginFrancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});