import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SettingsFrancePage } from './settings-france.page';

describe('SettingsFrancePage', () => {
  let component: SettingsFrancePage;
  let fixture: ComponentFixture<SettingsFrancePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsFrancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsFrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});