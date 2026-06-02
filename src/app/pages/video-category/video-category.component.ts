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
@Component({
    selector: 'app-video-category',
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
    templateUrl: './video-category.component.html',
    styleUrl: './video-category.component.scss',
})
export class VideoCategoryComponent extends Utils implements OnInit {
    CompanyId: any;
    isToggled: any;
    public action = { add: true, edit: true, view: true };
    columns: any;
    showVideoCategoryForm = false;
    videoCategoryForm!: FormGroup;
    formMode: any;
    statuses: any;
    public languages: any;
    languageIds: any = [];
    selectedTab: any = 0;
    catLanguage: any = {};
    VideosCategoryEdit: any;
    selectedRow: any = null;
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
        this.videoCategoryForm = this.formBuilder.group({
            Id: [''],
            CategoryId: [''],
            StatusId: ['',Validators.required],
            VideoCategoryTranslations: this.formBuilder.array([]),
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            const encryptedData = params['data'];
            this.CompanyId = params['company_id'] || 0;
            if (encryptedData) {
                const decryptedObj =
                    this.encryptionService.decrypt(encryptedData);
                console.log('Decrypted Params:', decryptedObj);
                this.CompanyId = decryptedObj.company_id || 0;
            }
        });

        this.columns = [
            {columnDef: 'ID',header: 'ID',cell: (element: any) => `${element?.Id}`,},
            {columnDef: 'Name',header: 'Name',cell: (element: any) =>`${element?.VideoCategoryTranslations[0]?.Name}`,},
            {columnDef: 'Decription',header: 'Decription',cell: (element: any) =>`${element.VideoCategoryTranslations[0]?.Description}`,},
        ];
    }

    ngOnInit(): void {
        this.languages = this.config?.lang;
        console.log('checklanguaes', this.languages);
        this.getStatues();
        for (let lang of this.languages) {
            this.VideoCategoryTranslations().push(this.createItem());
            this.languageIds.push({ LanguageId: lang.Id });
        }
        this.videoCategoryForm.patchValue({
            VideoCategoryTranslations: this.languageIds,
        });
    }

    VideoCategoryTranslations(): FormArray {
        return this.videoCategoryForm.get('VideoCategoryTranslations',) as FormArray;
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
        console.log(this.statuses);
    }

    Toggleclass(value: any, mode: any) {
        this.formMode = mode;
        this.showVideoCategoryForm = true;
        this.selectedRow = value;
        if (mode === 'edit' || mode === 'view') {
            this.commonService
                .getApi(`VideoCategory/Detail/${value?.Id}`, {})
                .subscribe((res: any) => {
                    this.VideosCategoryEdit = res.data;
                    this.videoCategoryForm.patchValue({
                        ...this.VideosCategoryEdit,
                    });
                    const translationsArray = this.VideoCategoryTranslations();
                    translationsArray.clear();
                    this.languages.forEach((lang: { Id: any }) => {
                        const translation =this.VideosCategoryEdit.VideoCategoryTranslations.find((t: any) => t.LanguagesId === lang.Id,);
                        translationsArray.push(
                            this.formBuilder.group({
                                LanguageId: [lang.Id],
                                Name: [translation ? translation.Name : '',Validators.required],
                                Description: [translation ? translation.Description : ''],
                            }),
                        );
                    });
                    if (mode === 'view') {
                this.videoCategoryForm.disable();
            }
                });
                 
        } else if (mode === 'add') {
        }
    }

    SubmitCategoryForm(form: FormGroup) {
        this.selectedTab = this.tabValidate(form,'VideoCategoryTranslations','Name',);
        if (form.valid) {
            const videoCategoryForm = new FormData();
            videoCategoryForm.append('CategoryId', form.value.CategoryId);
            videoCategoryForm.append('VideoCategoryId', form.value.VideoCategoryId);
            videoCategoryForm.append('StatusId', form.value.StatusId);
            videoCategoryForm.append('VideoCategoryTranslations',JSON.stringify(form.value.VideoCategoryTranslations));
            this.formDataSubmit(this.selectedRow?.Id,videoCategoryForm,'VideoCategory','VideoCategory',{
                    formInitialValues: this.formInitialValues,
                    commonService: this.commonService,
                    router: this.router,
                },
            ).then(() => {
                this.closeCategoryForm();
            });
        }else{
            this.validateAllFormFields(form);
          }
    }
    
    closeCategoryForm() {
        this.showVideoCategoryForm = false;
        this.formMode = '';
        this.videoCategoryForm.reset();
        this.videoCategoryForm.enable();
         this.resetForm();
    }
     resetForm() {
        this.VideoCategoryTranslations().clear();
        this.languageIds = [];
        for (let lang of this.languages) {
            this.VideoCategoryTranslations().push(this.createItem());
            this.languageIds.push({ LanguageId: lang.Id });
        }
        this.videoCategoryForm.patchValue({
            VideoCategoryTranslations: this.languageIds,
        });
        this.selectedTab = 0;
    }
}
