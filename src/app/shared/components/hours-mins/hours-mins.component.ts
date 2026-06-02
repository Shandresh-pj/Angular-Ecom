import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-hours-mins',
  standalone: true,
  imports: [FormsModule, MatSelectModule, CommonModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './hours-mins.component.html',
  styleUrls: ['./hours-mins.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HoursMinsComponent),
      multi: true
    }
  ]
})
export class HoursMinsComponent implements ControlValueAccessor {
  @Input() label: string = ''; 
  @Input() label1: string = '';
  @Input() ControlName: string[] = ['Hours', 'Minutes'];


  hours: number[] = [];
  minutes: number[] = [];

  hourControl = new FormControl();
  minuteControl = new FormControl();

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor() {
    this.generateHours();
    this.generateMinutes();

    this.hourControl.valueChanges.subscribe(value => {
      this.updateValue();
    });

    this.minuteControl.valueChanges.subscribe(value => {
      this.updateValue();
    });
  }

  generateHours(): void {
    for (let i = 0; i < 24; i++) {
      this.hours.push(i);
    }
  }

  generateMinutes(): void {
    for (let i = 0; i < 60; i++) {
      this.minutes.push(i);
    }
  }

  // writeValue(value: any): void {
  //   if (value) {
  //     const [hours, minutes] = value.split(':');
  //     this.hourControl.setValue(hours, { emitEvent: false });
  //     this.minuteControl.setValue(minutes, { emitEvent: false });
  //   }
  // }
  writeValue(value: any): void {
    console.log('writeValue received:', value);
    if (value && typeof value === 'string') {
      const [hours, minutes] = value.split(':');
      this.hourControl.setValue(parseInt(hours, 10), { emitEvent: false });
      this.minuteControl.setValue(parseInt(minutes, 10), { emitEvent: false });
    } else {
      this.hourControl.setValue(0, { emitEvent: false });
      this.minuteControl.setValue(0, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.hourControl.disable();
      this.minuteControl.disable();
    } else {
      this.hourControl.enable();
      this.minuteControl.enable();
    }
  }

  // private updateValue(): void {
  //   const hours = this.hourControl.value || '00';
  //   const minutes = this.minuteControl.value || '00';
  //   const combinedValue = `${hours}:${minutes}`;
  //   this.onChange(combinedValue);
  //   this.onTouched();
  // }
  private updateValue(): void {
    const hours = this.hourControl.value !== null ? this.hourControl.value.toString().padStart(2, '0') : '00';
    const minutes = this.minuteControl.value !== null ? this.minuteControl.value.toString().padStart(2, '0') : '00';
    const combinedValue = `${hours}:${minutes}`;
    this.onChange(combinedValue);
    this.onTouched();
  }
  // private updateValue(): void {
  //   const hours = this.hourControl.value ? String(this.hourControl.value).padStart(2, '0') : '00';
  //   const minutes = this.minuteControl.value ? String(this.minuteControl.value).padStart(2, '0') : '00';
  //   const combinedValue = `${hours}:${minutes}`;
  //   console.log('Combined Value:', combinedValue); // Debug log
  //   this.onChange(combinedValue);
  //   this.onTouched();
  // }
}