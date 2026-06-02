import { ChangeDetectorRef,Component,EventEmitter,Input,OnChanges,OnInit,Output,SimpleChanges,} from '@angular/core';
import { FormArray,FormBuilder,FormControl,FormGroup,Validators,} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { splitCamelCase, Utils } from '../../../utils';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/service/common.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { HoursMinsComponent } from '../hours-mins/hours-mins.component';
export interface TableColumn {
    field: string; // Field in the data source
    header: string; // Displayed header
    editable: boolean; // Whether the column is editable
    type?: string;
    options?: any[];
    optionsDetail?: { label: string; value: string };
    isRequired?: boolean;
    customValidation?: string;
    isHidden?: boolean;
}
@Component({
    selector: 'app-editable-table',
    templateUrl: './editable-table.component.html',
    styleUrls: ['./editable-table.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        HoursMinsComponent,
        MatCardModule,
        MatCheckboxModule,
    ],
})
export class EditableTableComponent extends Utils implements OnInit, OnChanges {
    @Input() dataSource: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() primaryKey: string = 'Id';
    @Input() type: any = '';
    @Input() url = '';
    @Output() save = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<void>();
    @Output() rowClicked = new EventEmitter<any>(); // New event for row click
    @Output() SelectOptionsValid = new EventEmitter<any>();
    @Input() view: boolean = false;
    @Input() copy: boolean = false;
    displayedColumns: string[] = []; // Columns for the table
    @Input() isParentFormValid: boolean = false; // New Input to receive parent form validity
    @Input() AllowanceTimeData: string[] = [];
    editingElement: any | null = null;
    editForm!: FormGroup;
    isToggled = false;
    arrayValue: any = [];
    VehicleType: any;
    Vehicles: any;
    allCustomers: any;
    allcompanyBranch: any;
    All: any;
    selectedValues: any;
    AllowancedisplayedColumns: string[] = ['Name', 'FromTime', 'ToTime'];
    Allowancedatasource = new MatTableDataSource<any>();
    allowanceForm: FormGroup;
    constructor(
        private fb: FormBuilder,
        private fbs: FormBuilder,
        private cdr: ChangeDetectorRef,
        public themeService: CustomizerSettingsService,
        private router: Router,
        private commonService: CommonService
    ) {
        super();
        this.allowanceForm = this.fbs.group({
            allowanceRows: this.fbs.array([]),
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });
    }

    get allowanceRows(): FormArray {
        return this.allowanceForm.get('allowanceRows') as FormArray;
    }
    getFromTimeControl(index: number): FormControl {
        const row = this.allowanceRows.at(index);
        return row ? (row.get('FromTime') as FormControl) : new FormControl('');
    }

    getToTimeControl(index: number): FormControl {
        const row = this.allowanceRows.at(index);
        return row ? (row.get('ToTime') as FormControl) : new FormControl('');
    }
    ngOnInit() {
        if (this.type == 'Customer' || this.type == 'Vendor') {
            this.columns = this.columns.filter(
                (column) =>
                    column.field !== 'ForCompanyParentId' &&
                    column.field !== 'CommissionType'
            );
        }

        this.displayedColumns = [...this.columns.map((c) => {return c.field;}),'actions'];
        const allowanceHeader = this.columns.find(
            (col: any) => col.field === 'allow'
        );
        this.allowanceRows.valueChanges.subscribe((value) => {
            this.updateAllowanceData();
        });
    }

    updateAllowanceData() {
        if (!Array.isArray(this.dataSource)) {
            this.dataSource = [];
        }
        const allowanceData = this.allowanceRows.value
            .map((row: any) => ({
                Name: row.Name,
                FromTime: row.FromTime || '',
                ToTime: row.ToTime || '',
            }))
            .filter((row: any) => row.FromTime && row.ToTime);
        console.log('allowanceData', allowanceData);
        const allowanceJson = JSON.stringify(allowanceData);
        this.dataSource = this.dataSource?.map((row) => ({
            ...row,
            AllownceTime: allowanceJson,
        }));
        if (this.editingElement) {
            this.editingElement['AllownceTime'] = allowanceJson;
            this.editForm.patchValue({ AllownceTime: allowanceJson });
        }

        this.save.emit(this.dataSource);
    }

    getOptionsForField(field: string): any[] {
        const column = this.columns.find((col) => col.field === field);
        if (this.type === 'Sub Vendor' && field === 'CommissionType') {
            return [
                { Id: 'Percentage', Name: 'Percentage' },
                { Id: 'Rate', Name: 'Rate' },
            ];
        }
        return column?.options || [];
    }

    getValueKey(field: string): string {
        const column = this.columns.find((col) => col.field === field);
        return column?.optionsDetail?.value ?? 'Id';
    }

    isAllSelected(field: string): boolean {
        const control = this.editForm.get(field);
        const options = this.getOptionsForField(field);
        if (!control || !options.length) return false;
        const selectedValues = Array.isArray(control.value) ? control.value.map((val: any) => String(val)) : [];
        const allOptionValues = options.map((opt: any) =>String(opt[this.getValueKey(field)]));
        return (
            allOptionValues.length > 0 &&
            allOptionValues.every((val) => selectedValues.includes(val))
        );
    }

