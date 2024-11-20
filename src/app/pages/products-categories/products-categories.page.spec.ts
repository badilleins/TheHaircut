import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsCategoriesPage } from './products-categories.page';

describe('ProductsCategoriesPage', () => {
  let component: ProductsCategoriesPage;
  let fixture: ComponentFixture<ProductsCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
