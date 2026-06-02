import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormArray,
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
import { ConfiglangService } from '../../core/service/configlang.service';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';

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
    public action = { add: true, edit: true, view: true };
    columns: any;
    showCategoryForm = false;
    categoryForm!: FormGroup;
    formMode: any;
    statuses: any;
    public languages: any;
    languageIds: any = [];
    selectedTab: any = 0;
    catLanguage: any = {};
    category: any[] = [];
    public apiRoute = 'Category';
    public uiPagePath: string = 'category';
    fileName: any;
    ImageFile: any;
    urls: any[] = [];
    getdetailcategory: any;
    deletedImage = false;

    // ✅ FIX: Plain property instead of getter — set ONCE, never recreated
    pageLabel: string = 'Category';
    tableCustomParams: any = {};

    constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private config: ConfiglangService,
        private route: ActivatedRoute,
        private router: Router,
        private statusService: StatusService,
        public userService: UserService,
        private encryptionService: EncryptionService,
    ) {
        super();
        this.categoryForm = this.formBuilder.group({
            Id: [''],
            ParentCategoryId: [0, Validators.required],
            StatusId: ['', Validators.required],
            Type: ['', Validators.required],
            CategoryTranslations: this.formBuilder.array([]),
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
                cell: (element: any) => `${element?.Id}`,
            },
            {
                columnDef: 'Name',
                header: 'Name',
                cell: (element: any) =>
                    `${element.CategoryTranslations[0]?.Name
                        ? element.CategoryTranslations[0]?.Name
                        : element.CategoryTranslations[1]?.Name}`,
            },
            {
                columnDef: 'Decription',
                header: 'Description',
                cell: (element: any) =>
                    `${element.CategoryTranslations[0]?.Description
                        ? element.CategoryTranslations[0]?.Description
                        : element.CategoryTranslations[1]?.Description}`,
            },
        ];
    }

    ngOnInit(): void {

        // ✅ PAGE LABEL
        this.pageLabel = this.categoryType
            ? `${this.categoryType} Category`
            : 'Category';
    
        // ✅ TABLE FILTER
        if (this.categoryType && this.categoryType.trim() !== '') {
    
            this.tableCustomParams = {
                Type: this.categoryType
            };
    
            // ✅ DYNAMIC REDIRECT URL
            this.uiPagePath =
                `${this.categoryType.toLowerCase()}-category`;
    
        } else {
    
            this.tableCustomParams = {};
    
            // ✅ NORMAL CATEGORY PAGE
            this.uiPagePath = 'category';
    
        }
    
        this.languages = this.config?.lang;
    
        this.getStatues();
    
        for (let lang of this.languages) {
    
            this.CategoryTranslations().push(this.createItem());
    
            this.languageIds.push({
                LanguageId: lang.Id
            });
    
        }
    
        // ✅ DEFAULT TYPE
        this.categoryForm.patchValue({
            Type: this.categoryType || '',
            CategoryTranslations: this.languageIds,
        });
    
    }

    CategoryTranslations(): FormArray {
        return this.categoryForm.get('CategoryTranslations') as FormArray;
    }

    createItem(): FormGroup {
        return this.formBuilder.group({
            LanguageId: [''],
            Name: ['', Validators.required],
            Description: [''],
        });
    }

    getStatues() {
        this.statuses = this.statusService.getStatus('COMMON');
    }

    getCategory() {
        const params = this.categoryType ? { Type: this.categoryType } : {};
        this.commonService.getApi(`Category/All`, params).subscribe({
            next: (res: any) => {
                this.category = res?.data?.data;
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
                .getApi(`Category/Detail/${value?.Id}`)
                .subscribe((res: any) => {
                    this.getdetailcategory = res?.data;
                    if (this.getdetailcategory?.UploadImage) {
                        this.urls.push(
                            `${environment.domain}/${this.getdetailcategory.UploadImage}`
                        );
                    }
                    this.categoryForm.patchValue({ ...this.getdetailcategory });
                    this.CategoryTranslations().clear();
                    for (
                        let i = 0;
                        i < this.getdetailcategory?.CategoryTranslations.length;
                        i++
                    ) {
                        this.CategoryTranslations().push(
                            this.formBuilder.group({
                                LanguageId:
                                    this.getdetailcategory?.CategoryTranslations[i].LanguagesId,
                                Name: this.getdetailcategory?.CategoryTranslations[i].Name,
                                Description:
                                    this.getdetailcategory?.CategoryTranslations[i].Description,
                            })
                        );
                    }
                    this.catLanguage = {};
                    this.getdetailcategory?.CategoryTranslations.map((cat: any) => {
                        this.catLanguage[cat?.LanguagesId] = cat;
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
        this.selectedTab = this.tabValidate(form, 'CategoryTranslations', 'Name');
        if (form.valid) {
            const formData = new FormData();

            // if (this.categoryType) {
                // formData.append('Type', this.categoryType);
            // }
            if (this.ImageFile) {
                formData.append('UploadImage', this.ImageFile);
            }
            if (this.deletedImage) {
                formData.append('UploadImage', '');
            }
            for (var key in form.value) {
                if (Array.isArray(form.value[key])) {
                    formData.append(key, JSON.stringify(form.value[key]));
                } else {
                    formData.append(key, form.value[key]);
                }
            }

            this.formDataSubmit(
                this.categoryForm.value.Id,
                formData,
                this.categoryForm,
                this.apiRoute,
                {
                    redirect: '/' + this.uiPagePath,
                    formInitialValues: this.formInitialValues,
                    commonService: this.commonService,
                    router: this.router,
                }
            ).then(() => {
                this.closeCategoryForm();
            });
        } else {
            this.validateAllFormFields(form);
        }
    }

    closeCategoryForm() {
        this.showCategoryForm = false;
        this.formMode = '';
        this.categoryForm.enable();
        this.categoryForm.reset();
        this.resetForm();
    }

    resetForm() {
        this.CategoryTranslations().clear();
        this.languageIds = [];
        for (let lang of this.languages) {
            this.CategoryTranslations().push(this.createItem());
            this.languageIds.push({ LanguageId: lang.Id });
        }
        this.categoryForm.patchValue({
            Id: '',
            ParentCategoryId: 0,
            StatusId: '',
            Type: this.categoryType || '',
            CategoryTranslations: this.languageIds,
        });
        this.urls = [];
        this.ImageFile = null;
        this.fileName = null;
        this.selectedTab = 0;
        this.deletedImage = false;
    }
}