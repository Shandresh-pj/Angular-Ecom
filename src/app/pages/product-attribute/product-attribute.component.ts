import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { StatusService } from '../../core/service/status.service';
import { ConfiglangService } from '../../core/service/configlang.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-product-attribute',
  standalone: true,
  imports: [MatTableComponent, MatCard, MatIcon, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, MatTabsModule, MatError],
  templateUrl: './product-attribute.component.html',
  styleUrl: './product-attribute.component.scss'
})
export class ProductAttributeComponent extends Utils implements OnInit {

  CompanyId: any;
  isToggled: any;
  @ViewChild('mattablechild') mattablechild!: MatTableComponent;
  public action = { add: true, edit: true, view: true, delete: true };
  columns: any;
  showProAttributeForm = false;
  proattributeForm!: FormGroup;
  formMode: any;
  public languages: any;
  languageIds: any = [];
  selectedTab: any = 0;
  attriLanguage: any = {};
  public apiRoute = 'ProductAttribute';
  public uiPagePath = 'product-attribute';
  getdetailproattribute: any;
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
    private encryptionService: EncryptionService
  ) {
    super();
    this.proattributeForm = this.formBuilder.group({
      Id: [''],
      AttributeNameCode: ['', Validators.required],
      ProductAttributeTranslations: this.formBuilder.array([]),
    })
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
      {
        columnDef: 'ID',
        header: 'ID',
        cell: (element: any) => `${element?.Id}`,
      },
      {
        columnDef: 'AttributeNameCode',
        header: 'Attribute Name Code',
        cell: (element: any) => `${element?.AttributeNameCode}`,
      },
      {
        columnDef: 'Name',
        header: 'Name',
        cell: (element: any) => `${element?.ProductAttributeTranslations[0]?.Name ? element?.ProductAttributeTranslations[0]?.Name : element?.ProductAttributeTranslations[1]?.Name}`,
      },
    ];
  }

  ngOnInit(): void {
    this.languages = this.config?.lang;
    console.log('checklanguaes', this.languages)
    for (let lang of this.languages) {
      this.ProductAttributeTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id })
    }
    this.proattributeForm.patchValue({
      ProductAttributeTranslations: this.languageIds
    });
  }

  ProductAttributeTranslations(): FormArray {
    return this.proattributeForm.get('ProductAttributeTranslations') as FormArray;
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      LanguageId: [''],
      Name: ['', Validators.required],
    });
  }



  Toggleclass(value: any, mode: any) {
    this.formMode = mode;
    this.showProAttributeForm = true;
    if (mode === 'edit' || mode === 'view') {
      this.commonService.getApi(`ProductAttribute/Detail/${value?.Id}`,).subscribe((res: any) => {
        this.getdetailproattribute = res?.data;

        this.proattributeForm.patchValue({
          ...this.getdetailproattribute
        });
        this.ProductAttributeTranslations().clear();
        for (let lang of this.languages) {
          this.ProductAttributeTranslations().push(this.formBuilder.group({
            LanguageId: lang.Id,
            Name: this.getdetailproattribute?.Name || this.getdetailproattribute?.name || '',
          }));
        }
        this.attriLanguage = {};
        if (mode === 'view') {
        this.proattributeForm.disable();
      }
      });
      
    } else if (mode === 'add') {

    }
  }


  SubmitProAttributeForm(form: FormGroup) {
    this.selectedTab = this.tabValidate(form, 'ProductAttributeTranslations', 'Name');
    if (form.valid) {
      this.formSubmit(form, this.proattributeForm, this.apiRoute, { redirect: '/' + this.uiPagePath, formInitialValues: this.formInitialValues, commonService: this.commonService, router: this.router })
        .then(() => {
          this.closeProAttributeForm();
        })
    } else {
      this.validateAllFormFields(form);
    }

  }
  closeProAttributeForm() {
    this.showProAttributeForm = false;
    this.formMode = '';
    this.proattributeForm.enable();
    this.proattributeForm.reset();
    this.resetForm();
  }
  resetForm() {
    this.ProductAttributeTranslations().clear();
    this.languageIds = [];
    for (let lang of this.languages) {
      this.ProductAttributeTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id });
    }
    this.proattributeForm.patchValue({
      ProductAttributeTranslations: this.languageIds
    });
    this.selectedTab = 0;
  }

  onDelete(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this product attribute?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#602F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteApi(`ProductAttribute/${element?.Id || element?.id}`).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Product attribute deleted successfully.',
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

