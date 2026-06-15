import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { StatusService } from '../../core/service/status.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [
        MatTableComponent,
        MatCard,
        MatIcon,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatLabel,
        MatSelectModule,
        MatTabsModule,
    ],
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
})
export class CategoryComponent extends Utils implements OnInit {

    @Input() categoryType: string = '';

    CompanyId: any;
    isToggled: any;
    @ViewChild('mattablechild') mattablechild!: MatTableComponent;
    public action = { add: true, edit: true, view: true, delete: true };
    columns: any;
    showCategoryForm = false;
    categoryForm!: FormGroup;
    formMode: any;
    statuses: any;
    category: any[] = [];

    // Existing backend API: /categories
    public apiRoute = 'categories';
    public uiPagePath: string = 'category';
    pageLabel: string = 'Category';

    fileName: any;
    ImageFile: any;
    urls: any[] = [];
    getdetailcategory: any;
    deletedImage = false;

    constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private statusService: StatusService,
        public userService: UserService,
        private encryptionService: EncryptionService,
    ) {
        super();
        this.categoryForm = this.formBuilder.group({
            Id: [''],
            name: ['', Validators.required],
            description: [''],
            parent_id: [0, Validators.required],
            StatusId: ['', Validators.required],
        });

        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            const encryptedData = params['data'];
            this.CompanyId = params['company_id'] || 0;
            if (encryptedData) {
                const decryptedObj = this.encryptionService.decrypt(encryptedData);
                this.CompanyId = decryptedObj.company_id || 0;
            }
        });

        this.columns = [
            {
                columnDef: 'ID',
                header: 'ID',
                cell: (element: any) => `${element?.id}`,
            },
            {
                columnDef: 'Name',
                header: 'Name',
                cell: (element: any) => `${element?.name ?? ''}`,
            },
            {
                columnDef: 'Description',
                header: 'Description',
                cell: (element: any) => `${element?.description ?? ''}`,
            },
            {
                columnDef: 'Status',
                header: 'Status',
                cell: (element: any) => {
                    const statusObj = this.statuses?.find((s: any) => s.Id === element?.StatusId);
                    return statusObj ? statusObj.StatusCode : '';
                },
            },
        ];
    }

    ngOnInit(): void {
        this.getStatues();
    }

    getStatues() {
        this.statusService.getStatues().subscribe({
            next: (res: any) => {
                this.statuses = this.statusService.getStatus('COMMON');
            },
            error: () => {
                this.statuses = [];
            },
        });
    }

    getCategory() {
        this.commonService.getApi(`categories`).subscribe({
            next: (res: any) => {
                this.category = Array.isArray(res?.data) ? res.data : [];
            },
            error: () => {
                this.category = [];
            },
        });
    }

    detectFiles(event: any) {
        const file: File = event.target.files[0];
        this.fileName = file.name;
        this.ImageFile = file;
        this.urls = [];
        this.deletedImage = false;
        let files = event.target.files;
        if (files) {
            for (let f of files) {
                let reader = new FileReader();
                reader.onload = (e: any) => {
                    this.urls.push(e.target.result);
                };
                reader.readAsDataURL(f);
            }
        }
    }

    Toggleclass(value: any, mode: any) {
        this.getCategory();
        this.formMode = mode;
        this.showCategoryForm = true;
        this.urls = [];
        if (mode === 'edit' || mode === 'view') {
            this.commonService
                .getApi(`categories/${value?.id}`)
                .subscribe((res: any) => {
                    this.getdetailcategory = res?.data;
                    if (this.getdetailcategory?.image) {
                        this.urls.push(
                            `${environment.domain.replace('/api', '')}${this.getdetailcategory.image}`
                        );
                    }
                    this.categoryForm.patchValue({
                        Id: this.getdetailcategory?.id,
                        name: this.getdetailcategory?.name,
                        description: this.getdetailcategory?.description,
                        parent_id: this.getdetailcategory?.parent_id ?? 0,
                        StatusId: this.getdetailcategory?.StatusId,
                    });
                    if (mode === 'view') {
                        this.categoryForm.disable();
                    }
                });
        }
    }

    deleteCategoryImage(url: string) {
        this.urls = this.urls.filter((u) => u !== url);
        this.deletedImage = true;
        this.ImageFile = null;
    }

    SubmitCategoryForm(form: FormGroup) {
        if (!form.valid) {
            this.validateAllFormFields(form);
            return;
        }

        const formData = new FormData();
        formData.append('name', form.value.name ?? '');
        formData.append('description', form.value.description ?? '');
        formData.append('parent_id', String(form.value.parent_id ?? 0));
        formData.append('StatusId', String(form.value.StatusId ?? ''));
        if (this.ImageFile) {
            formData.append('image', this.ImageFile);
        }

        const Id = form.value.Id;

        const request$ =
            !Id || Id === 0
                ? this.commonService.postFormData('categories/create', formData)
                : this.commonService.putFormData(`categories/${Id}`, formData);

        request$.subscribe({
            next: (res: any) => {
                Swal.fire({
                    icon: 'success',
                    title: Id ? 'Updated Successfully' : 'Added Successfully',
                    showConfirmButton: false,
                    timer: 1500,
                    width: 400,
                }).then(() => {
                    this.closeCategoryForm();
                });
            },
            error: (error: any) => {
                this.errorAlert(error);
            },
        });
    }

    closeCategoryForm() {
        this.showCategoryForm = false;
        this.formMode = '';
        this.categoryForm.enable();
        this.categoryForm.reset();
        this.resetForm();
    }

    resetForm() {
        this.categoryForm.patchValue({
            Id: '',
            name: '',
            description: '',
            parent_id: 0,
            StatusId: '',
        });
        this.urls = [];
        this.ImageFile = null;
        this.fileName = null;
        this.deletedImage = false;
    }

    onDelete(element: any): void {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this category?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#602F80',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.commonService.deleteApi(`categories/${element?.Id || element?.id}`).subscribe({
                    next: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Category deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#602F80'
                        });
                        this.mattablechild.getData();
                    },
                    error: (err) => {
                        const errorMessage = err?.error?.message || 'Delete failed. Please try again.';
                        Swal.fire({
                            title: 'Error!',
                            text: errorMessage,
                            icon: 'error',
                            confirmButtonColor: '#602F80'
                        });
                        console.error('Delete failed:', err);
                    }
                });
            }
        });
    }
}
