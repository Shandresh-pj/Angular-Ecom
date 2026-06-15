import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonService } from '../../core/service/common.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-status',
    standalone: true,
    imports: [
        MatTableComponent,
        MatCard,
        MatIcon,
        MatFormField,
        MatInput,
        MatLabel,
        MatError,
        ReactiveFormsModule,
    ],
    templateUrl: './status.component.html',
    styleUrl: './status.component.scss',
})
export class StatusComponent extends Utils implements OnInit {

    isToggled: any;
    public action = { add: true, edit: true, view: false, delete: true };
    columns: any;
    showStatusForm = false;
    statusForm!: FormGroup;
    formMode: any;

    public apiRoute = 'Status';
    public uiPagePath = 'status';
    pageLabel = 'Status';

    @ViewChild('mattablechild') matTable!: MatTableComponent;

    constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) {
        super();
        this.statusForm = this.formBuilder.group({
            Id: [''],
            StatusCode: ['', Validators.required],
            StatusFor: ['COMMON', Validators.required],
        });

        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.columns = [
            {
                columnDef: 'ID',
                header: 'ID',
                cell: (element: any) => `${element?.Id}`,
            },
            {
                columnDef: 'StatusCode',
                header: 'Status Code',
                cell: (element: any) => `${element?.StatusCode ?? ''}`,
            },
            {
                columnDef: 'StatusFor',
                header: 'Status For',
                cell: (element: any) => `${element?.StatusFor ?? ''}`,
            },
        ];
    }

    ngOnInit(): void {}

    Toggleclass(value: any, mode: any) {
        this.formMode = mode;
        this.showStatusForm = true;
        if (mode === 'edit' || mode === 'view') {
            this.statusForm.patchValue({
                Id: value?.Id,
                StatusCode: value?.StatusCode,
                StatusFor: value?.StatusFor ?? 'COMMON',
            });
            if (mode === 'view') {
                this.statusForm.disable();
            }
        }
    }

    SubmitStatusForm(form: FormGroup) {
        if (!form.valid) {
            this.validateAllFormFields(form);
            return;
        }

        const Id = form.value.Id;

        const request$ =
            !Id || Id === 0
                ? this.commonService.postApi('Status/Add', form.value)
                : this.commonService.postApi(`Status/Update/${Id}`, form.value);

        request$.subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: Id ? 'Updated Successfully' : 'Added Successfully',
                    showConfirmButton: false,
                    timer: 1500,
                    width: 400,
                }).then(() => {
                    this.closeStatusForm();
                });
            },
            error: (error: any) => {
                this.errorAlert(error);
            },
        });
    }

    deleteStatus(element: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete status "${element?.StatusCode}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
        }).then((result) => {
            if (result.isConfirmed) {
                this.commonService.deleteApi(`Status/${element?.Id}`).subscribe({
                    next: () => {
                        this.matTable?.getData();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted Successfully',
                            showConfirmButton: false,
                            timer: 1200,
                            width: 400,
                        });
                    },
                    error: (error: any) => {
                        this.errorAlert(error);
                    },
                });
            }
        });
    }

    closeStatusForm() {
        this.showStatusForm = false;
        this.formMode = '';
        this.statusForm.enable();
        this.statusForm.reset();
        this.statusForm.patchValue({ Id: '', StatusCode: '', StatusFor: 'COMMON' });
    }
}
