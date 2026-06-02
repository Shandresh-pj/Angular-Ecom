import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { StatusService } from '../../core/service/status.service';
import { MatSelectModule } from '@angular/material/select';
import { ConfiglangService } from '../../core/service/configlang.service';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatTableComponent, MatCard, MatIcon, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, QuillComponent, MatSelectModule, MatTabsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent extends Utils implements OnInit {

  CompanyId: any;
  isToggled: any;
  @ViewChild('mattablechild') mattablechild!: MatTableComponent;
  public action = { add: true, edit: true, view: true, delete: true };
  columns: any;
  productLanguage: any = {};
  showProductsForm = false;
  productsForm!: FormGroup;
  formMode: any;
  producturls: any[] = [];
  productsfileName: any;
  productsImageFile: any;
  productTypes: any;
  productTypeKeys: any;
  statuses: any;
  category: any;
  selectedTab: any = 0;
  public apiRoute = 'Product';
  public uiPagePath = 'products';
  public languages: any;
  languageIds: any = [];
  getdetailproducts: any;
  productattribute: any;

  // FIX: per-row attribute values map instead of a single shared array
  getproductattributevalues: { [index: number]: any[] } = {};

  deletedImage = false;
  getresellers: any;

  constructor(
    private formBuilder: FormBuilder,
    public themeService: CustomizerSettingsService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public statusService: StatusService,
    private config: ConfiglangService,
    private router: Router,
    public userService: UserService,
    private encryptionService: EncryptionService
  ) {
    super();
    this.productsForm = this.formBuilder.group({
      Id: [''],
      Code: ['', Validators.required],
      ResellerId: ['', Validators.required],
      CategoryIds: ['', Validators.required],
      ProductType: ['', Validators.required],
      Points: ['', Validators.required],
      IsAllowNegativeStock: ['', Validators.required],
      StockInHand: ['', Validators.required],
      ProductTranslations: this.formBuilder.array([]),
      ProductVariants: this.formBuilder.array([]),
    });

    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      const encryptedData = params['data'];
      this.CompanyId = params['company_id'] || 0;
      if (encryptedData) {
        const decryptedObj = this.encryptionService.decrypt(encryptedData);
        console.log('Decrypted Params:', decryptedObj);
        this.CompanyId = decryptedObj.company_id || 0;
      }
    });

    this.columns = [
      {
        columnDef: 'ID',
        header: 'ID',
        cell: (element: any) => `${element?.Id ?? element?.id ?? ''}`,
      },
      {
        columnDef: 'Name',
        header: 'Name',
        cell: (element: any) => {
          if (element.ProductTranslations && element.ProductTranslations.length > 0) {
            return element.ProductTranslations[0]?.Name || element.ProductTranslations[1]?.Name || '';
          }
          return element.name || '';
        }
      },
      {
        columnDef: 'Decription',
        header: 'Description',
        cell: (element: any) => {
          if (element.ProductTranslations && element.ProductTranslations.length > 0) {
            return (element.ProductTranslations[0]?.Description || element.ProductTranslations[1]?.Description || '')
              .replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
          }
          return (element.description || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        }
      },
      {
        columnDef: 'Price',
        header: 'Price',
        cell: (element: any) => element?.price !== undefined ? `${element.price}` : '',
      },
      {
        columnDef: 'DiscountPrice',
        header: 'Discount Price',
        cell: (element: any) => element?.discount_price !== undefined ? `${element.discount_price}` : '',
      },
      {
        columnDef: 'Coupon',
        header: 'Coupon',
        cell: (element: any) => element?.coupon ? `${element.coupon.code} (${element.coupon.type === 'flat' ? 'Flat' : 'Percent'} ${element.coupon.value})` : '-',
      },
      {
        columnDef: 'StatusToggle',
        header: 'Status',
        cell: (element: any) => element?.Status || element?.status || 'ACTIVE',
        statusOn:  'APPROVED',         // checked  = Approved
        statusOff: 'ACTIVE',           // unchecked = Active
        toggleUrl: 'Product/Update',   // calls POST /Product/Update/:Id
      },
      {
        columnDef: 'CreatedDate',
        header: 'Created Date',
        cell: (element: any) =>
          `${this.datePipe.transform(element.CreatedAt || element.created_at, 'MMM dd, yyyy') || ''}`,
      },
    ];
  }

  ngOnInit(): void {
    this.languages = this.config?.lang;
    console.log('checklanguaes', this.languages);
    this.getCategory();
    this.getReseller();
    for (let lang of this.languages) {
      this.ProductTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id });
    }
    this.productsForm.patchValue({
      ProductTranslations: this.languageIds
    });
  }

  ProductTranslations(): FormArray {
    return this.productsForm.get('ProductTranslations') as FormArray;
  }

  ProductVariants(): FormArray {
    return this.productsForm.get('ProductVariants') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      LanguageId: [''],
      Name: ['', Validators.required],
      Description: [''],
    });
  }

  getCategory() {
    const params = { Feature: 'true', All: 'true' };
    this.commonService.getApi('Category/All', params).subscribe((res: any) => {
      this.category = res?.data?.data.map((item: any) => ({
        ...item,
        Name: item?.CategoryTranslations?.[0]?.Name
      }));
      console.log('category', this.category);
    });
  }

  getReseller() {
    this.commonService.getApi('User/All', { UserType: 'Reseller' }).subscribe({
      next: (res: any) => {
        this.getresellers = res?.data?.data;
      },
      error: (err: any) => {
        this.getresellers = [];
        console.log('checkReseller', err?.error?.message);
      }
    });
  }

  getProductAttribute() {
    this.commonService.getApi('ProductAttribute/All').subscribe({
      next: (res: any) => {
        this.productattribute = res?.data?.data.map((item: any) => ({
          ...item,
          Name: item?.ProductAttributeTranslations?.[0]?.Name
        }));
      },
      error: (err: any) => {
        this.productattribute = [];
        console.log('checkProductAttribute', err?.error?.message);
      }
    });
  }

  // FIX: now receives the row index so each row gets its own values list
  Attributeselectvalue(attributeId: any, rowIndex: number) {
    console.log('checkevent', attributeId, 'row:', rowIndex);
    this.getProductAttributeValueForRow(attributeId, rowIndex);
  }

  // FIX: fetches and stores values per row index
  getProductAttributeValueForRow(id: any, rowIndex: number) {
    const params = id ? { ProductAttributeId: id } : {};
    this.commonService.getApi('ProductAttributeValue/All', params).subscribe({
      next: (res: any) => {
        this.getproductattributevalues[rowIndex] = res?.data?.data.map((item: any) => ({
          ...item,
          Name: item?.ProductAttributeValueTranslations?.[0]?.Name
        }));
      },
      error: (err: any) => {
        this.getproductattributevalues[rowIndex] = [];
        console.log('checkProductAttributeValue', err?.error?.message);
      }
    });
  }

  // FIX: initialise empty values list for the new row
  addVarients(): void {
    const newIndex = this.ProductVariants().length;
    this.ProductVariants().push(this.createVarients());
    this.getproductattributevalues[newIndex] = [];
  }

  RemoveVarients(index: any) {
    const control = this.ProductVariants().at(index);
    console.log('checkwork', control);
    if (control.value.ProductVariantCode) {
      // existing record → mark delete
      control.patchValue({ Flag: 'D' });
    } else {
      // new record → remove
      this.ProductVariants().removeAt(index);
      // FIX: rebuild the map so indices stay in sync after removal
      this.rebuildAttributeValuesMap();
    }
  }

  // FIX: rebuilds the per-row map after a row is removed so indices stay correct
  private rebuildAttributeValuesMap() {
    const newMap: { [index: number]: any[] } = {};
    this.ProductVariants().controls.forEach((ctrl, idx) => {
      newMap[idx] = this.getproductattributevalues[idx] ?? [];
    });
    this.getproductattributevalues = newMap;
  }

  createVarients(data: any = {}): FormGroup {
    return this.formBuilder.group({
      Id: [data.Id || ''],
      ProductVariantCode: [data.ProductVariantCode || ''],
      Price: [data.Price || ''],
      Stock: [data.Stock || ''],
      ProductAttributeId: [data.ProductAttributeId || ''],
      ProductAttributeValueId: [data.ProductAttributeValueId || ''],
      Flag: [data.Flag || 'N']
    });
  }

  Toggleclass(value: any, mode: any) {
    this.formMode = mode;
    this.showProductsForm = true;
    this.producturls = [];
    // FIX: reset per-row map whenever the form opens
    this.getproductattributevalues = {};

    if (mode === 'edit' || mode === 'view') {
      this.commonService.getApi(`products/${value?.Id || value?.id}`).subscribe((res: any) => {
        this.getdetailproducts = res?.product || res?.data || res;

        if (this.getdetailproducts?.UploadImage) {
          this.producturls.push(`${environment.domain}/${this.getdetailproducts.UploadImage}`);
        }

        const categoryIds = this.getdetailproducts?.ProductCategory?.map((pc: any) => pc.CategoryId) || [];
        console.log('Extracted Category IDs:', categoryIds);

        if (this.getdetailproducts?.ProductType?.toLowerCase() === 'variant') {
          this.getProductAttribute();
        }

        this.getReseller();

        this.productsForm.patchValue({
          ...this.getdetailproducts,
          Id: this.getdetailproducts?.id || this.getdetailproducts?.Id,
          CategoryIds: categoryIds
        });

        // Rebuild translations
        this.ProductTranslations().clear();
        for (let i = 0; i < this.getdetailproducts?.ProductTranslations.length; i++) {
          this.ProductTranslations().push(this.formBuilder.group({
            LanguageId: this.getdetailproducts?.ProductTranslations[i].LanguagesId,
            Name: this.getdetailproducts?.ProductTranslations[i].Name,
            Description: this.getdetailproducts?.ProductTranslations[i].Description,
          }));
        }

        this.productLanguage = {};
        this.getdetailproducts?.ProductTranslations.map((cat: any) => {
          this.productLanguage[cat?.LanguagesId] = cat;
        });

        // FIX: rebuild variants with per-row attribute value pre-loading
        this.ProductVariants().clear();
        this.getproductattributevalues = {};

        if (this.getdetailproducts?.ProductVariant?.length > 0) {
          this.getdetailproducts.ProductVariant.forEach((v: any, idx: number) => {
            const attrId = v.ProductVariantAttributes?.[0]?.ProductAttributeId;
            const attrValId = v.ProductVariantAttributes?.[0]?.ProductAttributeValueId;

            this.ProductVariants().push(
              this.createVarients({
                Id: v.Id,
                ProductVariantCode: v.ProductVariantCode,
                Price: v.Price,
                Stock: v.Stock,
                ProductAttributeId: attrId,
                ProductAttributeValueId: attrValId,
                Flag: 'U'
              })
            );

            // FIX: pre-fetch attribute values for each existing variant row
            if (attrId) {
              this.getProductAttributeValueForRow(attrId, idx);
            } else {
              this.getproductattributevalues[idx] = [];
            }
          });

        } else if (this.getdetailproducts?.ProductType?.toLowerCase() === 'variant') {
          // variant type but no existing variants → add one blank row
          this.ProductVariants().push(this.createVarients());
          this.getproductattributevalues[0] = [];
        }

        if (mode === 'view') {
          this.productsForm.disable();
        }
      });

    } else if (mode === 'add') {
      this.ProductVariants().clear();
      this.ProductVariants().push(this.createVarients());
      this.getproductattributevalues[0] = [];
    }
  }

  ProductdetectFiles(event: any) {
    const file: File = event.target.files[0];
    this.productsfileName = file.name;
    this.productsImageFile = file;
    this.producturls = [];
    let files1 = event.target.files;
    this.deletedImage = false;
    if (files1) {
      for (let file of files1) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.producturls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  deleteproductImage(url: string) {
    this.producturls = this.producturls.filter(u => u !== url);
    this.deletedImage = true;
  }

  getStatues() {
    this.statuses = this.statusService.getStatus('COMMON');
    console.log(this.statuses);
  }

  productType(event: any) {
    console.log('checkproducevnt', event);
    if (event === 'Variant') {
      this.getProductAttribute();
      if (this.ProductVariants().length === 0) {
        this.ProductVariants().push(this.createVarients());
        this.getproductattributevalues[0] = [];
      }
    } else {
      this.ProductVariants().clear();
      // FIX: reset map when switching away from Variant
      this.getproductattributevalues = {};
    }
  }

  updateDescription(value: string, index: number) {
    const current = this.ProductTranslations().at(index).get('Description')?.value;
    if (current !== value) {
      this.ProductTranslations().at(index).patchValue({ Description: value });
    }
  }

  onDelete(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#602F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteApi(`products/${element?.Id || element?.id}`).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Product deleted successfully.',
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

  SubmitProductForm(form: FormGroup) {
    console.log('checkvale', form.value);
    this.selectedTab = this.tabValidate(form, 'ProductTranslations', 'Name');
    if (form.valid) {
      const formData = new FormData();

      if (this.productsImageFile) {
        formData.append('UploadImage_', this.productsImageFile);
        console.log('UploadImage', this.productsImageFile);
      }
      if (this.deletedImage) {
        formData.append('UploadImage', '');
      }

      const payload = {
        ...form.value,
        ProductFeatures: [],
        ProductCombos: [],
        BrandIds: []
      };

      for (var key in payload) {
        const value = payload[key];
        if (value === null || value === undefined) {
          continue;
        }
        if (Array.isArray(payload[key])) {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }

      this.formDataSubmit(
        this.productsForm.value.Id,
        formData,
        this.productsForm,
        this.apiRoute,
        {
          redirect: '/' + this.uiPagePath,
          formInitialValues: this.formInitialValues,
          commonService: this.commonService,
          router: this.router
        }
      ).then(() => {
        this.closeProductForm();
      });

    } else {
      this.validateAllFormFields(form);
    }
  }

  closeProductForm() {
    this.showProductsForm = false;
    this.formMode = '';
    this.producturls = [];
    // FIX: reset per-row map on close
    this.getproductattributevalues = {};
    this.productsForm.enable();
    this.productsForm.reset();
    this.resetForm();
  }

  resetForm() {
    this.ProductTranslations().clear();
    this.ProductVariants().clear();
    this.languageIds = [];
    // FIX: reset per-row map on reset
    this.getproductattributevalues = {};

    for (let lang of this.languages) {
      this.ProductTranslations().push(this.createItem());
      this.languageIds.push({ LanguageId: lang.Id });
    }

    this.productsForm.patchValue({
      Points: 0,
      ProductTranslations: this.languageIds
    });

    this.producturls = [];
    this.productsImageFile = null;
    this.productsfileName = null;
    this.selectedTab = 0;
    this.deletedImage = false;
  }
}