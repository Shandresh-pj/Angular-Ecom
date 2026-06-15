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
  @Output() deleteImage = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() filedname: any = '';
  @Input() Mode: any = '';
  @Input() previewUrls: any[] = [];
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
      this.urls = [...(this.previewUrls || [])];
    }
  }

  detectFiles(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    this.deletedImage = false;

    if (!this.multiple) {
      // Single image: clear existing and show new preview via FileReader
      this.urls = [];
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => { this.urls = [e.target.result]; };
      reader.readAsDataURL(file);
      this.ImageEmitValue.emit(file);
    } else {
      // Multiple images: parent manages URLs via previewUrls, just emit new files
      const selectedFiles: File[] = Array.from(files) as File[];
      this.ImageEmitValue.emit(selectedFiles);
    }
  }

  deleteimage(url: string): void {
    this.urls = this.urls.filter(u => u !== url);
    this.deletedImage = true;
    this.deleteImage.emit(url);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

}
