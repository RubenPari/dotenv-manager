/**
 * @module web/app/components/ui-modal
 */
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

const FOCUSABLE = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(', ');

@Component({
  selector: 'ui-modal',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50" role="presentation" aria-hidden="true">
        <div
          class="animate-backdrop-in absolute inset-0 bg-fg/40 backdrop-blur-sm dark:bg-black/60"
          (click)="close()"
        ></div>
        <div
          class="pointer-events-none absolute inset-0 z-[1] flex min-h-full items-center justify-center p-4"
        >
          <div
            #panel
            class="pointer-events-auto w-full max-w-md animate-modal-in overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl shadow-fg/10"
            [class.p-0]="!padded() && !title() && !showClose()"
            role="dialog"
            [attr.aria-modal]="'true'"
            [attr.aria-labelledby]="title() ? titleId : null"
            (click)="$event.stopPropagation()"
          >
            @if (title() || showClose()) {
              <div class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                @if (title()) {
                  <h2 [attr.id]="titleId" class="text-lg font-semibold text-fg">
                    {{ title() }}
                  </h2>
                } @else {
                  <span [attr.id]="titleId" class="sr-only">Dialog</span>
                }
                @if (showClose()) {
                  <button
                    type="button"
                    #closeBtn
                    class="ml-auto rounded-md p-1.5 text-fg-muted transition-ui hover:bg-surface hover:text-fg focus:outline-none focus:ring-2 focus:ring-ring/50"
                    (click)="close()"
                    aria-label="Close dialog"
                  >
                    <lucide-icon name="x" [size]="20" />
                  </button>
                }
              </div>
            }
            <div [class]="padded() ? 'p-5' : 'p-0'">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class UiModalComponent {
  private readonly document = inject(DOCUMENT);
  private previousActive: HTMLElement | null = null;
  private readonly _titleId = `ui-m-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly titleId = this._titleId;

  readonly open = model(false);
  readonly title = input<string | undefined>(undefined);
  readonly showClose = input(true);
  readonly padded = input(true);

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  constructor() {
    effect((onCleanup) => {
      if (this.open()) {
        this.previousActive = (this.document.activeElement as HTMLElement) ?? null;
        this.document.body.style.overflow = 'hidden';
        const id = window.setTimeout(() => {
          this.focusFirst();
        }, 0);
        onCleanup(() => {
          clearTimeout(id);
        });
      } else {
        this.document.body.style.overflow = '';
        const p = this.previousActive;
        this.previousActive = null;
        if (p?.isConnected) {
          p.focus();
        }
      }
    });
  }

  private focusFirst(): void {
    const c = this.closeBtn()?.nativeElement;
    if (c) {
      c.focus();
      return;
    }
    const root = this.panel()?.nativeElement;
    if (!root) {
      return;
    }
    const f = root.querySelector<HTMLElement>(FOCUSABLE);
    if (f) {
      f.focus();
    } else {
      root.setAttribute('tabindex', '-1');
      root.focus();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape($event: Event): void {
    if (this.open()) {
      $event.stopPropagation();
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onTab($event: KeyboardEvent): void {
    if (!this.open() || $event.key !== 'Tab') {
      return;
    }
    const root = this.panel()?.nativeElement;
    if (!root) {
      return;
    }
    const list = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null,
    );
    if (list.length < 2) {
      if (list.length === 1) {
        $event.preventDefault();
        list[0]!.focus();
      }
      return;
    }
    const first = list[0]!;
    const last = list[list.length - 1]!;
    const a = this.document.activeElement;
    if ($event.shiftKey) {
      if (a === first || a === root) {
        $event.preventDefault();
        last.focus();
      }
    } else {
      if (a === last) {
        $event.preventDefault();
        first.focus();
      }
    }
  }

  close(): void {
    this.open.set(false);
  }
}
