import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { CaptchaConfig } from './models/CaptchaConfig';
import { CaptchaSuccess } from './models/CaptchaSuccess';

const MINUTE_IN_MS = 60 * 1000;

@Component({
  selector: 'ngx-slider-captcha',
  styleUrls: ['./ngx-slider-captcha.scss'],
  template: `
    <div id="captcha" class="captcha-container">
      <canvas #mainCanvas></canvas>
      <canvas #blockCanvas class="block"></canvas>
      <div class="refreshIcon" (click)="resetCaptcha()">
        <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          />
        </svg>
      </div>
      <div class="sliderContainer">
        <div
          class="sliderMask"
          [style]="{ width: sliderPosition + 'px' }"
        ></div>
        <div
          class="slider"
          [style]="{ left: sliderPosition + 'px' }"
          (mousedown)="startDrag($event)"
          (touchstart)="startDrag($event)"
        >
          <svg
            class="sliderIcon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class NgxSliderCaptcha implements OnInit, AfterViewInit {
  @ViewChild('mainCanvas', { static: false }) mainCanvas!: ElementRef;
  @ViewChild('blockCanvas', { static: false }) blockCanvas!: ElementRef;

  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  @Input() config: CaptchaConfig = {
    image: '',
    failTimeout: MINUTE_IN_MS,
  };

  @Output() success = new EventEmitter<CaptchaSuccess>();
  @Output() failed = new EventEmitter<void>();

  get failTimeout(): number {
    return this.config.failTimeout;
  }

  get image(): string {
    return this.config.image;
  }

  sliderPosition = 0;
  x = 0; // x position for block puzzle piece
  y = 0; // y position for block puzzle piece
  dragging = false;
  blockWidth = 42;
  blockHeight = 42;

  ngOnInit(): void {
    this.setTimer();
  }

  setTimer() {
    timer(this.failTimeout)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onCaptchaFailed();
        },
      });
  }

  ngAfterViewInit(): void {
    this.initializeCaptcha();
  }

  initializeCaptcha(): void {
    const mainCanvasEl = this.mainCanvas.nativeElement;
    const blockCanvasEl = this.blockCanvas.nativeElement;

    const mainCtx = mainCanvasEl.getContext('2d');
    const blockCtx = blockCanvasEl.getContext('2d');

    this.setCanvasStyles(mainCanvasEl, blockCanvasEl);
    this.loadImage(mainCtx, blockCtx);
  }

  setCanvasStyles(
    mainCanvasEl: HTMLCanvasElement,
    blockCanvasEl: HTMLCanvasElement
  ): void {
    const width = 280;
    const height = 155;
    mainCanvasEl.width = width;
    mainCanvasEl.height = height;
    blockCanvasEl.width = this.blockWidth;
    blockCanvasEl.height = height;
  }

  loadImage(
    mainCtx: CanvasRenderingContext2D,
    blockCtx: CanvasRenderingContext2D
  ): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src =
      this.image || 'https://picsum.photos/280/155/?random&t=' + Date.now();
    img.onload = () => {
      this.x = this.getRandomNumber(50, 200);
      this.y = this.getRandomNumber(20, 100);

      this.draw(mainCtx, blockCtx, img);
    };
  }

  draw(
    mainCtx: CanvasRenderingContext2D,
    blockCtx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ): void {
    mainCtx.drawImage(img, 0, 0, 280, 155);

    // Draw the puzzle piece on the main canvas
    this.drawPuzzlePiece(mainCtx, this.x, this.y, 'fill');

    // Draw the puzzle piece on the block canvas
    blockCtx.clearRect(0, 0, this.blockWidth, 155);
    this.drawPuzzlePiece(blockCtx, 0, this.y, 'clip');
    blockCtx.drawImage(
      img,
      this.x,
      0,
      this.blockWidth,
      155,
      0,
      0,
      this.blockWidth,
      155
    );
  }

  drawPuzzlePiece(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    operation: 'fill' | 'clip'
  ): void {
    const l = this.blockWidth;
    const r = 9; // radius for the puzzle piece notches
    const PI = Math.PI;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x + l / 2, y - r, r, 0.72 * PI, 2.26 * PI); // top notch
    ctx.lineTo(x + l, y);
    ctx.arc(x + l + r, y + l / 2, r, 1.21 * PI, 2.78 * PI); // right notch
    ctx.lineTo(x + l, y + l);
    ctx.lineTo(x, y + l);
    ctx.arc(x + r, y + l / 2, r, 2.76 * PI, 1.24 * PI, true); // left notch
    ctx.lineTo(x, y);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();
    ctx.globalCompositeOperation = 'destination-over';
    ctx[operation]();
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent): void {
    if (!this.dragging) return;

    let clientX = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else {
      clientX = event.touches[0].clientX;
    }

    const offsetLeft =
      this.mainCanvas.nativeElement.getBoundingClientRect().left;
    this.sliderPosition = Math.max(
      0,
      Math.min(clientX - offsetLeft, 280 - this.blockWidth)
    );
    const blockPosition = this.sliderPosition;

    this.renderer.setStyle(
      this.blockCanvas.nativeElement,
      'left',
      `${blockPosition}px`
    );
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDrag(): void {
    if (!this.dragging) return;

    this.dragging = false;
    const threshold = 10;
    const offsetLeft =
      this.mainCanvas.nativeElement.getBoundingClientRect().left;
    const finalPosition = this.sliderPosition + offsetLeft;
    const originalPosition = this.x + offsetLeft;

    if (Math.abs(finalPosition - originalPosition) < threshold) {
      this.onCaptchaSuccess();
    }
  }

  onCaptchaSuccess(): void {
    this.success.emit({ value: this.sliderPosition });
    this.resetCaptcha();
  }

  onCaptchaFailed(): void {
    this.failed.emit();
    this.resetCaptcha();
  }

  resetCaptcha(): void {
    this.sliderPosition = 0;
    this.initializeCaptcha();
    this.setTimer();
  }

  getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
