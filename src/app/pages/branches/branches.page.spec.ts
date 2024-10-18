import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchesPage } from './branches.page';

describe('BranchesPage', () => {
  let component: BranchesPage;
  let fixture: ComponentFixture<BranchesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