    isIndeterminate(field: string): boolean {
        const control = this.editForm.get(field);
        const options = this.getOptionsForField(field);
        if (!control || !options.length) return false;
        const selectedValues = Array.isArray(control.value) ? control.value.map((val: any) => String(val))  : [];
        const allOptionValues = options.map((opt: any) => String(opt[this.getValueKey(field)]));
        return (
            selectedValues.length > 0 &&
            selectedValues.length < allOptionValues.length
        );
    }

    toggleSelectAll(field: string): void {
        const control = this.editForm.get(field);
        if (!control) return;
        const options = this.getOptionsForField(field);
        const allValues = options.map((opt: any) => opt[this.getValueKey(field)]);
        if (this.isAllSelected(field)) {
            control.setValue([]);
        } else {
            (field === 'ForCompanyParentId' || field === 'ForCompanyId') && this.type == 'Sub Vendor' ? control.setValue([...allValues, -1]) : control.setValue([...allValues]); // Include '-1' if needed
        }

        this.VehicleSelected(field, control.value);
        this.cdr.detectChanges();
    }
    async VehicleSelected(field: any, event: any) {
        if (field === 'ForCompanyParentId') {
            this.rowClicked.emit({ Name: field, Value: event });
        }
    }
    ngOnChanges(change: SimpleChanges) {
        if (change['columns']) {
            this.displayedColumns = [
                ...change['columns'].currentValue.map((c: any) => {
                    return c.field;
                }),
                'actions',
            ];
        }

        if (change['AllowanceTimeData'] && this.AllowanceTimeData?.length) {
            const filteredData = this.AllowanceTimeData.filter(
                (item) =>item === 'Night' || item === 'ExtraDuty' || item === 'EarlyStart'
            );
            const rows = filteredData.map((name) => ({
                Name: name,
                FromTime: '',
                ToTime: '',
            }));
            console.log('AllowanceTimeData', this.AllowanceTimeData);
            this.Allowancedatasource = new MatTableDataSource<any>(rows);
        }
    }

    startEdit(row: any): void {
        console.log('Editing row with ID:', row, this.view);
        console.log('row', row);
        this.editingElement = { ...row };
        const formControls: any = {};
        this.columns.forEach((col) => {
            let value = row[col.field];
            if (['Days', 'KiloMeter'].includes(col.field) && typeof value === 'string' &&value.includes('.00')) {
                value = parseInt(value, 10).toString();
            }
            formControls[col.field] = [
                value,
                col?.isRequired ? Validators.required : null,
            ];
        });
        this.editForm = this.fb.group(formControls);
   
    }

    getSelectedValue(column: any, row: any) {
        if (column?.type === 'select') {
            const isForCompanyId = column.field === 'ForCompanyId';
            const isForCompanyParentId = column.field === 'ForCompanyParentId';
            const sourceOptions = Array.isArray(isForCompanyId ? this.allcompanyBranch : column?.options) ? isForCompanyId ? this.allcompanyBranch : column?.options : [];
            const selectedData = sourceOptions.filter((opt: any) =>
                row[column.field]?.includes(
                    opt?.[column?.optionsDetail?.value ?? 'Id']
                )
            );

            let result = '';
            const hasForAll = row[column.field]?.includes(-1);
            if (selectedData.length === 1) {
                result = selectedData[0]?.[column?.optionsDetail?.label ?? 'Name'];
            } else if (selectedData.length > 1) {
                result = selectedData
                    .map((item: any) =>
                        isForCompanyParentId
                            ? item.MainBranchName
                            : item.Name ?? item.Value
                    )
                    .join(', ');
            }
            if (hasForAll) {
                result = 'For All' + (result ? ', ' + result : '');
            }
            this.SelectOptionsValid.emit({ Name: result });
            return result.length > 15
                ? result.substring(0, 15) + '...'
                : result;
        }

        let value = row[column.field];

        if (['Days', 'KiloMeter'].includes(column.field) && typeof value === 'string' && value.includes('.00')) {
            value = parseInt(value, 10).toString();
        }

        return value && value.length > 15 ? value.substring(0, 15) + '...' : value;
    }

    saveEdit(row: any): void {
        console.log('saveEdit(row: any)', row);

        if (this.editForm.valid) {
            const updatedRow = { ...row, ...this.editForm.value };

            if (!updatedRow[this.primaryKey]) {
                updatedRow[this.primaryKey] = this.dataSource.length + 1;
            }

            const rowIndex = this.dataSource.findIndex((item) => item[this.primaryKey] === updatedRow[this.primaryKey]);
            if (rowIndex >= 0) {
                this.dataSource[rowIndex] = updatedRow;
            } else {
                updatedRow[this.primaryKey] = this.dataSource.length + 1;
                this.dataSource = [...this.dataSource, updatedRow];
            }
            this.editingElement = null;
            this.save.emit(this.dataSource);
        } else {
            this.validateAllFormFields(this.editForm);
        }
    }

