import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatToolbarComponent } from './mat-toolbar.component';

describe('MatToolbarComponent', () => {
  let component: MatToolbarComponent;
  let fixture: ComponentFixture<MatToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatToolbarComponent]
    });
    fixture = TestBed.createComponent(MatToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
