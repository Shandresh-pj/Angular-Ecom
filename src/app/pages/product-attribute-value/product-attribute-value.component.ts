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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product-attribute-value',
  standalone: true,
  imports: [MatTableComponent, MatCard, MatIcon, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, MatTabsModule, MatError, MatSelectModule],
  templateUrl: './product-attribute-value.component.html',
  styleUrl: './product-attribute-value.component.scss'
})
export class ProductAttributeValueComponent extends Utils implements OnInit {

  CompanyId: any;
  isToggled: any;
  @ViewChild('mattablechild') mattablechild!: MatTableComponent;
  public action = { add: true, edit: true, view: true, delete: true };
  columns: any;
  showProAttributeValueForm = false;
  proattributevalueForm!: FormGroup;
  formMode: any;
  public languages: any;
  languageIds: any = [];
  selectedTab: any = 0;
  attriLanguage: any = {};
  public apiRoute = 'ProductAttributeValue';
  public uiPagePath = 'product-attribute-value';
  getdetailproattributevalue: any;
  getAttrivalue: any;
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
    this.proattributevalueForm = this.formBuilder.group({
      Id: [''],
      ProductAttributeId: ['', Validators.required],
      AttributeValueCode: ['', Validators.required],
      ProductAttributeValueTranslations: this.formBuilder.array([]),
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
        columnDef: 'AttributeValueCode',
        header: 'Attribute Value Code',
        cell: (element: any) => `${element?.AttributeValueCode}`,
      },
      {
        columnDef: 'Name',
        header: 'Name',
        cell: (element: any) => `${element?.ProductAttributeValueTranslations[0]?.Name ? element?.ProductAttributeValueTranslations[0]?.Name : element?.ProductAttributeValueTranslations[1]?.Name}`,
      },
    ];
  }

  ngOnInit(): void {
    this.languages = this.config?.lang;
    console.log('checklanguaes', this.languages)
    for (let lang of this.languages) {
      this.ProductAttributeValueTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id })
    }
    this.proattributevalueForm.patchValue({
      ProductAttributeValueTranslations: this.languageIds
    });
    this.getAttribute();
  }

  ProductAttributeValueTranslations(): FormArray {
    return this.proattributevalueForm.get('ProductAttributeValueTranslations') as FormArray;
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      LanguageId: [''],
      Name: ['', Validators.required],
    });
  }
  getAttribute() {
    this.commonService.getApi('ProductAttribute/All').subscribe({
      next: (res: any) => {
        this.getAttrivalue = res?.data?.data.map((item:any)=>({
          ...item,
          Name:item?.ProductAttributeTranslations?.[0]?.Name
        }));
        this.cdr.detectChanges();
      }, error: (err: any) => {
        console.error('ProductAttribute All Error:', err?.error?.message);
        this.getAttrivalue = [];
      }
    }
    )
  }


  Toggleclass(value: any, mode: any) {
    this.formMode = mode;
    this.showProAttributeValueForm = true;
    if (mode === 'edit' || mode === 'view') {
      this.commonService.getApi(`ProductAttributeValue/Detail/${value?.Id}`,).subscribe((res: any) => {
        this.getdetailproattributevalue = res?.data;
        this.proattributevalueForm.patchValue({
          ...this.getdetailproattributevalue,
          ProductAttributeId: this.getdetailproattributevalue?.ProductAttributeId
        });
        this.ProductAttributeValueTranslations().clear();
        for (let lang of this.languages) {
          this.ProductAttributeValueTranslations().push(this.formBuilder.group({
            LanguageId: lang.Id,
            Name: this.getdetailproattributevalue?.Name || this.getdetailproattributevalue?.name || '',
          }));
        }
        this.attriLanguage = {};
        if (mode === 'view') {
        this.proattributevalueForm.disable();
      }
      });
      
    } else if (mode === 'add') {

    }
  }


  SubmitProAttributeValueForm(form: FormGroup) {
    this.selectedTab = this.tabValidate(form, 'ProductAttributeValueTranslations', 'Name');
    if (form.valid) {
      this.formSubmit(form, this.proattributevalueForm, this.apiRoute, { redirect: '/' + this.uiPagePath, formInitialValues: this.formInitialValues, commonService: this.commonService, router: this.router })
        .then(() => {
          this.closeProAttributeValueForm();
        })
    } else {
      this.validateAllFormFields(form);
    }

  }
  closeProAttributeValueForm() {
    this.showProAttributeValueForm = false;
    this.formMode = '';
    this.proattributevalueForm.enable();
    this.proattributevalueForm.reset();
    this.resetForm();
  }
  resetForm() {
    this.ProductAttributeValueTranslations().clear();
    this.languageIds = [];
    for (let lang of this.languages) {
      this.ProductAttributeValueTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id });
    }
    this.proattributevalueForm.patchValue({
      ProductAttributeValueTranslations: this.languageIds
    });
    this.selectedTab = 0;
  }

  onDelete(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this product attribute value?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#602F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteApi(`ProductAttributeValue/${element?.Id || element?.id}`).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Product attribute value deleted successfully.',
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