    cancelEdit(): void {
        this.editingElement = null;
        this.cancel.emit();
    }

   
    removeRow(row: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove the row from the data source
                const index = this.dataSource.indexOf(row);
                if (row.Id && index >= 0) {
                    row.Flag = 'D';
                    this.dataSource[index] = row;
                    // return
                } else if (index >= 0) {
                    this.dataSource.splice(index, 1); // Remove the item from the array
                }
                this.dataSource = [...this.dataSource];
                this.cdr.detectChanges();
                Swal.fire(
                    'Deleted!',
                    'The record has been deleted.',
                    'success'
                );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire('Cancelled', 'The record is safe ');
            }
        });
    }
    removeCopyRow(row: any) {
        console.log('this.dataSourceeeeeee', this.dataSource);
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                const index = this.dataSource.indexOf(row);
                if (row.Id && index >= 0) {
                    row.Flag = 'CD';
                    this.dataSource = this.dataSource.filter(
                        (item) => item.Id !== row.Id
                    ); // Remove the item with matching Id
                    console.log(
                        'this.dataSource after removal:',
                        this.dataSource
                    );
                    // return
                } else if (index < 0) {
                    this.dataSource = this.dataSource.filter(
                        (item) => item.Id !== row.Id
                    ); // Remove the item with matching Id
                    console.log(
                        'this.dataSource after removal:',
                        this.dataSource
                    );
                }
                this.dataSource = [...this.dataSource];
                this.cdr.detectChanges();
                Swal.fire(
                    'Deleted!',
                    'The record has been deleted.',
                    'success'
                );
            } else {
                Swal.fire('Cancelled', 'The record is safe ');
            }
        });
    }
    // Add a new row
    addNewRow(): void {
        const newRow: any = { Flag: 'N' };
        this.columns.forEach((col) => {newRow[col.field] = ''; });
        newRow[this.primaryKey] =this.dataSource.length > 0 ?  this.dataSource.length + 1: 1;
        this.dataSource = [newRow, ...this.dataSource]; 
        this.startEdit(newRow);
    }
    CopyEdit(row: any): void {
        console.log('CopyEdit(row: any)', row);
        const copiedRow: any = { ...row, Flag: 'C' }; // Copy row and set Flag to 'C'
        delete copiedRow[this.primaryKey];

        this.columns.forEach((col) => {
            if (copiedRow[col.field] !== undefined) {
                copiedRow[col.field] = copiedRow[col.field]; // Preserve existing values
            } else {
                copiedRow[col.field] = ''; // Set default empty value if not present
            }
        });

        copiedRow[this.primaryKey] =
        this.dataSource.length > 0 ? this.dataSource.length + 1 : 1;
        delete copiedRow.Id;
        this.dataSource = [copiedRow, ...this.dataSource];
        this.startEdit(copiedRow);
    }
    allowancepopup = false;
    AllowancePopup() {
    
        const filteredData = this.AllowanceTimeData.filter(
            (item) => item === 'Night' || item === 'ExtraDuty' || item === 'EarlyStart'
        );
        const rows = filteredData.map((name) => ({
            Name: name,
            FromTime: '',
            ToTime: '',
        }));
        console.log('allowDataallowData', this.dataSource);
        if (this.dataSource.length > 0 && this.dataSource[0].AllownceTime) {
            try {
                const allowData =
                    typeof this.dataSource[0].AllownceTime === 'string'
                        ? JSON.parse(this.dataSource[0].AllownceTime)
                        : this.dataSource[0].AllownceTime;

                rows.forEach((row) => {
                    const matchingAllow = allowData.find(
                        (a: any) => a.Name === row.Name
                    );
                    console.log('matchingAllow', matchingAllow);
                    if (matchingAllow) {
                        row.FromTime = matchingAllow.FromTime || '';
                        row.ToTime = matchingAllow.ToTime || '';
                    }
                });
            } catch (e) {
                console.error('Error parsing allow JSON:', e);
            }
        }

        // Populate allowanceRows FormArray
        rows.forEach((row) => {
            const allowanceGroup = this.fb.group({
                Name: [row.Name],
                FromTime: [row.FromTime],
                ToTime: [row.ToTime],
            });
            this.allowanceRows.push(allowanceGroup);
        });

        // Update Allowancedatasource
        this.Allowancedatasource = new MatTableDataSource<any>(rows);
        this.allowancepopup = true;
        this.cdr.detectChanges(); // Ensure UI updates
    }
    AllowancePopupClose() {
        this.allowancepopup = false;
    }
    splitCamelCases(value: string): string {
        return splitCamelCase(value);
    }
    public resetAllowanceForm(): void {
        this.allowancepopup = false;
        this.allowanceForm.reset();

        while (this.allowanceRows.length) {
            this.allowanceRows.removeAt(0);
        }

        this.cdr.detectChanges();
    }
}
