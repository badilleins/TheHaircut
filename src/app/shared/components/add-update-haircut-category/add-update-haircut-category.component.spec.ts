import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddUpdateHaircutCategoryComponent } from './add-update-haircut-category.component';

describe('AddUpdateHaircutCategoryComponent', () => {
  let component: AddUpdateHaircutCategoryComponent;
  let fixture: ComponentFixture<AddUpdateHaircutCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateHaircutCategoryComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUpdateHaircutCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
