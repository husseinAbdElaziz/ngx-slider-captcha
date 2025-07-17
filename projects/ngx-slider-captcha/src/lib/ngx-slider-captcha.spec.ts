import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSliderCaptcha } from './ngx-slider-captcha';

describe('NgxSliderCaptcha', () => {
  let component: NgxSliderCaptcha;
  let fixture: ComponentFixture<NgxSliderCaptcha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSliderCaptcha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxSliderCaptcha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
