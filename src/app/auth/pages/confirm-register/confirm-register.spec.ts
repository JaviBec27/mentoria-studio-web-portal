import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRegister } from './confirm-register';

describe('ConfirmRegister', () => {
  let component: ConfirmRegister;
  let fixture: ComponentFixture<ConfirmRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
