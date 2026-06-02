import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { AuthService } from '../../core/service/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../environments/environment';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-videos',
    standalone: true,
    imports: [
        MatTableComponent,
        MatCard,
        MatFormField,
        MatInput,
        MatLabel,
        QuillComponent,
        ReactiveFormsModule,
        MatOption,
        MatSelectModule,
        MatCheckboxModule,
        MatIcon,
        FileuploadComponent
    ],
    templateUrl: './videos.component.html',
    styleUrl: './videos.component.scss',
})
export class VideosComponent extends Utils implements OnInit {
    @ViewChild('videoInput') videoInput!: ElementRef;
    CompanyId: any;
    isToggled: any;
    @ViewChild('mattablechild') mattablechild!: MatTableComponent;
    public action = { add: true, edit: true, view: true, delete: true };
    columns: any;
    userdetails: any;
    companycode: any;
    showVideosForm: boolean = false;
    formMode: string = '';
    selectedRow: any = null;
    VideosForm!: FormGroup;
    VideoCategory: any;
    GetViews: any;
    GetAges: any;
    GetCountry: any;
    GetState: any;
    GetLanguages: any;
    PreviewImageFile: any;
    VideoFile: File | null = null;
    VideosEdit: any;
    imageUrls: any[] = [];
    videoUrls: any[] = [];
deletedImage=false
deleteVideos=false;
currentPageIndex: number = 0;
currentPageSize: number = 10; 
    constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        private encryptionService: EncryptionService,
    ) {
        super();
        this.VideosForm = this.formBuilder.group({
            Id: [''],
            Title: ['',Validators.required],
            Description: [''],
            VideoCategoryId: ['',Validators.required],
            VideoUrl: [''],
            PreviewImage: [''],
            AgeId: ['',Validators.required],
            ViewsId: ['',Validators.required],
            Price: [''],
            PaymentType: [''],
            Duration: [''],
            CountryId: [''],
            StateId: [''],
            LanguagesId: [''],
            Gender: ['',Validators.required],
            Status: ['',Validators.required],
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
            {columnDef: 'Uploaded User',header: 'Uploaded User',cell: (element: any) => `${element?.UploadedUser}`,},
            {columnDef: 'Title',header: 'Title',cell: (element: any) => `${element?.Title}`,},
            // {columnDef: 'Description',header: 'Description',cell: (element: any) =>
            //  element.Description ? element.Description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g,' ',): '',},
             {
                columnDef: 'ViewsCount',
                header: 'Views Count',
                cell: (element: any) => `${element?.VideoViewsCount || 0}`,
              },
            {columnDef: 'VideoCategory',header: 'Category',cell: (element: any) =>`${element.VideoCategoryTranslation?.Name}`,},
            {columnDef: 'PreviewImage',header: 'Image',cell: (element: any) => `${element.PreviewImage}`},
            {
                columnDef: 'StatusToggle',
                header: 'Status',
                cell: (element: any) => element?.Status,
                statusOn: 'APPROVED',   // ← checked state
                statusOff: 'ACTIVE',    // ← unchecked state
            }
        ];
    }
    ngOnInit(): void {
        this.userdetails = this.authService?.fetchUserDetails();
        this.companycode = this.userdetails?.Companys?.CompanyCode;
        this.GetVideoCateory();
        this.getCountry();
        this.getState();
        this.getLanguages();
        this.getMasterData();
    }
    GetVideoCateory() {
        this.commonService
            .getApi(`VideoCategory/All`, {})
            .subscribe(async (res: any) => {
                this.VideoCategory = res?.data?.data;
                this.cdr.detectChanges();
            });
    }
    getMasterData(): void {
        this.commonService.getApi('MasterData/All', {}).subscribe({
            next: (res: any) => {
                const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

                this.GetViews = responseData.filter((item: any) => item.MasterType === 'Views');
                this.GetAges = responseData.filter((item: any) => item.MasterType === 'Age');

                console.log('GetViews',this.GetViews)
                console.log('GetAges',this.GetAges)
            },
            error: (err) => {
                console.error('Error fetching rental location data:', err);
            },
        });
    }

    getCountry(): void {
        this.commonService.getApi('Country/All', {}).subscribe({
            next: (res: any) => {
                const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

                this.GetCountry = responseData

                console.log('GetViews',this.GetViews)
                console.log('GetAges',this.GetAges)
            },
            error: (err) => {
                console.error('Error fetching rental location data:', err);
            },
        });
    }

    getState(): void {
        this.commonService.getApi('State/All', {}).subscribe({
            next: (res: any) => {
                const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

                this.GetState = responseData

            },
            error: (err) => {
                console.error('Error fetching rental location data:', err);
            },
        });
    }

    getLanguages(): void {
        this.commonService.getApi('Languages', {}).subscribe({
            next: (res: any) => {
                const responseData = Array.isArray(res) ? res : [];
                console.log('LanguagesresponseData',responseData)
                this.GetLanguages = responseData

            },
            error: (err) => {
                console.error('Error fetching rental location data:', err);
            },
        });
    }

    onViewsChange(viewId: any) {
        const selectedView = this.GetViews.find((v: any) => v.Id == viewId);
        console.log('selectedView', selectedView);
        if (selectedView) {
            this.VideosForm.patchValue({
                Price: selectedView.Value,
            });
        }
    }
    updateDescription(value: string) {
        // console.log('valuevaluevalue', value);
        this.VideosForm.patchValue({
            Description: value,
        });
        // console.log('valuevaluevalues', this.VideosForm.value);
    }
   
    onImageReceived(file: any) {
  this.PreviewImageFile = file;
  this.deletedImage = false;
}
onDeleteImage(flag: boolean) {
  this.deletedImage = flag;
  if (flag) {
    this.PreviewImageFile = null; 
  }
}
    detectVideoFiles(event: any) {
        const file: File = event.target.files[0];
        this.VideoFile = file;
        this.videoUrls = [];
        if (file) {
            let reader = new FileReader();
            reader.onload = (e: any) => {
                this.videoUrls.push(e.target.result);
                const video = document.createElement('video');
                video.src = e.target.result;
                video.onloadedmetadata = () => {
                    const duration = video.duration;
                    const hours = Math.floor(duration / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = Math.floor(duration % 60);
                    const formatted =String(hours).padStart(2, '0') + ':' +
                        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

console.log('formatted',formatted)
console.log('minutes',minutes,seconds)
                    this.VideosForm.patchValue({
                        Duration: formatted,
                    });
                };
            };
            reader.readAsDataURL(file);
        }
    }
  
    deleteVideo(url: string) {
        this.videoUrls = this.videoUrls.filter((u) => u !== url);
        this.deleteVideos=true;
         if(this.videoInput) this.videoInput.nativeElement.value = '';   
    }
    Toggleclass(value: any, mode: any) {
        console.log('valuevalue', value);
        if (this.mattablechild) {
            this.currentPageIndex = this.mattablechild.currentPageIndex || 0;
            this.currentPageSize = this.mattablechild.pageSize || 10; 
        }

        this.formMode = mode;
        this.selectedRow = value;
        this.showVideosForm = true;
        if (mode === 'edit' || mode === 'view') {
            this.commonService.getApi(`Videos/${value?.Id}`, {}).subscribe((res: any) => {
                    this.VideosEdit = res.data;
                    const PreviewImage =this.VideosEdit?.PreviewImage?.trim() || '';
                    this.imageUrls = PreviewImage ? [`${environment.domain}/${PreviewImage}`] : [];
                    const videoUrl = this.VideosEdit?.VideoUrl?.trim() || '';
                    this.videoUrls = videoUrl ? [`${environment.domain}/${videoUrl}`] : [];
                    this.PreviewImageFile = null;
                    this.VideoFile = null;
                    this.VideosForm.patchValue({
                        ...this.VideosEdit,
                    });
                });
                if (mode === 'view') {
                this.VideosForm.disable();
            }
        } else if (mode === 'add') {
            this.VideosForm.reset();
            this.imageUrls = [];
            this.videoUrls = [];
        }
    }

    closeVideosForm() {
        this.showVideosForm = false;
        this.formMode = '';
        this.selectedRow = null;
        this.imageUrls = [];
            this.videoUrls = [];
         this.VideosForm.reset();
        this.VideosForm.enable();
        setTimeout(() => {
            if (this.mattablechild) {
                this.mattablechild.pageSize = this.currentPageSize; 
                this.mattablechild.getData(undefined, this.currentPageIndex);
            }
        }, 0);
    }

    onDelete(element: any): void {
        Swal.fire({
          title: 'Are you sure?',
          text: 'You want to delete this video?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#602F80',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            this.commonService.deleteApi(`Videos/${element?.Id}`).subscribe({
              next: () => {
                Swal.fire({
                  title: 'Deleted!',
                  text: 'Video deleted successfully.',
                  icon: 'success',
                  confirmButtonColor: '#602F80'
                });
                this.mattablechild.getData();
              },
              error: (err) => {
                // ✅ Show actual API error message
                const errorMessage = err?.error?.message || 'Delete failed. Please try again.';
                Swal.fire({
                  title: 'Error!',
                  text: errorMessage,   // ← Now shows: "Cannot delete this video as it has already been watched by users."
                  icon: 'error',
                  confirmButtonColor: '#602F80'
                });
                console.error('Delete failed:', err);
              }
            });
          }
        });
      }

      SubmitVideosForm(form: FormGroup) {
        if (form.valid) {
          const videoForm = new FormData();
      
          const appendIfValue = (key: string, value: any) => {
            if (value !== null && value !== undefined && value !== '' && value !== 'null') {
              videoForm.append(key, value);
            }
          };
      
          videoForm.append('Title', form.value.Title);
          videoForm.append('VideoCategoryId', form.value.VideoCategoryId);
          videoForm.append('AgeId', form.value.AgeId);
          videoForm.append('ViewsId', form.value.ViewsId);
          videoForm.append('Gender', form.value.Gender);
          videoForm.append('Status', form.value.Status);
      
          appendIfValue('Price', form.value.Price);
          appendIfValue('PaymentType', form.value.PaymentType);
          appendIfValue('Description', form.value.Description);
          appendIfValue('Duration', form.value.Duration);
          appendIfValue('CountryId', form.value.CountryId);
          appendIfValue('StateId', form.value.StateId);
          appendIfValue('LanguagesId', form.value.LanguagesId);
      
          if (this.PreviewImageFile) {
            videoForm.append('PreviewImage', this.PreviewImageFile);
          }
          if (this.VideoFile) {
            videoForm.append('VideoUrl', this.VideoFile);
          }
          if (this.deletedImage) {
            videoForm.append('PreviewImage', '');
          }
          if (this.deleteVideos) {
            videoForm.append('VideoUrl', '');
          }
      
          this.formDataSubmit(this.selectedRow?.Id, videoForm, 'Videos', 'Videos', {
            formInitialValues: this.formInitialValues,
            commonService: this.commonService,
            router: this.router,
          }).then(() => {
            this.closeVideosForm();
          });
        } else {
          this.validateAllFormFields(form);
        }
      }
}
