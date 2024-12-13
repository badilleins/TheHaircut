import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddUpdateAppointmentClientComponent } from './add-update-appointment-client.component';

describe('AddUpdateAppointmentClientComponent', () => {
  let component: AddUpdateAppointmentClientComponent;
  let fixture: ComponentFixture<AddUpdateAppointmentClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateAppointmentClientComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUpdateAppointmentClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
