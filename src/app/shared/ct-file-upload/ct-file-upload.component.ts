import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import {
    FileUploadControl,
    FileUploadModule,
    FileUploadValidators,
} from '@iplab/ngx-file-upload';
import Swal from 'sweetalert2';

@Component({
    selector: 'CT-file-upload',
    standalone: true,
    imports: [FileUploadModule],
    templateUrl: './ct-file-upload.component.html',
    styleUrl: './ct-file-upload.component.scss',
})
export class CtFileUploadComponent implements OnChanges{
    // Optional URL to display an existing (old) image.
    @Input() oldImageUrl?: string = '';
    @Input() multiple:boolean=false;
    // Emit the selected file to the parent.
    @Output() fileSelected: EventEmitter<File[]> = new EventEmitter<File[]>();
@Input() isDisabled: boolean = false;
    // Holds the preview data URL of the new file.
    preview: string | null = null;

    private subscription: any;
    public readonly control = new FileUploadControl(
        {
            listVisible: true,
            accept: ['/*'],
            discardInvalid: true,
            multiple: false,
        },
        [
            FileUploadValidators.accept(['/*']),
            FileUploadValidators.filesLimit(10),
        ]
    );

    ngOnInit(): void {
        this.subscription = this.control.valueChanges.subscribe(
            (values: Array<File>) => {
                const maxSize = 5 * 1024 * 1024;
                 if (values.length > 0 && values[0].size > maxSize) {
             Swal.fire({
                 icon: 'warning',
                title: 'File too large',
                text: 'File size exceeds 5MB. Please choose a lessthan 5MB file.',
                }).then(() => {
                  this.control.clear(); 
                //  this.fileSelected.emit([]); 
                });
               return;
             }
                console.log('imaegs', values);
                if(values.length>0)
                this.fileSelected.emit(values)
                // this.getImage(values[0])
            }
        );
    }
    ngOnChanges() {
    if (this.isDisabled) {
        this.control.disable();
    } else {
        this.control.enable();
    }
}

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
    toggleClose() {
        this.control.clear();
        this.preview = null;
        this.fileSelected.emit([]);
    }
}
