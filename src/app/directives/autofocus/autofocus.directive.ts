import { AfterContentInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";

const BASE_TIMER_DELAY = 10;

@Directive({
  selector: "[autofocus], [appAutofocus]"
})
export class AutofocusDirective implements AfterContentInit, OnChanges, OnDestroy {

  @Input("appAutofocus") public shouldFocusElement: any;
  @Input("autofocusDelay") public timerDelay: any;

  private timer: ReturnType<typeof setTimeout> | null;

  constructor(private elementRef: ElementRef) {
    this.shouldFocusElement = "";
    this.timer = null;
    this.timerDelay = BASE_TIMER_DELAY;
  }

  ngAfterContentInit(): void {
    if (this.shouldFocusElement === "") {
      this.startFocusWorkflow();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["timerDelay"] && typeof this.timerDelay !== "number") {
      if (isNaN((this.timerDelay as any) = +this.timerDelay)) {
        this.timerDelay = BASE_TIMER_DELAY;
      }
    }
    if (changes["shouldFocusElement"]) {
      this.shouldFocusElement ? this.startFocusWorkflow() : this.stopFocusWorkflow();
    }
  }

  ngOnDestroy(): void {
    this.stopFocusWorkflow();
  }

  private startFocusWorkflow(): void {
    if (this.timer) {
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      this.elementRef.nativeElement.focus();
    }, this.timerDelay as number);
  }

  private stopFocusWorkflow(): void {
    clearTimeout(this.timer as ReturnType<typeof setTimeout>);
    this.timer = null;
  }
}
