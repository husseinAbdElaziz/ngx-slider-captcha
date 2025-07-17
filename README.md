# NgxSliderCaptcha

[![Test](https://github.com/husseinabdelaziz/ngx-slider-captcha/actions/workflows/test.yml/badge.svg)](https://github.com/husseinabdelaziz/ngx-slider-captcha/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/ngx-slider-captcha.svg)](https://badge.fury.io/js/ngx-slider-captcha)

A modern Angular slider captcha component that provides a puzzle-based verification system. Users need to slide a puzzle piece to complete the captcha challenge.

## Features

- 🎯 **Puzzle-based verification**: Users slide a puzzle piece to complete the captcha
- ⏱️ **Configurable timeout**: Set custom timeout for captcha completion
- 🖼️ **Custom images**: Use your own images or random images from Picsum
- 📱 **Touch support**: Works on both desktop and mobile devices
- 🎨 **Modern UI**: Clean and responsive design
- ⚡ **Angular 17+**: Built with the latest Angular features and standalone components

## Installation

```bash
npm install ngx-slider-captcha
```

## Usage

### Basic Usage

Import the `NgxSliderCaptcha` component in your Angular module or standalone component:

```typescript
import { NgxSliderCaptcha } from "ngx-slider-captcha";

@Component({
  selector: "app-example",
  imports: [NgxSliderCaptcha],
  template: ` <ngx-slider-captcha (success)="onCaptchaSuccess($event)" (failed)="onCaptchaFailed()" /> `,
})
export class ExampleComponent {
  onCaptchaSuccess(event: CaptchaSuccess) {
    console.log("Captcha completed successfully!", event.value);
  }

  onCaptchaFailed() {
    console.log("Captcha failed or timed out");
  }
}
```

### With Custom Configuration

```typescript
import { NgxSliderCaptcha, CaptchaConfig } from "ngx-slider-captcha";

@Component({
  selector: "app-example",
  imports: [NgxSliderCaptcha],
  template: ` <ngx-slider-captcha [config]="captchaConfig" (success)="onCaptchaSuccess($event)" (failed)="onCaptchaFailed()" /> `,
})
export class ExampleComponent {
  captchaConfig: CaptchaConfig = {
    image: "https://example.com/your-custom-image.jpg",
    failTimeout: 30000, // 30 seconds
  };

  onCaptchaSuccess(event: CaptchaSuccess) {
    console.log("Captcha completed!", event.value);
  }

  onCaptchaFailed() {
    console.log("Captcha failed");
  }
}
```

## Configuration

### CaptchaConfig Interface

```typescript
interface CaptchaConfig {
  image: string; // URL of the image to use for the captcha
  failTimeout: number; // Timeout in milliseconds (default: 60000ms)
}
```

### Properties

| Property | Type            | Default                             | Description                          |
| -------- | --------------- | ----------------------------------- | ------------------------------------ |
| `config` | `CaptchaConfig` | `{ image: '', failTimeout: 60000 }` | Configuration object for the captcha |

### Events

| Event     | Type             | Description                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `success` | `CaptchaSuccess` | Emitted when the captcha is completed successfully |
| `failed`  | `void`           | Emitted when the captcha times out or fails        |

### CaptchaSuccess Interface

```typescript
interface CaptchaSuccess {
  value: number; // The position value when the captcha was completed
}
```

## Examples

### Example 1: Basic Implementation

```typescript
import { Component } from "@angular/core";
import { NgxSliderCaptcha, CaptchaSuccess } from "ngx-slider-captcha";

@Component({
  selector: "app-login",
  imports: [NgxSliderCaptcha],
  template: `
    <div class="login-form">
      <h2>Login</h2>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />

      <div class="captcha-container">
        <ngx-slider-captcha (success)="onCaptchaSuccess($event)" (failed)="onCaptchaFailed()" />
      </div>

      <button [disabled]="!captchaCompleted">Login</button>
    </div>
  `,
})
export class LoginComponent {
  captchaCompleted = false;

  onCaptchaSuccess(event: CaptchaSuccess) {
    this.captchaCompleted = true;
    console.log("Captcha verified!");
  }

  onCaptchaFailed() {
    this.captchaCompleted = false;
    console.log("Please complete the captcha");
  }
}
```

### Example 2: Custom Image and Timeout

```typescript
import { Component } from "@angular/core";
import { NgxSliderCaptcha, CaptchaConfig } from "ngx-slider-captcha";

@Component({
  selector: "app-registration",
  imports: [NgxSliderCaptcha],
  template: ` <ngx-slider-captcha [config]="captchaConfig" (success)="onCaptchaSuccess($event)" (failed)="onCaptchaFailed()" /> `,
})
export class RegistrationComponent {
  captchaConfig: CaptchaConfig = {
    image: "https://your-domain.com/captcha-images/random.jpg",
    failTimeout: 45000, // 45 seconds
  };

  onCaptchaSuccess(event: CaptchaSuccess) {
    // Handle successful captcha completion
    this.submitRegistration();
  }

  onCaptchaFailed() {
    // Handle captcha failure
    alert("Please complete the captcha within the time limit");
  }

  private submitRegistration() {
    // Submit registration form
  }
}
```

## Styling

The component comes with built-in styles, but you can customize the appearance using CSS:

```scss
// Custom styles for the captcha container
.captcha-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background: #f9f9f9;
}

// Custom slider styles
.slider {
  background: #007bff;
  border-radius: 4px;

  &:hover {
    background: #0056b3;
  }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Requirements

- Angular 17.0.0 or higher
- TypeScript 5.0 or higher

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

## License

This project is licensed under the MIT License.

## Author

**Hussein AbdElaziz**

- Email: me@hussein.ee
- GitHub: [@husseinabdelaziz](https://github.com/husseinabdelaziz)
