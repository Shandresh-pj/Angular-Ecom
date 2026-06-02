import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-autocomplete-matchips',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './autocomplete-matchips.component.html',
  styleUrl: './autocomplete-matchips.component.scss'
})
export class AutocompleteMatchipsComponent {
  @ViewChild('chipInput') chipInput!: ElementRef<HTMLInputElement>; // Reference the input
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchControl = new FormControl('');
  filteredOptions: { Id: number, Name: String }[] = [];

  @Input() placeholder: string = 'Select items'; // Input for placeholder text
  @Input() options: { Id: number, Name: String }[] = []; // Input for available options
  @Input() selectedItems: { Id: number, Name: String }[] = []; // Input for pre-selected items

  @Output() selectedItemsChange = new EventEmitter<{ Id: number, Name: String }[]>(); // Output to notify parent of changes

  constructor() {
    this.searchControl.valueChanges.subscribe((value) => {
      this.filterOptions(value || '');
    });
  }

  filterOptions(value: string): void {
    const filterValue = value?.toLowerCase() || '';
    this.filteredOptions = this.options.filter(
      (option) =>
        option.Name.toLowerCase().includes(filterValue) &&
        !this.selectedItems.includes(option)
    );
  }

  onInputFocus(): void {
    // When the input is focused, show all available options that are not already selected
    this.filteredOptions = this.options.filter(
      (option) => !this.selectedItems.includes(option)
    );
  }

  selectFirstValidOption(): void {
    if (this.filteredOptions.length > 0) {
      const firstOption = this.filteredOptions[0];
      if (!this.selectedItems.some((item) => item.Id === firstOption.Id)) {
        this.selectedItems.push(firstOption);
        this.selectedItemsChange.emit(this.selectedItems);
        this.searchControl.setValue(''); // Clear the input
      }
    }
  }

  handleEnterKey(): void {
    const inputValue = this.searchControl.value?.trim();
    if (inputValue) {
      const matchingOption = this.options.find(
        (option) => option.Name.toLowerCase() === inputValue.toLowerCase()
      );
      if (matchingOption && !this.selectedItems.some((item) => item.Id === matchingOption.Id)) {
        this.selectedItems.push(matchingOption);
        this.selectedItemsChange.emit(this.selectedItems);
      }
    } else {
      // If no valid input, select the first valid option
      this.selectFirstValidOption();
    }
    this.searchControl.setValue(''); // Clear the input after handling
  }

  selectItem(event: any): void {
    const value = event.option.value;
    if (value && !this.selectedItems.includes(value)) {
      this.selectedItems.push(value);
      this.selectedItemsChange.emit(this.selectedItems);
      if (this.chipInput) {
        this.chipInput.nativeElement.value = ''; // Clear the input directly
      }
      console.log('After setValue:', this.searchControl.value);
    }
  }

  removeItem(item: { Id: number, Name: String }): void {
    const index = this.selectedItems.indexOf(item);
    if (index >= 0) {
      this.selectedItems.splice(index, 1);
      this.selectedItemsChange.emit(this.selectedItems);
      this.filterOptions(this.searchControl.value || '');
    }
  }

  addItem(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedItems.includes(value)) {
      this.selectedItems.push(value);
      this.selectedItemsChange.emit(this.selectedItems);
    }
    // Clear the input value
    event.chipInput!.clear();
  }
}