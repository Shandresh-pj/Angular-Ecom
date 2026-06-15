import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-fileupload',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss'
})
export class FileuploadComponent {

  @Output() ImageEmitValue = new EventEmitter<File | File[]>();
  @Output() deleteImage = new EventEmitter<boolean>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() filedname: any = '';
  @Input() Mode: any = '';
  @Input() previewUrls: any[] = [];

  // NEW
  @Input() multiple: boolean = false;

  urls: any[] = [];
  fileName: any;
  ImageFile: any;
  deletedImage = false;
  isViewMode = false;

  ngOnInit() {
    this.isViewMode = this.Mode?.toLowerCase() === 'view';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['previewUrls']) {
      this.urls = this.previewUrls || [];
    }
  }

  detectFiles(event: any): void {

    const files: FileList = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    this.urls = [];
    this.deletedImage = false;

    const selectedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      selectedFiles.push(file);

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.urls.push(e.target.result);
      };

      reader.readAsDataURL(file);

    }

    if (this.multiple) {
      this.ImageEmitValue.emit(selectedFiles);
    } else {
      this.ImageEmitValue.emit(selectedFiles[0]);
    }
  }

  deleteimage(url: string): void {

    this.urls = this.urls.filter(
      (u) => u !== url
    );

    this.deletedImage = true;

    this.deleteImage.emit(true);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

  }

}