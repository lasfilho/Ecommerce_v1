import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="inputId" class="text-sm font-medium text-ink">
          {{ label() }}
          @if (required()) {
            <span class="text-danger">*</span>
          }
        </label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled"
        [attr.min]="min()"
        [attr.max]="max()"
        [(ngModel)]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
        class="h-11 w-full rounded-lg border border-border bg-surface-elevated px-4 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted"
      />
      @if (hint()) {
        <p class="text-xs text-ink-muted">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="text-xs text-danger">{{ error() }}</p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'datetime-local'>(
    'text'
  );
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly required = input(false);
  readonly min = input<number | undefined>();
  readonly max = input<number | undefined>();

  readonly inputId = `ui-input-${Math.random().toString(36).slice(2, 9)}`;

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
