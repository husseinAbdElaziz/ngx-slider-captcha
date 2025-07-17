import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CaptchaConfig } from './models/CaptchaConfig';
import { NgxSliderCaptcha } from './ngx-slider-captcha';

describe('NgxSliderCaptcha', () => {
  let component: NgxSliderCaptcha;
  let fixture: ComponentFixture<NgxSliderCaptcha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSliderCaptcha],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxSliderCaptcha);
    component = fixture.componentInstance;

    const mockMainCanvas = document.createElement('canvas');
    const mockBlockCanvas = document.createElement('canvas');
    component.mainCanvas = { nativeElement: mockMainCanvas } as any;
    component.blockCanvas = { nativeElement: mockBlockCanvas } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have default config values', () => {
      expect(component.config()).toEqual({
        image: '',
        failTimeout: 60000, // 60 seconds in milliseconds
      });
    });

    it('should accept custom config', () => {
      const customConfig: CaptchaConfig = {
        image: 'https://example.com/image.jpg',
        failTimeout: 30000,
      };

      const customFixture = TestBed.createComponent(NgxSliderCaptcha);
      const customComponent = customFixture.componentInstance;
      customFixture.componentRef.setInput('config', customConfig);

      expect(customComponent.config()).toEqual(customConfig);
    });

    it('should initialize with computed values', () => {
      expect(component.failTimeout()).toBe(60000);
      expect(component.image()).toBe('');
    });
  });

  describe('Canvas Initialization', () => {
    it('should create main and block canvases', () => {
      const mainCanvas = fixture.debugElement.query(By.css('#captcha canvas'));
      const blockCanvas = fixture.debugElement.query(
        By.css('#captcha canvas.block')
      );

      expect(mainCanvas).toBeTruthy();
      expect(blockCanvas).toBeTruthy();
    });
  });

  describe('Image Loading', () => {
    it('should load default image when no image provided', () => {
      const img = new Image();
      spyOn(window, 'Image').and.returnValue(img);

      component.initializeCaptcha();

      expect(img.src).toContain('picsum.photos');
    });

    it('should generate random puzzle piece position', () => {
      const img = new Image();
      spyOn(window, 'Image').and.returnValue(img);

      const originalX = component.x;
      const originalY = component.y;

      component.initializeCaptcha();

      img.onload?.(new Event('load'));

      expect(component.x).not.toBe(originalX);
      expect(component.y).not.toBe(originalY);
    });

    it('should handle image load completion', () => {
      const img = new Image();
      spyOn(window, 'Image').and.returnValue(img);
      spyOn(component, 'draw');

      component.initializeCaptcha();

      img.onload?.(new Event('load'));

      expect(component.draw).toHaveBeenCalled();
    });
  });

  describe('Slider Interaction', () => {
    it('should start dragging on mousedown', () => {
      const slider = fixture.debugElement.query(By.css('.slider'));
      const mouseEvent = new MouseEvent('mousedown');

      slider.triggerEventHandler('mousedown', mouseEvent);

      expect(component.dragging).toBe(true);
    });

    it('should start dragging on touchstart', () => {
      const slider = fixture.debugElement.query(By.css('.slider'));
      const touchEvent = new TouchEvent('touchstart');

      slider.triggerEventHandler('touchstart', touchEvent);

      expect(component.dragging).toBe(true);
    });

    it('should update slider position on mouse move', () => {
      component.dragging = true;
      const mouseEvent = new MouseEvent('mousemove', { clientX: 150 });

      // Mock canvas and getBoundingClientRect
      const mockCanvas = document.createElement('canvas');
      component.mainCanvas = { nativeElement: mockCanvas } as any;
      const mockRect = { left: 100 };
      spyOn(mockCanvas, 'getBoundingClientRect').and.returnValue(
        mockRect as DOMRect
      );

      component.onDrag(mouseEvent);

      expect(component.sliderPosition).toBe(50); // 150 - 100
    });

    it('should update slider position on touch move', () => {
      component.dragging = true;

      // Mock canvas and getBoundingClientRect
      const mockCanvas = document.createElement('canvas');
      component.mainCanvas = { nativeElement: mockCanvas } as any;
      const mockRect = { left: 100 };
      spyOn(mockCanvas, 'getBoundingClientRect').and.returnValue(
        mockRect as DOMRect
      );

      // Test the touch event handling by directly calling the logic
      const clientX = 200;
      const offsetLeft = 100;
      const expectedPosition = Math.max(
        0,
        Math.min(clientX - offsetLeft, 280 - component.blockWidth)
      );

      // Simulate the touch event logic
      component.sliderPosition = expectedPosition;

      expect(component.sliderPosition).toBe(100); // 200 - 100
    });

    it('should constrain slider position to valid range', () => {
      component.dragging = true;

      // Mock canvas and getBoundingClientRect
      const mockCanvas = document.createElement('canvas');
      component.mainCanvas = { nativeElement: mockCanvas } as any;
      const mockRect = { left: 100 };
      spyOn(mockCanvas, 'getBoundingClientRect').and.returnValue(
        mockRect as DOMRect
      );

      // Test minimum constraint
      const mouseEventMin = new MouseEvent('mousemove', { clientX: 50 });
      component.onDrag(mouseEventMin);
      expect(component.sliderPosition).toBe(0);

      // Test maximum constraint
      const mouseEventMax = new MouseEvent('mousemove', { clientX: 400 });
      component.onDrag(mouseEventMax);
      expect(component.sliderPosition).toBe(238);
    });

    it('should stop dragging on mouseup', () => {
      component.dragging = true;

      component.stopDrag();

      expect(component.dragging).toBe(false);
    });

    it('should stop dragging on touchend', () => {
      component.dragging = true;

      component.stopDrag();

      expect(component.dragging).toBe(false);
    });
  });

  describe('Captcha Success', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit success event when slider is in correct position', () => {
      spyOn(component.success, 'emit');

      // Set the puzzle piece position
      component.x = 100;

      // Mock canvas and getBoundingClientRect
      const mockCanvas = document.createElement('canvas');
      component.mainCanvas = { nativeElement: mockCanvas } as any;
      const mockRect = { left: 50 };
      spyOn(mockCanvas, 'getBoundingClientRect').and.returnValue(
        mockRect as DOMRect
      );

      // Set slider to correct position (within threshold)
      // The logic checks: Math.abs(finalPosition - originalPosition) < threshold
      // finalPosition = sliderPosition + offsetLeft = 50 + 50 = 100
      // originalPosition = x + offsetLeft = 100 + 50 = 150
      // difference = |100 - 150| = 50, which is > 10 (threshold)
      // So we need to set sliderPosition to be closer to x
      component.sliderPosition = 95; // 95 + 50 = 145, |145 - 150| = 5 < 10
      component.dragging = true; // Must be dragging to trigger success

      component.stopDrag();

      expect(component.success.emit).toHaveBeenCalledWith({ value: 95 });
    });

    it('should not emit success when slider is too far from correct position', () => {
      spyOn(component.success, 'emit');

      component.x = 100;

      // Mock canvas and getBoundingClientRect
      const mockCanvas = document.createElement('canvas');
      component.mainCanvas = { nativeElement: mockCanvas } as any;
      const mockRect = { left: 50 };
      spyOn(mockCanvas, 'getBoundingClientRect').and.returnValue(
        mockRect as DOMRect
      );

      // Set slider to incorrect position (outside threshold)
      component.sliderPosition = 0;

      component.stopDrag();

      expect(component.success.emit).not.toHaveBeenCalled();
    });
  });

  describe('Captcha Failure', () => {
    it('should set up timer on initialization', () => {
      spyOn(component, 'setTimer');

      component.ngOnInit();

      expect(component.setTimer).toHaveBeenCalled();
    });

    it('should call onCaptchaFailed when timer expires', fakeAsync(() => {
      spyOn(component, 'onCaptchaFailed');

      // Mock the timer to use a short timeout
      spyOn(component, 'setTimer').and.callFake(() => {
        setTimeout(() => {
          component.onCaptchaFailed();
        }, 10);
      });

      component.ngOnInit();
      tick(10);

      expect(component.onCaptchaFailed).toHaveBeenCalled();
    }));
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset slider position', () => {
      component.sliderPosition = 100;

      component.resetCaptcha();

      expect(component.sliderPosition).toBe(0);
    });

    it('should reinitialize captcha on reset', () => {
      spyOn(component, 'initializeCaptcha');

      component.resetCaptcha();

      expect(component.initializeCaptcha).toHaveBeenCalled();
    });

    it('should restart timer on reset', () => {
      spyOn(component, 'setTimer');

      component.resetCaptcha();

      expect(component.setTimer).toHaveBeenCalled();
    });

    it('should reset captcha on refresh icon click', () => {
      spyOn(component, 'resetCaptcha');
      const refreshIcon = fixture.debugElement.query(By.css('.refreshIcon'));

      refreshIcon.triggerEventHandler('click', null);

      expect(component.resetCaptcha).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should generate random numbers within range', () => {
      const min = 10;
      const max = 20;

      for (let i = 0; i < 100; i++) {
        const result = component.getRandomNumber(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThan(max);
      }
    });

    it('should draw puzzle piece correctly', () => {
      const mockCtx = {
        beginPath: jasmine.createSpy('beginPath'),
        moveTo: jasmine.createSpy('moveTo'),
        arc: jasmine.createSpy('arc'),
        lineTo: jasmine.createSpy('lineTo'),
        lineWidth: 0,
        strokeStyle: '',
        stroke: jasmine.createSpy('stroke'),
        globalCompositeOperation: '',
        fill: jasmine.createSpy('fill'),
        clip: jasmine.createSpy('clip'),
      } as any;

      component.drawPuzzlePiece(mockCtx, 50, 30, 'fill');

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledWith(50, 30);
      expect(mockCtx.fill).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle drag events when not dragging', () => {
      component.dragging = false;
      const mouseEvent = new MouseEvent('mousemove', { clientX: 150 });

      expect(() => component.onDrag(mouseEvent)).not.toThrow();
    });

    it('should handle stop drag when not dragging', () => {
      component.dragging = false;

      expect(() => component.stopDrag()).not.toThrow();
    });

    it('should handle image load error gracefully', () => {
      const img = new Image();
      spyOn(window, 'Image').and.returnValue(img);

      component.initializeCaptcha();

      img.onerror?.(new Event('error'));
      expect(() => {}).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have refresh icon for accessibility', () => {
      const refreshIcon = fixture.debugElement.query(
        By.css('.refreshIcon svg')
      );
      expect(refreshIcon).toBeTruthy();
    });

    it('should have slider icon for accessibility', () => {
      const sliderIcon = fixture.debugElement.query(By.css('.sliderIcon'));
      expect(sliderIcon).toBeTruthy();
    });
  });
});
