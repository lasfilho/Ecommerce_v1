import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="textareaId" class="text-sm font-medium text-ink">
          {{ label() }}
          @if (required()) {
            <span class="text-danger">*</span>
          }
        </label>
      }
      <textarea
        [id]="textareaId"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled"
        [(ngModel)]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
        class="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted"
      ></textarea>
      @if (error()) {
        <p class="text-xs text-danger">{{ error() }}</p>
      }
    </div>
  `
})
export class TextareaComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly placeholder = input('');
  readonly rows = input(4);
  readonly error = input<string>();
  readonly required = input(false);

  readonly textareaId = `ui-textarea-${Math.random().toString(36).slice(2, 9)}`;

  value = '';
  isDisabled = false;

  private onChangeFn: (value: string) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChange(value: string): void {
    this.onChangeFn(value);
  }

  onTouched(): void {
    this.onTouchedFn();
  }
}
