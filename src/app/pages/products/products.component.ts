import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../core/service/common.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/service/auth.service';
import Swal from 'sweetalert2';

/**
 * Wired to the actual backend contract (New-E-Commerce-Backend):
 *   GET    /api/products?page=&limit=&status=&product_type=&category=&search=
 *   GET    /api/products/:id
 *   POST   /api/products/add        (multipart/form-data)
 *   PUT    /api/products/:id        (multipart/form-data)
 *   DELETE /api/products/:id
 * Product fields are lowercase (name, price, stock, category, product_type,
 * stock_in_hand, status, barcode) — there is no multi-language translation
 * table on this backend, unlike the reference contract this component
 * previously targeted. `stock` is required by the backend but hidden here —
 * it's kept in sync with `stock_in_hand` since the UI only exposes one
 * stock field.
 *
 * Variants follow the ProductVariant contract exactly: one row per
 * attribute/value with its own Barcode/Price/Stock
 *   { Id, CompanyId, ProductId, Barcode, Price, Stock, ProductAttributeId, ProductAttributeValueId }
 * On update, the backend replaces the variant set: rows with a matching Id
 * are updated, rows without Id are inserted, and existing rows missing from
 * the submitted array are deleted.
 */
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

  isToggled: any;
  @ViewChild('mattablechild') mattablechild!: MatTableComponent;
  public action = { add: true, edit: true, view: true, delete: true };
  columns: any;
  showProductsForm = false;
  productsForm!: FormGroup;
  formMode: any;
  // Already-persisted gallery URLs (relative paths, e.g. /uploads/images/x.webp)
  existingImageUrls: string[] = [];
  // Newly picked files for this session, with data-URL previews kept in lockstep by index
  productsImageFiles: File[] = [];
  newImagePreviews: string[] = [];
  videoFile: File | null = null;
  videoFileName: string = '';
  videoUrl: string = '';
  category: any;  
  selectedTab: any = 0;
  public uiPagePath = 'products';
  getdetailproducts: any;
  productattribute: any;

  // per-row attribute values map (row index -> ProductAttributeValue[])
  getproductattributevalues: { [index: number]: any[] } = {};

  constructor(
    private formBuilder: FormBuilder,
    public themeService: CustomizerSettingsService,
    private commonService: CommonService,
    private authService: AuthService,
    private router: Router,
  ) {
    super();
    this.productsForm = this.formBuilder.group({
      Id: [''],
      name: ['', Validators.required],
      description: [''],
      category: [''],
      price: ['', Validators.required],
      // `stock` is required by the backend but no longer shown in the UI —
      // it's kept in sync with stock_in_hand below.
      stock: [0],
      stock_in_hand: ['', Validators.required],
      barcode: [''],
      product_type: ['simple', Validators.required],
      status: ['active', Validators.required],
      registration_id: [this.authService.fetchUserDetails()?.user?.id || ''],
      variants: this.formBuilder.array([]),
    });

    this.productsForm.get('stock_in_hand')?.valueChanges.subscribe((value) => {
      this.productsForm.get('stock')?.setValue(value, { emitEvent: false });
    });

    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
    });

    this.columns = [
      {
        columnDef: 'ID',
        header: 'ID',
        cell: (element: any) => `${element?.id ?? ''}`,
      },
      {
        columnDef: 'Name',
        header: 'Name',
        cell: (element: any) => element?.name || '',
      },
      {
        columnDef: 'Category',
        header: 'Category',
        cell: (element: any) => element?.category || '',
      },
      {
        columnDef: 'Price',
        header: 'Price',
        cell: (element: any) => element?.price !== undefined ? `${element.price}` : '',
      },
      {
        columnDef: 'StockInHand',
        header: 'Stock In Hand',
        cell: (element: any) => element?.stock_in_hand !== undefined ? `${element.stock_in_hand}` : '',
      },
      {
        columnDef: 'ProductType',
        header: 'Product Type',
        cell: (element: any) => element?.product_type === 'simple' ? 'Single' : element?.product_type === 'variant' ? 'Variant' : '',
      },
      {
        columnDef: 'Status',
        header: 'Status',
        cell: (element: any) => element?.status || '',
      },
      {
        columnDef: 'CreatedDate',
        header: 'Created Date',
        cell: (element: any) => this.formatCreatedDate(element?.created_at),
      },
    ];
  }

  ngOnInit(): void {
    this.getCategory();
  }

  // Backend sends created_at/updated_at as "DD:MM:YYYY HH:mm:ss", which the
  // Date constructor / DatePipe can't parse directly — parse it manually.
  formatCreatedDate(value: string): string {
    if (!value) return '';
    const match = /^(\d{2}):(\d{2}):(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(value);
    if (!match) return value;
    const [, day, month, year, hours, minutes, seconds] = match;
    const date = new Date(
      Number(year), Number(month) - 1, Number(day),
      Number(hours), Number(minutes), Number(seconds)
    );
    return this.datePipe.transform(date, 'MMM dd, yyyy') || '';
  }

  ProductVariants(): FormArray {
    return this.productsForm.get('variants') as FormArray;
  }

  getCategory() {
    this.commonService.getApi('categories').subscribe({
      next: (res: any) => {
        this.category = Array.isArray(res?.data) ? res.data : [];
      },
      error: () => {
        this.category = [];
      }
    });
  }

  getProductAttribute() {
    this.commonService.getApi('ProductAttribute/All').subscribe({
      next: (res: any) => {
        this.productattribute = res?.data?.data.map((item: any) => ({
          ...item,
          Name: item?.ProductAttributeTranslations?.[0]?.Name || item?.Name
        }));
      },
      error: (err: any) => {
        this.productattribute = [];
        console.log('checkProductAttribute', err?.error?.message);
      }
    });
  }

  Attributeselectvalue(attributeId: any, rowIndex: number) {
    this.getProductAttributeValueForRow(attributeId, rowIndex);
  }

  getProductAttributeValueForRow(id: any, rowIndex: number) {
    const params = id ? { ProductAttributeId: id } : {};
    this.commonService.getApi('ProductAttributeValue/All', params).subscribe({
      next: (res: any) => {
        this.getproductattributevalues[rowIndex] = res?.data?.data.map((item: any) => ({
          ...item,
          Name: item?.ProductAttributeValueTranslations?.[0]?.Name || item?.Name
        }));
      },
      error: (err: any) => {
        this.getproductattributevalues[rowIndex] = [];
        console.log('checkProductAttributeValue', err?.error?.message);
      }
    });
  }

  addVarients(): void {
    const newIndex = this.ProductVariants().length;
    this.ProductVariants().push(this.createVarients());
    this.getproductattributevalues[newIndex] = [];
  }

  RemoveVarients(index: any) {
    this.ProductVariants().removeAt(index);
    this.rebuildAttributeValuesMap();
  }

  private rebuildAttributeValuesMap() {
    const newMap: { [index: number]: any[] } = {};
    this.ProductVariants().controls.forEach((_ctrl, idx) => {
      newMap[idx] = this.getproductattributevalues[idx] ?? [];
    });
    this.getproductattributevalues = newMap;
  }

  createVarients(data: any = {}): FormGroup {
    return this.formBuilder.group({
      Id: [data.Id || ''],
      CompanyId: [data.CompanyId || 0],
      Barcode: [data.Barcode || ''],
      Price: [data.Price || '', Validators.required],
      Stock: [data.Stock || '', Validators.required],
      ProductAttributeId: [data.ProductAttributeId || '', Validators.required],
      ProductAttributeValueId: [data.ProductAttributeValueId || '', Validators.required],
    });
  }

  mediaUrl(path: string): string {
    return `${environment.domain.replace('/api', '')}${path}`;
  }

  Toggleclass(value: any, mode: any) {
    this.formMode = mode;
    this.showProductsForm = true;
    this.existingImageUrls = [];
    this.productsImageFiles = [];
    this.newImagePreviews = [];
    this.videoFile = null;
    this.videoFileName = '';
    this.videoUrl = '';
    this.getproductattributevalues = {};

    if (mode === 'edit' || mode === 'view') {
      this.commonService.getApi(`products/${value?.id}`).subscribe((res: any) => {
        const { variants, ...productFields } = res?.data || {};
        this.getdetailproducts = res?.data;

        const domainUrl = environment.domain.replace('/api', '');
        // `image` (cover) is derived from images[0] on the backend when not
        // set explicitly, but fall back to including it here too in case
        // the product was created elsewhere with only a standalone cover.
        this.existingImageUrls = Array.isArray(productFields?.images)
          ? [...productFields.images]
          : [];
        if (productFields?.image && !this.existingImageUrls.includes(productFields.image)) {
          this.existingImageUrls.unshift(productFields.image);
        }

        if (productFields?.video) {
          this.videoUrl = `${domainUrl}${productFields.video}`;
          this.videoFileName = productFields.video.split('/').pop() || 'video';
        }

        if (productFields?.product_type === 'variant') {
          this.getProductAttribute();
        }

        this.productsForm.patchValue({
          ...productFields,
          Id: productFields?.id,
        });

        this.ProductVariants().clear();
        this.getproductattributevalues = {};

        if (Array.isArray(variants) && variants.length > 0) {
          variants.forEach((v: any, idx: number) => {
            this.ProductVariants().push(
              this.createVarients({
                Id: v.Id,
                CompanyId: v.CompanyId,
                Barcode: v.Barcode,
                Price: v.Price,
                Stock: v.Stock,
                ProductAttributeId: v.ProductAttributeId,
                ProductAttributeValueId: v.ProductAttributeValueId,
              })
            );
            if (v.ProductAttributeId) {
              this.getProductAttributeValueForRow(v.ProductAttributeId, idx);
            } else {
              this.getproductattributevalues[idx] = [];
            }
          });
        } else if (productFields?.product_type === 'variant') {
          this.ProductVariants().push(this.createVarients());
          this.getproductattributevalues[0] = [];
        }

        if (mode === 'view') {
          this.productsForm.disable();
        }
      });

    } else if (mode === 'add') {
      this.ProductVariants().clear();
      this.getproductattributevalues = {};
    }
  }

  ProductdetectFiles(event: any) {
    const files = Array.from(event.target.files as FileList) as File[];
    files.forEach((file: File) => {
      const idx = this.productsImageFiles.length;
      this.productsImageFiles.push(file);
      this.newImagePreviews.push('');
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // indexed assignment keeps previews aligned with productsImageFiles
        // even if reads complete out of order
        this.newImagePreviews[idx] = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  removeExistingImage(index: number) {
    this.existingImageUrls.splice(index, 1);
  }

  removeNewImage(index: number) {
    this.productsImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  VideoDetectFile(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.videoFile = file;
      this.videoFileName = file.name;
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.videoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  productType(event: any) {
    if (event === 'variant') {
      this.getProductAttribute();
      if (this.ProductVariants().length === 0) {
        this.ProductVariants().push(this.createVarients());
        this.getproductattributevalues[0] = [];
      }
    } else {
      this.ProductVariants().clear();
      this.getproductattributevalues = {};
    }
  }

  updateDescription(value: string) {
    this.productsForm.patchValue({ description: value }, { emitEvent: false });
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
        this.commonService.deleteApi(`products/${element?.id}`).subscribe({
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
    if (form.invalid) {
      this.validateAllFormFields(form);
      return;
    }

    const formData = new FormData();

    // Each newly picked file is sent exactly once, as part of the gallery —
    // the backend derives the cover image from images[0] automatically.
    this.productsImageFiles.forEach((file: File) => {
      formData.append('images', file);
    });
    // Tells the backend which already-saved gallery images to keep (lets
    // edit actually replace/shrink the gallery instead of only appending).
    if (this.formMode === 'edit') {
      formData.append('existing_images', JSON.stringify(this.existingImageUrls));
    }
    if (this.videoFile) {
      formData.append('video', this.videoFile);
    }

    const { variants, Id, ...rest } = form.value;

    Object.keys(rest).forEach((key) => {
      const value = rest[key];
      if (value === null || value === undefined || value === '') return;
      formData.append(key, value);
    });

    if (rest.product_type === 'variant') {
      formData.append('variants', JSON.stringify(variants || []));
    }

    this.showLoader = true;

    const request$ = Id
      ? this.commonService.putFormData(`products/${Id}`, formData)
      : this.commonService.postFormData('products/add', formData);

    request$.subscribe({
      next: () => {
        this.showLoader = false;
        Swal.fire({
          icon: 'success',
          title: Id ? 'Updated Successfully' : 'Added Successfully',
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        }).then(() => {
          this.closeProductForm();
          this.mattablechild.getData();
        });
      },
      error: (err: any) => {
        this.showLoader = false;
        this.errorAlert(err);
      }
    });
  }

  closeProductForm() {
    this.showProductsForm = false;
    this.formMode = '';
    this.existingImageUrls = [];
    this.getproductattributevalues = {};
    this.productsForm.enable();
    this.resetForm();
  }

  resetForm() {
    this.ProductVariants().clear();
    this.getproductattributevalues = {};

    this.productsForm.reset({
      Id: '',
      name: '',
      description: '',
      category: '',
      price: '',
      stock: 0,
      stock_in_hand: '',
      barcode: '',
      product_type: 'simple',
      status: 'active',
      registration_id: this.authService.fetchUserDetails()?.user?.id || '',
      variants: [],
    });

    this.existingImageUrls = [];
    this.productsImageFiles = [];
    this.newImagePreviews = [];
    this.videoFile = null;
    this.videoFileName = '';
    this.videoUrl = '';
    this.selectedTab = 0;
  }

  deleteVideoFile() {
    this.videoFile = null;
    this.videoFileName = '';
    this.videoUrl = '';
  }
}
