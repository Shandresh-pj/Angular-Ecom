import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

export interface User {
  name: string;
  value: string;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    AsyncPipe,
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Input() options: User[] = [];
  @Output() filterChange = new EventEmitter<{ filter: string; keyword: string }>();
  @Output() clearFilter = new EventEmitter<void>();

  filterForm: FormGroup;
  filteredOptions: Observable<User[]> | undefined;
  showfilterInputDeleteIcon: boolean = false;
  showtextInputDeleteIcon: boolean = false;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      filterControl: [''],
      keyword: [''],
    });
  }

  ngOnInit(): void {
    this.filteredOptions = this.filterForm
      .get('filterControl')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this._filter(name) : this.options.slice();
        })
      );

    this.filterForm.valueChanges.subscribe((value) => {
     
      this.showfilterInputDeleteIcon = !!value.filterControl;
      this.showtextInputDeleteIcon = !!value.keyword;
      this.filterChange.emit({
        filter: value.filterControl?.value || value.filterControl || '',
        keyword: value.keyword || '',
      });
    });
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  onInputSearchClick(event: Event): void {
    event.stopPropagation();
  
    this.showfilterInputDeleteIcon = !!this.filterForm.get('filterControl')?.value;
  }

  clearInput(event: Event): void {
    event.stopPropagation();
    this.filterForm.get('filterControl')?.setValue(''); 
    this.showfilterInputDeleteIcon = false;
    this.emitFilterChange();
  }

  clearTextInput(event: Event): void {
    event.stopPropagation();
    this.filterForm.get('keyword')?.setValue(''); 
    this.showtextInputDeleteIcon = false;
   
  }

  private emitFilterChange(): void {
    const value = this.filterForm.value;
    this.filterChange.emit({
      filter: value.filterControl?.value || value.filterControl || '',
      keyword: value.keyword || '',
    });
    // Emit clearFilter only if both fields are empty
    if (!value.filterControl && !value.keyword) {
      this.clearFilter.emit();
    }else if(!value.filterControl && value.keyword){
       this.clearFilter.emit();
       this.filterForm.get('keyword')?.setValue(''); 
    }
  }
}