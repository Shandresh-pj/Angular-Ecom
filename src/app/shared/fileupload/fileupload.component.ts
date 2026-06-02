import { Component, ElementRef, Input, Output, ViewChild,EventEmitter, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-fileupload',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss'
})
export class FileuploadComponent {
@Output() ImageEmitValue = new EventEmitter<File>();
   @Output() deleteImage = new EventEmitter<boolean>();
   @ViewChild('fileInput') fileInput!: ElementRef;
   @Input() filedname:any='';
   @Input() Mode:any='';
   @Input() previewUrls: any[] = [];
      urls: any[] = [];
      fileName: any;
      ImageFile: any;
      deletedImage = false;
      isViewMode: boolean = false;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['previewUrls']) {
      this.urls = this.previewUrls || [];
    }
  }

ngOnInit() {
  this.isViewMode = this.Mode?.toLowerCase() === 'view';
}

    detectFiles(event: any) {
        const file: File = event.target.files[0];
        this.fileName = file.name;
        const formData = new FormData();
        this.ImageFile = file;
        this.urls = [];
        this.deletedImage=false;
        let files1 = event.target.files;
        if (files1) {
            for (let file of files1) {
                let reader = new FileReader();
                reader.onload = (e: any) => {
                    this.urls.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
        this.ImageEmitValue.emit(this.ImageFile)
    }

    deleteimage(url: string) {
        this.urls = this.urls.filter((u) => u !== url);
        this.deletedImage=true;
          this.deleteImage.emit(true);
          if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
    }
    }

}
