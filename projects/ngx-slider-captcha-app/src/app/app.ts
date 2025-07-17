import { Component } from '@angular/core';
import { CaptchaSuccess, NgxSliderCaptcha } from 'ngx-slider-captcha';

@Component({
  selector: 'app-root',
  imports: [NgxSliderCaptcha],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ngx-slider-captcha-app';

  captchaSussess(value: CaptchaSuccess) {
    console.log('captchaSussess' + value.value);
  }

  captchaFailed() {
    console.log('captchaFailed');
  }
}
