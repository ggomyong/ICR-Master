import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcrComponent } from './icr.component';

describe('IcrComponent', () => {
  let component: IcrComponent;
  let fixture: ComponentFixture<IcrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
