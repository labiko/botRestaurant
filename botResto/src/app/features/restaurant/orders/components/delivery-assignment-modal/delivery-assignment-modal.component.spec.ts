import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeliveryAssignmentModalComponent } from './delivery-assignment-modal.component';

describe('DeliveryAssignmentModalComponent', () => {
  let component: DeliveryAssignmentModalComponent;
  let fixture: ComponentFixture<DeliveryAssignmentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DeliveryAssignmentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
