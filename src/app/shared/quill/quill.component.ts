import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ required for [ngModel]
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-quill',
  standalone: true,
  imports: [QuillModule, CommonModule, FormsModule], // ✅ FormsModule added back
  templateUrl: './quill.component.html',
  styleUrl: './quill.component.scss',
})
export class QuillComponent implements OnInit, OnChanges {
  @Input() label: string = 'Description';
  @Input() placeholder: string = 'Enter description...';
  @Input() description: string = '';
  @Input() Mode: string = '';
  @Output() descriptionChange = new EventEmitter<string>();

  isReadOnly: boolean = false;
  editorContent: string = '';

  ngOnInit(): void {
    this.isReadOnly = this.Mode?.toLowerCase() === 'view';
    this.editorContent = this.description;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['description']) {
      const incoming = changes['description'].currentValue;
      if (incoming !== this.editorContent) {
        this.editorContent = incoming;
      }
    }
  }

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  onContentChange(event: any) {
    if (event.source === 'user') {
      const value = event.html || '';
      if (value !== this.editorContent) {
        this.editorContent = value;
        this.descriptionChange.emit(value);
      }
    }
  }
}