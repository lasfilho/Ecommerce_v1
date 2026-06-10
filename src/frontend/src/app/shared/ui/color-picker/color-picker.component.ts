import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  EXCEL_STANDARD_COLORS,
  EXCEL_THEME_COLOR_COLUMNS,
  excelSwatchNeedsBorder,
  findExactExcelPaletteColor,
  isColorInExcelPalette,
  loadExcelRecentColors,
  normalizeExcelColorKey,
  resolveBannerHexColor,
  saveExcelRecentColor
} from '../../../core/models/excel-color-palette';

@Component({
  selector: 'ui-color-picker',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <p class="text-sm font-medium text-ink">
          {{ label() }}
          @if (required()) {
            <span class="text-danger">*</span>
          }
        </p>
      }

      <div
        class="excel-panel inline-block w-max rounded border border-[#ababab] bg-white shadow-sm"
        role="radiogroup"
        [attr.aria-label]="label() ?? 'Selecionar cor do banner'"
      >
        @if (orphanBannerColor(); as orphan) {
          <p class="excel-section-title">Cor atual do banner</p>
          <div class="excel-grid-row">
            <button
              type="button"
              role="radio"
              aria-checked="true"
              [disabled]="isDisabled"
              (click)="select(orphan)"
              class="excel-swatch excel-swatch--selected"
              [class.excel-swatch--bordered]="needsBorder(orphan)"
              [style.background-color]="orphan"
            ></button>
          </div>
          <div class="excel-divider"></div>
        }

        <p class="excel-section-title">Cores do Tema</p>
        <div class="excel-grid-row">
          @for (column of themeColumns; track $index) {
            <div class="excel-grid-column">
              @for (color of column; track color) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="isSelected(color)"
                  [disabled]="isDisabled"
                  (click)="select(color)"
                  class="excel-swatch"
                  [class.excel-swatch--selected]="isSelected(color)"
                  [class.excel-swatch--bordered]="needsBorder(color)"
                  [style.background-color]="color"
                ></button>
              }
            </div>
          }
        </div>

        <div class="excel-divider"></div>

        <p class="excel-section-title">Cores Padrão</p>
        <div class="excel-grid-row">
          @for (color of standardColors; track color) {
            <button
              type="button"
              role="radio"
              [attr.aria-checked]="isSelected(color)"
              [disabled]="isDisabled"
              (click)="select(color)"
              class="excel-swatch"
              [class.excel-swatch--selected]="isSelected(color)"
              [class.excel-swatch--bordered]="needsBorder(color)"
              [style.background-color]="color"
            ></button>
          }
        </div>

        @if (recentColors().length > 0) {
          <div class="excel-divider"></div>
          <p class="excel-section-title">Cores Recentes</p>
          <div class="excel-grid-row">
            @for (color of recentColors(); track color) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="isSelected(color)"
                [disabled]="isDisabled"
                (click)="select(color)"
                class="excel-swatch"
                [class.excel-swatch--selected]="isSelected(color)"
                [class.excel-swatch--bordered]="needsBorder(color)"
                [style.background-color]="color"
              ></button>
            }
          </div>
        }
      </div>

      @if (error()) {
        <p class="text-xs text-danger">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .excel-panel {
      --swatch-size: 26px;
      --swatch-gap: 3px;
      padding: 12px 14px;
    }

    .excel-section-title {
      margin-bottom: 7px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-ink, #18181b);
    }

    .excel-divider {
      margin: 11px 0;
      border-top: 1px solid #d9d9d9;
    }

    .excel-grid-row {
      display: flex;
      gap: var(--swatch-gap);
    }

    .excel-grid-column {
      display: flex;
      flex-direction: column;
      gap: var(--swatch-gap);
    }

    .excel-swatch {
      height: var(--swatch-size);
      width: var(--swatch-size);
      flex-shrink: 0;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: outline 0.1s ease, box-shadow 0.1s ease;
    }

    .excel-swatch:focus-visible {
      outline: 2px solid #4472c4;
      outline-offset: 2px;
    }

    .excel-swatch:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .excel-swatch--bordered {
      box-shadow: inset 0 0 0 1px #bfbfbf;
    }

    .excel-swatch--selected {
      outline: 2px solid #4472c4;
      outline-offset: 2px;
      box-shadow: 0 0 0 1px #fff;
      z-index: 1;
      position: relative;
    }
  `
})
export class ColorPickerComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly error = input<string>();
  readonly required = input(false);

  readonly themeColumns = EXCEL_THEME_COLOR_COLUMNS;
  readonly standardColors = EXCEL_STANDARD_COLORS;
  readonly recentColors = signal<string[]>(loadExcelRecentColors());
  readonly value = signal('');

  /** Cor do banner que não está na paleta Excel (ex.: gradiente legado). */
  readonly orphanBannerColor = computed(() => {
    const current = this.value();
    if (!current || isColorInExcelPalette(current)) {
      return null;
    }

    return resolveBannerHexColor(current);
  });

  isDisabled = false;

  private onChangeFn: (value: string) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;

  writeValue(value: string): void {
    this.value.set(value ?? '');
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

  needsBorder(color: string): boolean {
    return excelSwatchNeedsBorder(color);
  }

  isSelected(color: string): boolean {
    const current = this.value();
    if (!current) {
      return false;
    }

    return normalizeExcelColorKey(color) === this.selectedColorKey();
  }

  select(color: string): void {
    if (this.isDisabled) {
      return;
    }

    const canonical = findExactExcelPaletteColor(color) ?? color;
    this.value.set(canonical);
    this.onChangeFn(canonical);
    this.onTouchedFn();
    this.recentColors.set(saveExcelRecentColor(canonical));
  }

  private selectedColorKey(): string {
    const current = this.value();
    const exact = findExactExcelPaletteColor(current);
    if (exact) {
      return normalizeExcelColorKey(exact);
    }

    const hex = resolveBannerHexColor(current);
    return hex ?? normalizeExcelColorKey(current);
  }
}
