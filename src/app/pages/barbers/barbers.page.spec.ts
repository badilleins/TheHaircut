import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbersPage } from './barbers.page';

describe('BarbersPage', () => {
  let component: BarbersPage;
  let fixture: ComponentFixture<BarbersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarbersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
