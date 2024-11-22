import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HaircutsCategoriesPage } from './haircuts-categories.page';

describe('HaircutsCategoriesPage', () => {
  let component: HaircutsCategoriesPage;
  let fixture: ComponentFixture<HaircutsCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HaircutsCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
