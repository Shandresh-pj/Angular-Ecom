import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  selector: 'app-lable',
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
  templateUrl: './lable.component.html',
  styleUrl: './lable.component.scss'
})
export class LableComponent extends Utils implements OnInit{
    CompanyId: any;
    isToggled: any;
    public action = { add: true, edit: true, view: true };
    columns: any;
    showLableForm = false;
    categoryForm!: FormGroup;
    formMode: any;
    statuses: any;
    public languages: any;
    languageIds: any = [];
    selectedTab: any = 0;
    catLanguage: any = {};
    lable: any[] = [];
    public apiRoute = 'Label';
    public uiPagePath = 'lable';
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
            // ParentLableId: [0, Validators.required],
            LabelCode: ['', Validators.required],
            LabelTranslations: this.formBuilder.array([]),
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            const encryptedData = params['data'];
            this.CompanyId = params['company_id'] || 0;
            if (encryptedData) {
                const decryptedObj =this.encryptionService.decrypt(encryptedData);
                console.log('Decrypted Params:', decryptedObj);
                this.CompanyId = decryptedObj.company_id || 0;
            }
        });

        this.columns = [
            {columnDef: 'ID',header: 'ID',cell: (element: any) => `${element?.Id}`},
            {columnDef: 'LabelCode',header: 'Label Code',cell: (element: any) => `${element?.LabelCode}`},
            {columnDef: 'Decription',header: 'Decription',cell: (element: any) =>
              `${element.LabelTranslations[0]?.Description ? element.LabelTranslations[0]?.Description : element.LabelTranslations[1]?.Description}`,
            },
        ];
    }

    ngOnInit(): void {
        this.languages = this.config?.lang;
        console.log('checklanguaes', this.languages);
        this.getStatues();
        for (let lang of this.languages) {
            this.LabelTranslations().push(this.createItem());
            this.languageIds.push({ LanguageId: lang.Id });
        }
        this.categoryForm.patchValue({
            LabelTranslations: this.languageIds,
        });
    }

    LabelTranslations(): FormArray {
        return this.categoryForm.get('LabelTranslations') as FormArray;
    }
    createItem(): FormGroup {
        return this.formBuilder.group({
            LanguageId: [''],
            // Name: ['', Validators.required],
            Description: ['', Validators.required],
        });
    }

    getStatues() {
        this.statuses = this.statusService.getStatus('COMMON');
        console.log('checkstatus', this.statuses);
    }

    getLable() {
        this.commonService.getApi(`Lable/All`).subscribe({
            next: (res: any) => {
                this.lable = res?.data?.data;
                console.log('checkcategory', this.lable);
            },
            error: (err: any) => {
                this.lable = [];
            },
        });
    }

    detectFiles(event: any) {
        const file: File = event.target.files[0];
        this.fileName = file.name;
        const formData = new FormData();
        formData.append('thumbnail', file);
        this.ImageFile = file;
        this.urls = [];
        this.deletedImage=false;
        let files = event.target.files;
        if (files) {
            for (let file of files) {
                let reader = new FileReader();
                reader.onload = (e: any) => {
                    this.urls.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    Toggleclass(value: any, mode: any) {
        this.getLable();
        this.formMode = mode;
        this.showLableForm = true;
        this.urls = [];
        if (mode === 'edit' || mode === 'view') {
            this.commonService.getApi(`Label/Detail/${value?.Id}`).subscribe((res: any) => {
                    this.getdetailcategory = res?.data;
                    if (this.getdetailcategory?.UploadImage) {
                        this.urls.push(`${environment.domain}/${this.getdetailcategory.UploadImage}`);
                    }

                    this.categoryForm.patchValue({
                        ...this.getdetailcategory,
                    });
                    this.LabelTranslations().clear();
                    for (let i = 0;i < this.getdetailcategory?.LabelTranslations.length;i++) {
                        this.LabelTranslations().push(
                            this.formBuilder.group({
                                LanguageId:this.getdetailcategory?.LabelTranslations[i].LanguagesId,
                                // Name: this.getdetailcategory?.LabelTranslations[i].Name,
                                Description:this.getdetailcategory?.LabelTranslations[i].Description,
                            }),
                        );
                    }
                    this.catLanguage = {};
                    this.getdetailcategory?.LabelTranslations.map((cat: any) => {
                            this.catLanguage[cat?.LanguagesId] = cat;
                        },
                    );
                    if (mode === 'view') {
                this.categoryForm.disable();
            }
                });
            
        } else if (mode === 'add') {
        }
    }

    deleteLableImage(url: string) {
        this.urls = this.urls.filter((u) => u !== url);
        this.deletedImage = true;
        this.ImageFile = null;
    }

    SubmitLableForm(form: FormGroup) {
        this.selectedTab = this.tabValidate(form,'LabelTranslations','Name');
        if (form.valid) {
            const formData = new FormData();
            if (this.ImageFile) {
                formData.append('UploadImage', this.ImageFile);
                console.log('UploadImage', this.ImageFile);
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
            this.formDataSubmit(this.categoryForm.value.Id,formData,this.categoryForm,this.apiRoute,{
                    redirect: '/' + this.uiPagePath,
                    formInitialValues: this.formInitialValues,
                    commonService: this.commonService,
                    router: this.router,
                },
            ).then(() => {
                this.closeLableForm();
            });
        } else {
            this.validateAllFormFields(form);
        }
    }
    closeLableForm() {
        this.showLableForm = false;
        this.formMode = '';
        this.categoryForm.enable();
        this.categoryForm.reset();
        this.resetForm();
    }
    resetForm() {
        this.LabelTranslations().clear();
        this.languageIds = [];
        for (let lang of this.languages) {
            this.LabelTranslations().push(this.createItem());
            this.languageIds.push({ LanguageId: lang.Id });
        }
        this.categoryForm.patchValue({
            Id: '',
            // ParentLableId: 0,
            LabelCode: '',
            LabelTranslations: this.languageIds,
        });
        this.urls = [];
        this.ImageFile = null;
        this.fileName = null;
        this.selectedTab = 0;
        this.deletedImage = false;
    }
}
